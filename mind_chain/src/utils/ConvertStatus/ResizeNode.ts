export const resizeNode = (nodes: any[]) => {
  nodes.forEach((node) => {
    if (node.id === '0') {
      // 根节点为最大,对应10级
      node.style = {
        ...node.style,
        width: 250,
        height: 60,
      };
      node.data.resizable = false;
    } else {
      const level = node.data.level;
      let size;

      if (level >= 9) {
        // level>=9的都是1级
        size = 1;
      } else {
        // level=1的节点对应9级,level=2的节点对应8级,以此类推
        size = 10 - level;
      }

      node.style = {
        ...node.style,
        width: 250 - (10 - size) * 15, // 9级宽度比10级小15,8级宽度比9级小15...
        height: 60 - (10 - size) * 3.6, // 9级高度比10级小3.6,8级高度比9级小3.6...
      };
    }
  });
};