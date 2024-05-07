// 修改全部节点的颜色
export function changeColor(nodes: Node[], edges: Edge[]) {
  nodes.forEach((node) => {
    const { status, details } = node.data;
    let color;

    const detailsArray =
      details === null || details === ""
        ? []
        : typeof details === "string"
        ? details.split(",").map(Number)
        : Array.isArray(details)
        ? details.map(Number)
        : [Number(details)];

    if (status === 1) {
      // #99e699是浅绿色,#b3d1ff是浅蓝色
      color =
        detailsArray.length === 0
          ? undefined
          : detailsArray[0] === 1
          ? "#99e699"
          : "#b3d1ff";
    } else if (status === 2) {
      // #ff6666是直接阻塞-红色；#fad1d1是间接阻塞-浅红色
      const containsSpecialReasons = detailsArray.some((detail) =>
        [3, 4].includes(detail)
      );
      color = containsSpecialReasons ? "#ff6666" : "#fad1d1";
    }

    // 将修改后的颜色赋值给节点的style属性(与data同级)
    node.style = {
      ...node.style,
      backgroundColor: color,
    };
  });

  return nodes;
}
