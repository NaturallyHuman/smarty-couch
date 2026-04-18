// Global audio manager — owns long-lived HTMLAudioElements by key so they
// survive React route changes. Enables true crossfades between tracks.

import { fadeIn, fadeOut } from './audioFade';

type TrackKey = 'intro' | 'question';

interface TrackOptions {
  volume?: number;
  loop?: boolean;
  durationMs?: number;
}

const tracks = new Map<TrackKey, HTMLAudioElement>();
const trackSources = new Map<TrackKey, string>();

const getOrCreate = (key: TrackKey, src: string, loop: boolean): HTMLAudioElement => {
  const existing = tracks.get(key);
  if (existing && trackSources.get(key) === src) {
    existing.loop = loop;
    return existing;
  }
  if (existing) {
    existing.pause();
  }
  const audio = new Audio(src);
  audio.loop = loop;
  audio.volume = 0;
  tracks.set(key, audio);
  trackSources.set(key, src);
  return audio;
};

export const playTrack = (
  key: TrackKey,
  src: string,
  { volume = 0.5, loop = false, durationMs = 800 }: TrackOptions = {},
) => {
  const audio = getOrCreate(key, src, loop);
  fadeIn(audio, volume, durationMs);
  return audio;
};

export const crossfade = (
  fromKey: TrackKey,
  toKey: TrackKey,
  toSrc: string,
  { volume = 0.5, loop = false, durationMs = 1200 }: TrackOptions = {},
) => {
  const from = tracks.get(fromKey);
  if (from) {
    fadeOut(from, durationMs).then(() => {
      // Clean up the faded-out track so it doesn't linger.
      if (tracks.get(fromKey) === from) {
        tracks.delete(fromKey);
        trackSources.delete(fromKey);
      }
    });
  }
  const to = getOrCreate(toKey, toSrc, loop);
  fadeIn(to, volume, durationMs);
  return to;
};

export const stopTrack = (key: TrackKey, durationMs = 600) => {
  const audio = tracks.get(key);
  if (!audio) return Promise.resolve();
  return fadeOut(audio, durationMs).then(() => {
    if (tracks.get(key) === audio) {
      tracks.delete(key);
      trackSources.delete(key);
    }
  });
};

export const setTrackVolume = (key: TrackKey, volume: number, durationMs = 300) => {
  const audio = tracks.get(key);
  if (!audio) return;
  if (volume <= 0) {
    fadeOut(audio, durationMs);
  } else {
    fadeIn(audio, volume, durationMs);
  }
};

export const isTrackPlaying = (key: TrackKey): boolean => {
  const audio = tracks.get(key);
  return !!audio && !audio.paused;
};

export const audioManager = {
  playTrack,
  crossfade,
  stopTrack,
  setTrackVolume,
  isTrackPlaying,
};
