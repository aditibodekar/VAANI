import React, { Component, Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import SignModel from "./SignModel.jsx";
import { getAnimationForPhrase } from "../services/animationLibrary.js";

function CameraTarget() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 1.5, 0);
  }, [camera]);

  return null;
}

// React Error Boundary to catch R3F / GLTF runtime errors safely
class CanvasErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("R3F/GLTF Render Error Caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
          ⚠️ Unable to render 3D model asset. Please check model path.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SignAnimationViewer({ phrase = "namaste" }) {
  const animationConfig = getAnimationForPhrase(phrase) || {
    type: "3d",
    src: "/models/namaste.glb",
  };

  // Render MP4/Video animations directly in standard HTML container
  if (animationConfig.type === "video") {
    return (
      <div
        className="sign-video-viewer"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <video
          key={animationConfig.src}
          src={animationConfig.src}
          autoPlay
          loop
          muted
          playsInline
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      </div>
    );
  }

  // Render 3D Canvas safely with Suspense & Error Boundary
  return (
    <div className="sign-3d-viewer" style={{ width: "100%", height: "100%" }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{
            position: [0, 1.8, 4],
            fov: 30,
          }}
        >
          <CameraTarget />

          <ambientLight intensity={1.2} />
          <directionalLight position={[2, 5, 5]} intensity={2} />
          <directionalLight position={[-3, 2, 4]} intensity={1} />

          <Suspense fallback={null}>
            <SignModel modelUrl={animationConfig.src} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}