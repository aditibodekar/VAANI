// client/src/services/gestureStore.js

const STORE_KEY = "vaani_custom_gestures";

export function extractLandmarkFeatures(landmarks) {
  if (!landmarks || landmarks.length < 21) return [];

  const points = landmarks.map((p) => {
    if (Array.isArray(p)) return { x: p[0], y: p[1], z: p[2] || 0 };
    return { x: Number(p.x) || 0, y: Number(p.y) || 0, z: Number(p.z) || 0 };
  });

  const wrist = points[0];
  const middleMCP = points[9];

  const handScale = Math.sqrt(
    Math.pow(middleMCP.x - wrist.x, 2) +
    Math.pow(middleMCP.y - wrist.y, 2) +
    Math.pow(middleMCP.z - wrist.z, 2)
  ) || 1.0;

  const features = [];

  for (let i = 0; i < 21; i++) {
    features.push((points[i].x - wrist.x) / handScale);
    features.push((points[i].y - wrist.y) / handScale);
    features.push((points[i].z - wrist.z) / handScale);
  }

  const tipIndices = [4, 8, 12, 16, 20];
  for (const tipIdx of tipIndices) {
    const dist = Math.sqrt(
      Math.pow(points[tipIdx].x - wrist.x, 2) +
      Math.pow(points[tipIdx].y - wrist.y, 2) +
      Math.pow(points[tipIdx].z - wrist.z, 2)
    ) / handScale;
    features.push(dist);
  }

  return features;
}

export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function computeCentroidVector(samples) {
  if (!samples || samples.length === 0) return [];
  const vectorLen = samples[0].length;
  const centroid = new Array(vectorLen).fill(0);

  for (const sample of samples) {
    for (let i = 0; i < vectorLen; i++) {
      centroid[i] += sample[i];
    }
  }

  return centroid.map((val) => val / samples.length);
}

// Fetch custom gestures from backend API first, fallback to LocalStorage
export async function fetchServerCustomGestures() {
  try {
    const res = await fetch("/ml/custom-gestures");
    if (res.ok) {
      const serverGestures = await res.json();
      if (Array.isArray(serverGestures) && serverGestures.length > 0) {
        localStorage.setItem(STORE_KEY, JSON.stringify(serverGestures));
        return serverGestures;
      }
    }
  } catch (e) {
    // Backend offline fallback
  }
  return getCustomGestures();
}

export function getCustomGestures() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function saveCustomGesture(gesture) {
  const current = getCustomGestures();
  const existingIdx = current.findIndex(
    (g) => g.name.toLowerCase() === gesture.name.toLowerCase()
  );

  if (existingIdx >= 0) {
    current[existingIdx] = gesture;
  } else {
    current.push(gesture);
  }

  localStorage.setItem(STORE_KEY, JSON.stringify(current));

  // Sync to Backend Server
  try {
    await fetch("/ml/admin/train-sequence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sign_name: gesture.name,
        hindi: gesture.hindi,
        marathi: gesture.marathi,
        category: gesture.category,
        description: gesture.description,
        vector: gesture.vector,
      }),
    });
  } catch (e) {
    // Saved locally
  }

  return current;
}