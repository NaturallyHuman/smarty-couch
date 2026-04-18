// Simple linear fade helpers for HTMLAudioElement.
// Cancels any in-flight fade on the same element before starting a new one.

const fadeIntervals = new WeakMap<HTMLAudioElement, ReturnType<typeof setInterval>>();
const STEP_MS = 50;

const clearFade = (audio: HTMLAudioElement) => {
  const existing = fadeIntervals.get(audio);
  if (existing) {
    clearInterval(existing);
    fadeIntervals.delete(audio);
  }
};

export const fadeIn = (
  audio: HTMLAudioElement,
  targetVolume: number,
  durationMs = 800,
) => {
  clearFade(audio);
  audio.volume = 0;
  const target = Math.max(0, Math.min(1, targetVolume));
  const steps = Math.max(1, Math.floor(durationMs / STEP_MS));
  const increment = target / steps;
  let current = 0;

  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch((error) => {
      console.log('Audio autoplay blocked:', error);
    });
  }

  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      audio.volume = target;
      clearFade(audio);
      return;
    }
    audio.volume = current;
  }, STEP_MS);

  fadeIntervals.set(audio, interval);
};

export const fadeOut = (
  audio: HTMLAudioElement,
  durationMs = 800,
): Promise<void> => {
  return new Promise((resolve) => {
    clearFade(audio);
    const startVolume = audio.volume;
    const steps = Math.max(1, Math.floor(durationMs / STEP_MS));
    const decrement = startVolume / steps;
    let current = startVolume;

    const interval = setInterval(() => {
      current -= decrement;
      if (current <= 0) {
        audio.volume = 0;
        audio.pause();
        clearFade(audio);
        resolve();
        return;
      }
      audio.volume = current;
    }, STEP_MS);

    fadeIntervals.set(audio, interval);
  });
};
