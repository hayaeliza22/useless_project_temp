// lib/courtSounds.ts
//
// 100% local meme courtroom sound effects.
// No API, no audio files, no external libraries.

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext ||
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!AudioContextClass) return null;

  audioContext ??= new AudioContextClass();

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.015,
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + Math.max(duration, 0.02),
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function noiseBurst(
  ctx: AudioContext,
  start: number,
  duration: number,
  volume: number,
) {
  const sampleRate = ctx.sampleRate;
  const frameCount = Math.floor(sampleRate * duration);

  const buffer = ctx.createBuffer(
    1,
    frameCount,
    sampleRate,
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i += 1) {
    const fade = 1 - i / frameCount;
    data[i] = (Math.random() * 2 - 1) * fade;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1500, start);

  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration,
  );

  source.buffer = buffer;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(start);
  source.stop(start + duration);
}

/*
 * BIG MEME IMPACT
 * Basically: "VINE BOOM" energy.
 */
function boom(ctx: AudioContext, start: number) {
  noiseBurst(ctx, start, 0.16, 0.65);

  tone(
    ctx,
    85,
    start,
    0.32,
    "sine",
    0.45,
  );

  tone(
    ctx,
    52,
    start + 0.03,
    0.5,
    "triangle",
    0.35,
  );
}

/*
 * Cartoon buzzer.
 */
function buzzer(ctx: AudioContext, start: number) {
  tone(
    ctx,
    120,
    start,
    0.18,
    "square",
    0.18,
  );

  tone(
    ctx,
    95,
    start + 0.12,
    0.22,
    "square",
    0.14,
  );
}

/*
 * Sad trombone-ish descending sound.
 */
function sadTrombone(ctx: AudioContext, start: number) {
  tone(
    ctx,
    392,
    start,
    0.35,
    "triangle",
    0.12,
  );

  tone(
    ctx,
    349.23,
    start + 0.32,
    0.35,
    "triangle",
    0.12,
  );

  tone(
    ctx,
    293.66,
    start + 0.64,
    0.4,
    "triangle",
    0.12,
  );

  tone(
    ctx,
    220,
    start + 0.98,
    0.75,
    "triangle",
    0.14,
  );
}

/*
 * Tiny clown-ish melody.
 */
function clownEnding(ctx: AudioContext, start: number) {
  tone(
    ctx,
    523.25,
    start,
    0.12,
    "square",
    0.08,
  );

  tone(
    ctx,
    659.25,
    start + 0.12,
    0.12,
    "square",
    0.08,
  );

  tone(
    ctx,
    783.99,
    start + 0.24,
    0.12,
    "square",
    0.08,
  );

  tone(
    ctx,
    1046.5,
    start + 0.36,
    0.25,
    "square",
    0.07,
  );
}

/*
 * GUILTY:
 *
 * BOOM
 * BUZZER
 * dramatic low note
 * clown ending
 */
export function playGuiltySound() {
  const ctx = getAudioContext();

  if (!ctx) return;

  const now = ctx.currentTime + 0.03;

  boom(ctx, now);

  buzzer(ctx, now + 0.18);

  tone(
    ctx,
    73.42,
    now + 0.48,
    0.9,
    "sawtooth",
    0.11,
  );

  clownEnding(ctx, now + 1.1);
}

/*
 * NOT GUILTY:
 *
 * sad trombone
 * tiny victory
 * comedic ending
 */
export function playNotGuiltySound() {
  const ctx = getAudioContext();

  if (!ctx) return;

  const now = ctx.currentTime + 0.03;

  sadTrombone(ctx, now);

  tone(
    ctx,
    523.25,
    now + 1.7,
    0.18,
    "sine",
    0.08,
  );

  tone(
    ctx,
    659.25,
    now + 1.84,
    0.18,
    "sine",
    0.08,
  );

  tone(
    ctx,
    783.99,
    now + 1.98,
    0.3,
    "sine",
    0.08,
  );
}

/*
 * Optional sound for submitting a case.
 */
export function playCaseSubmittedSound() {
  const ctx = getAudioContext();

  if (!ctx) return;

  const now = ctx.currentTime + 0.03;

  tone(
    ctx,
    180,
    now,
    0.08,
    "square",
    0.06,
  );

  tone(
    ctx,
    260,
    now + 0.08,
    0.08,
    "square",
    0.06,
  );

  tone(
    ctx,
    360,
    now + 0.16,
    0.12,
    "square",
    0.07,
  );
}