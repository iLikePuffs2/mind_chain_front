/* 实现节点的复制粘贴 */
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Node,
  useKeyPress,
  useReactFlow,
  getConnectedEdges,
  KeyCode,
  Edge,
  XYPosition,
  useStore,
} from "reactflow";

export function useCopyPaste<NodeData, EdgeData>() {
  const mousePosRef = useRef<XYPosition>({ x: 0, y: 0 });
  const rfDomNode = useStore((state) => state.domNode);

  const { getNodes, setNodes, getEdges, setEdges, screenToFlowPosition } =
    useReactFlow<NodeData, EdgeData>();

  // Set up the paste buffers to store the copied nodes and edges.
  const [bufferedNodes, setBufferedNodes] = useState([] as Node<NodeData>[]);
  const [bufferedEdges, setBufferedEdges] = useState([] as Edge<EdgeData>[]);

  // initialize the copy/paste hook
  // 1. remove native copy/paste/cut handlers
  // 2. add mouse move handler to keep track of the current mouse position
  useEffect(() => {
    const events = ["cut", "copy", "paste"];

    if (rfDomNode) {
      const preventDefault = (e: Event) => e.preventDefault();

      const onMouseMove = (event: MouseEvent) => {
        mousePosRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
      };

      for (const event of events) {
        rfDomNode.addEventListener(event, preventDefault);
      }

      rfDomNode.addEventListener("mousemove", onMouseMove);

      return () => {
        for (const event of events) {
          rfDomNode.removeEventListener(event, preventDefault);
        }

        rfDomNode.removeEventListener("mousemove", onMouseMove);
      };
    }
  }, [rfDomNode]);

  const copy = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    const copiedNodes = selectedNodes.map((node) => ({
      ...node,
      isCut: false,
    }));
    setBufferedNodes(copiedNodes);
  }, [getNodes]);

  const cut = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    const cutNodes = selectedNodes.map((node) => ({ ...node, isCut: true }));
    setBufferedNodes(cutNodes);

    setNodes((nodes) => nodes.filter((node) => !node.selected));
  }, [getNodes, setNodes]);

  const paste = useCallback(
    (
      { x: pasteX, y: pasteY } = screenToFlowPosition({
        x: mousePosRef.current.x,
        y: mousePosRef.current.y,
      })
    ) => {
      const minX = Math.min(...bufferedNodes.map((s) => s.position.x));
      const minY = Math.min(...bufferedNodes.map((s) => s.position.y));

      const newNodes: Node<NodeData>[] = bufferedNodes.map((node) => {
        let id;
        if (node.isCut) {
          // 如果是剪切粘贴,从data属性中获取id
          id = node.data.id.toString();
        } else {
          // 如果是复制粘贴,生成新的id
          const maxId = getNodes().reduce((max, n) => {
            const nodeId = parseInt(n.id, 10);
            return nodeId > max ? nodeId : max;
          }, 0);
          id = `${maxId + 1}`;
        }

        const x = pasteX + (node.position.x - minX);
        const y = pasteY + (node.position.y - minY);

        return {
          ...node,
          id,
          data: {
            ...node.data,
            id: node.isCut ? node.data.id : parseInt(id, 10),
          },
          position: { x, y },
        };
      });

      setNodes((nodes) => [
        ...nodes.map((node) => ({ ...node, selected: false })),
        ...newNodes,
      ]);
    },
    [bufferedNodes, screenToFlowPosition, setNodes]
  );

  useShortcut(["Meta+x", "Control+x"], cut);
  useShortcut(["Meta+c", "Control+c"], copy);
  useShortcut(["Meta+v", "Control+v"], paste);

  return { cut, copy, paste, bufferedNodes, bufferedEdges };
}

function useShortcut(keyCode: KeyCode, callback: Function): void {
  const [didRun, setDidRun] = useState(false);
  const shouldRun = useKeyPress(keyCode);

  useEffect(() => {
    if (shouldRun && !didRun) {
      callback();
      setDidRun(true);
    } else {
      setDidRun(shouldRun);
    }
  }, [shouldRun, didRun, callback]);
}

export default useCopyPaste;
