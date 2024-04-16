// src/components/CustomEdge.tsx
import { BaseEdge, getSmoothStepPath } from 'reactflow';

export function CustomEdge({ sourceX, sourceY, targetX, targetY, ...props }) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return <BaseEdge path={edgePath} {...props} />;
}