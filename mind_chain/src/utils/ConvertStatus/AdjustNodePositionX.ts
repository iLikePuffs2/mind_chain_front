export const adjustNodePositionX = (nodes: any[]) => {
  nodes.forEach((node) => {
    const level = node.data.level;
    let xOffset;

    if (level >= 9) {
      // level>=9的都与level=9的x变化值一致
      xOffset = 67.5;
    } else {
      // level=1,x+=7.5; level=2,x+=15; 以此类推
      xOffset = 7.5 * level;
    }

    node.position.x += xOffset;
  });
};
