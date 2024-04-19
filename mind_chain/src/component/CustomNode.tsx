import React from 'react';
import { Handle, Position, NodeToolbar, useReactFlow } from 'reactflow';

const CustomNode = ({ data, isConnectable, selected }) => {
  const { label, isRoot } = data;
  const { transform } = useReactFlow();

  return (
    <div className="react-flow__node-group">
      <NodeToolbar isVisible={selected} position={Position.Right} transform={transform}>
        <button>按钮1</button>
        <button>按钮2</button>
        <button>按钮3</button>
      </NodeToolbar>
      {!isRoot && <Handle type="target" position={Position.Top} isConnectable={isConnectable} />}
      <div>
        {label}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={isRoot ? { left: '50%', transform: 'translate(-50%, 0)' } : {}} />
    </div>
  );
};

export default CustomNode;