// A simple service to play sound effects using the Web Audio API.
import { decode, decodeAudioData } from '../utils/audioUtils';

let audioContext: AudioContext | null = null;

/**
 * Gets or creates a singleton AudioContext.
 * Browsers require AudioContext to be created after a user interaction.
 */
const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    // TTS model outputs at 24kHz
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

/**
 * Resumes the AudioContext if it's in a suspended state.
 * This is often necessary on the first user interaction.
 */
export const resumeAudioContext = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.error("Failed to resume AudioContext:", e);
    }
  }
};

/**
 * Plays audio from a base64 encoded string.
 * This is used for playing back TTS audio from the Gemini API.
 */
export const playBase64Audio = async (base64: string) => {
  await resumeAudioContext();
  const ctx = getAudioContext();
  try {
    const audioBytes = decode(base64);
    // TTS audio is single channel (mono)
    const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
  } catch (error) {
    console.error("Failed to play base64 audio:", error);
  }
};

/**
 * Plays a simple tone with a given frequency and duration.
 * Includes a small fade-in and fade-out to prevent clicking sounds.
 */
const playTone = (
  frequency: number,
  duration: number,
  startTime = 0,
  type: OscillatorType = 'sine'
) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Simple envelope to prevent clicks
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

    oscillator.start(ctx.currentTime + startTime);
    oscillator.stop(ctx.currentTime + startTime + duration);
  } catch (e) {
    console.error("Error playing tone:", e);
  }
};

/**
 * Plays a sound to indicate a successful connection.
 * A short, rising two-tone melody.
 */
export const playConnectSound = async () => {
  await resumeAudioContext();
  playTone(523.25, 0.1, 0, 'sine'); // C5
  playTone(659.25, 0.1, 0.1, 'sine'); // E5
};

/**
 * Plays a sound to indicate an error has occurred.
 * A low, short buzz.
 */
export const playErrorSound = async () => {
  await resumeAudioContext();
  playTone(150, 0.3, 0, 'square');
};

/**
 * Plays a sound to indicate a message has been processed.
 * A short, subtle "blip".
 */
export const playMessageSound = async () => {
  await resumeAudioContext();
  playTone(880, 0.05, 0, 'triangle'); // A5
};

/**
 * Plays a sound to indicate a goal has been achieved.
 * A pleasant, two-tone chime.
 */
export const playGoalAchievedSound = async () => {
  await resumeAudioContext();
  playTone(1046.50, 0.1, 0, 'triangle'); // C6
  playTone(1318.51, 0.15, 0.1, 'triangle'); // E6
};