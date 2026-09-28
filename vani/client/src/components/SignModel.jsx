import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function SignModel({ modelUrl = "/models/namaste.glb" }) {
  const groupRef = useRef();

  // Load 3D GLTF asset safely
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (!names || !names.length) return;

    const action = actions[names[0]];
    if (!action) return;

    action.reset();
    action.fadeIn(0.25);
    action.play();

    return () => {
      action.fadeOut(0.2);
      action.stop();
    };
  }, [actions, names, modelUrl]);

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={2.5}
        position={[0, -1.8, 0]}
      />
    </group>
  );
}