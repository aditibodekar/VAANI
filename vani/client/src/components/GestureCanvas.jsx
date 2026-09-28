import React, { useRef, useEffect, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

const GestureInterpreter = ({ onGestureDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastPredictionRef = useRef("");

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Flatten landmarks (x, y, z)
        const landmarks = results.multiHandLandmarks[0].map(lm => [lm.x, lm.y, lm.z]).flat();
        
        // Single frame real-time request
        fetch('http://localhost:5000/predict_gesture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ landmarks }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.prediction && data.prediction !== lastPredictionRef.current) {
              lastPredictionRef.current = data.prediction;
              onGestureDetected(data.prediction);
            }
          })
          .catch((err) => console.error("Inference Error: ", err));
      }
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-slate-700">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
    </div>
  );
};

export default GestureInterpreter;