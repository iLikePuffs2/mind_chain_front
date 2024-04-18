// 修改节点颜色

export const getNodeColor = (level: number, status: number, blockedReason: number) => {
    let color;
  
    if (level === 1) {
      if (status === 1) {
        color = "#99e699"; // 浅绿色
      } else if (status === 2) {
        if (blockedReason === 3 || blockedReason === 4) {
          color = "#ff6666"; // 红色
        } else {
          color = "#fad1d1"; // 浅红色
        }
      }
    } else if (level > 1) {
      if (status === 1) {
        color = "#b3d1ff"; // 浅蓝色
      } else if (status === 2) {
        if (blockedReason === 3 || blockedReason === 4) {
          color = "#ff6666"; // 红色
        } else {
          color = "#fad1d1"; // 浅红色
        }
      }
    }
  
    return color;
  };