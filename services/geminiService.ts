import { GoogleGenAI, LiveServerMessage, Modality, Blob, GenerateContentResponse, Type } from '@google/genai';
import { encode, decode, decodeAudioData, createBlob } from '../utils/audioUtils';
import { ConversationTurn, Feedback } from '../types';

export interface LiveSession {
  close: () => void;
}

export interface SessionCallbacks {
    onMessage: (messageData: { user: string; ai: string; isFinal: boolean }) => void;
    onError: (error: string) => void;
    onOpen: () => void;
    onClose: () => void;
    onGoalAchieved: (goal: string) => void;
}

export const startConversation = async (callbacks: SessionCallbacks, systemInstruction: string, targetWpm?: number): Promise<LiveSession> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let mediaStream: MediaStream | null = null;
  let scriptProcessor: ScriptProcessorNode | null = null;
  let sourceNode: MediaStreamAudioSourceNode | null = null;

  // Audio Playback
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const outputNode = outputAudioContext.createGain();
  outputNode.connect(outputAudioContext.destination);
  const sources = new Set<AudioBufferSourceNode>();
  let nextStartTime = 0;

  // Transcription state
  let currentInputTranscription = '';
  let currentOutputTranscription = '';

  const goalRegex = /\[GOAL_COMPLETE: "([^"]+)"\]/g;

  let finalSystemInstruction = `${systemInstruction}\n\nIMPORTANT: You must only speak, understand, and respond in English. Do not attempt to use or translate other languages.`;
  if (targetWpm) {
      finalSystemInstruction += `\n\nThe user has a specific goal to speak at a pace of around ${targetWpm} words per minute (WPM). While your primary role is defined by the scenario, please subtly encourage this pace. You don't need to mention the WPM target directly, but you can model a similar pace in your own speech. This is a secondary objective to the main role-play.`;
  }

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: async () => {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if(inputAudioContext.state === 'suspended') await inputAudioContext.resume();
          if(outputAudioContext.state === 'suspended') await outputAudioContext.resume();

          sourceNode = inputAudioContext.createMediaStreamSource(mediaStream);
          scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob: Blob = createBlob(inputData);
            
            sessionPromise.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            }).catch(e => {
                callbacks.onError(e instanceof Error ? e.message : 'Failed to send audio.');
            });
          };

          sourceNode.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
          callbacks.onOpen();

        } catch (e) {
          const errMessage = e instanceof Error ? e.message : 'Unknown error during setup.';
          if (errMessage.includes('Permission denied')) {
            callbacks.onError('Microphone permission denied. Please allow microphone access in your browser settings.');
          } else {
            callbacks.onError(`Audio setup failed: ${errMessage}`);
          }
        }
      },
      onmessage: async (message: LiveServerMessage) => {
        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData) {
          nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
          const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
          const source = outputAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputNode);
          source.addEventListener('ended', () => sources.delete(source));
          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
          sources.add(source);
        }

        if (message.serverContent?.outputTranscription) {
          const newText = message.serverContent.outputTranscription.text;
          let match;
          while ((match = goalRegex.exec(newText)) !== null) {
              const completedGoal = match[1];
              callbacks.onGoalAchieved(completedGoal);
          }
          currentOutputTranscription += newText;
        }
        if (message.serverContent?.inputTranscription) {
          currentInputTranscription += message.serverContent.inputTranscription.text;
        }

        callbacks.onMessage({
            user: currentInputTranscription,
            ai: currentOutputTranscription.replace(goalRegex, '').trim(),
            isFinal: false,
        });

        if (message.serverContent?.turnComplete) {
            callbacks.onMessage({
                user: currentInputTranscription,
                ai: currentOutputTranscription.replace(goalRegex, '').trim(),
                isFinal: true,
            });
            currentInputTranscription = '';
            currentOutputTranscription = '';
        }

        if (message.serverContent?.interrupted) {
          for (const source of sources.values()) {
            source.stop();
            sources.delete(source);
          }
          nextStartTime = 0;
        }
      },
      onerror: (e: ErrorEvent) => {
        callbacks.onError(e.message || 'An unknown connection error occurred.');
      },
      onclose: (e: CloseEvent) => {
        callbacks.onClose();
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: { languageCode: 'en-US' },
      outputAudioTranscription: {},
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: finalSystemInstruction,
    },
  });

  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  
  const closeSession = async () => {
    if (scriptProcessor) scriptProcessor.disconnect();
    if (sourceNode) sourceNode.disconnect();
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    if(inputAudioContext.state !== 'closed') await inputAudioContext.close();
    if(outputAudioContext.state !== 'closed') await outputAudioContext.close();

    scriptProcessor = null;
    sourceNode = null;
    mediaStream = null;

    try {
        const session = await sessionPromise;
        session.close();
    } catch(e) {
        console.error("Error closing session:", e);
    }
  };

  return { close: closeSession };
};

export const getConversationFeedback = async (conversationHistory: ConversationTurn[]): Promise<Feedback> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-pro';

    const formattedHistory = conversationHistory
        .map(turn => `${turn.speaker === 'user' ? 'Learner' : 'Tutor'}: ${turn.text}`)
        .join('\n');

    const prompt = `You are an expert English language tutor. Analyze the following conversation from an English learner. The learner's speech should be in English only.
Provide feedback on the learner's performance. Focus on:
1.  **Intonation & Phrasing**: Based on word choice and structure, comment on their likely intonation, politeness, and naturalness.
2.  **Grammar**: Identify up to 3 specific grammatical errors. For each, show the original text, the correction, and a simple explanation. If there are no errors, say so.
3.  **Pronunciation**: Based on the learner's likely pronunciation from their word choices, identify 3-5 key words or short phrases that might be challenging. For each, provide a numerical score out of 100 on pronunciation accuracy and a brief, specific tip for improvement (e.g., "Focus on the 'r' sound in 'world'"). If pronunciation seems excellent, provide positive feedback on a few words.
4.  **Speaking Rate**: Estimate the learner's average words per minute (WPM) based on the flow and structure of their sentences. Provide a numerical WPM estimate and a brief comment on their likely speaking pace (e.g., "Your pace seems natural," "You might be speaking a bit quickly, which can affect clarity," or "Try to speak a little faster to sound more fluent.").
5.  **Vocabulary**: Identify 3-5 key vocabulary words or idioms from the conversation that are intermediate to advanced (B2-C1 level). For each, provide the word, a simple definition, and an example sentence based on how the user could have used it in the conversation.
6.  **Suggestions**: Give 2-3 actionable suggestions for how they can improve their English speaking skills based on this specific conversation.

CONVERSATION:
${formattedHistory}

Provide your feedback in a structured JSON format.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        intonation: { type: Type.STRING, description: "Feedback on the user's intonation and phrasing." },
                        grammar: { type: Type.STRING, description: "Feedback on the user's grammar, with corrections and explanations." },
                        pronunciation: {
                            type: Type.ARRAY,
                            description: "Feedback on specific word pronunciations.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING, description: "The word or phrase analyzed." },
                                    score: { type: Type.INTEGER, description: "A pronunciation score from 0 to 100." },
                                    feedback: { type: Type.STRING, description: "Specific feedback on how to improve the pronunciation." }
                                },
                                required: ["word", "score", "feedback"]
                            }
                        },
                        speakingRate: {
                            type: Type.OBJECT,
                            description: "Feedback on the user's speaking rate.",
                            properties: {
                                wpm: { type: Type.INTEGER, description: "Estimated words per minute." },
                                feedback: { type: Type.STRING, description: "Qualitative feedback on the speaking pace." }
                            },
                            required: ["wpm", "feedback"]
                        },
                        vocabulary: {
                            type: Type.ARRAY,
                            description: "Key vocabulary words with definitions and examples.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING, description: "The vocabulary word or idiom." },
                                    definition: { type: Type.STRING, description: "A simple definition." },
                                    example: { type: Type.STRING, description: "An example sentence." }
                                },
                                required: ["word", "definition", "example"]
                            }
                        },
                        suggestions: { type: Type.STRING, description: "Actionable suggestions for improvement." }
                    },
                    required: ["intonation", "grammar", "pronunciation", "speakingRate", "vocabulary", "suggestions"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Feedback;
    } catch (error) {
        console.error("Error getting feedback from Gemini:", error);
        return {
            intonation: "Sorry, I couldn't analyze the intonation for this conversation.",
            grammar: "Sorry, I couldn't analyze the grammar for this conversation.",
            suggestions: "Failed to generate feedback due to an error. Please try another session.",
            pronunciation: [],
            speakingRate: { wpm: 0, feedback: "Sorry, I couldn't analyze the speaking rate for this conversation." },
            vocabulary: []
        };
    }
};
