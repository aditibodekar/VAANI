// client/src/services/animationLibrary.js

export const SIGN_ANIMATIONS = {
  namaste: {
    name: "Namaste",
    type: "3d",
    src: "/models/namaste.glb",
  },
  hi: {
    name: "Hi",
    type: "video",
    src: "/models/Hi.mp4",
  },
  sorry: {
    name: "Sorry",
    type: "video", // Change to "3d" and path to .glb if your Sorry animation is a 3D model
    src: "/models/Sorry.mp4",
  },
 
};

export function getAnimationForPhrase(phrase) {
  if (!phrase) return null;
  const key = phrase.trim().toLowerCase();

  if (SIGN_ANIMATIONS[key]) {
    return SIGN_ANIMATIONS[key];
  }

  // Substring search fallback
  for (const [k, config] of Object.entries(SIGN_ANIMATIONS)) {
    if (key.includes(k)) {
      return config;
    }
  }

  return null;
}