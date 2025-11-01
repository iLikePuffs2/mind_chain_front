/**
 * 获取阻塞任务列表
 * @param {Array} nodes - 节点数组
 * @param {Array} edges - 边数组
 * @returns {Array} - 阻塞任务列表
 */
export const getBlockedTaskList = (nodes, edges) => {
  /**
   * 创建一个数组用于存储阻塞任务节点
   * @type {Array}
   */
  const blockedTasks = [];

  /**
   * 创建一个 Map 用于存储父任务和其子任务
   * @type {Map}
   */
  const parentTasks = new Map();

  /**
   * 前序遍历查找阻塞任务节点
   * @param {string} nodeId - 节点 ID
   */
  const preorderFindBlockedTasks = (nodeId) => {
    // 根据节点 ID 查找对应的节点对象
    const node = nodes.find((node) => node.id === nodeId);
    
    // 如果节点存在且其 details 属性包含 "3" 或 "4",则将其添加到 blockedTasks 数组中
    if (node) {
      const details = node.data.details;
      if (details && (details.includes('3') || details.includes('4'))) {
        blockedTasks.push(node);
      }
    }

    // 查找以当前节点为源节点的所有边
    const childEdges = edges.filter((edge) => edge.source === nodeId);
    
    // 递归遍历每个子节点
    childEdges.forEach((edge) => {
      preorderFindBlockedTasks(edge.target);
    });
  };

  // 从根节点(ID 为 "0" 的节点)开始前序遍历
  preorderFindBlockedTasks("0");

  /**
   * 递归查找给定节点的父任务节点,返回经历的所有父节点的名字
   * @param {string} nodeId - 节点 ID
   * @param {Array} parentNames - 父节点名字数组
   * @returns {string} - 经历的所有父节点的名字,按照逆序排列
   */
  const findParentTaskNames = (nodeId, parentNames = []) => {
    // 查找以给定节点为目标节点的边
    const parentEdge = edges.find((edge) => edge.target === nodeId);
    
    // 如果找到了父边
    if (parentEdge) {
      // 根据父边的源节点 ID 查找对应的节点对象
      const parentNode = nodes.find((node) => node.id === parentEdge.source);
      
      // 如果父节点存在
      if (parentNode) {
        // 将父节点的名字添加到 parentNames 数组中
        parentNames.push(parentNode.data.name);
        
        // 如果父节点的级别不为 1,则继续递归查找父节点的父任务节点
        if (parentNode.data.level !== 1) {
          return findParentTaskNames(parentEdge.source, parentNames);
        }
      }
    }
    
    // 返回经历的所有父节点的名字,按照逆序排列
    return parentNames.reverse().join(" - ");
  };

  // 遍历阻塞任务节点
  blockedTasks.forEach((task) => {
    // 如果任务节点的级别为 1,将其作为父任务添加到 parentTasks 中
    if (task.data.level === 1) {
      parentTasks.set(task.id, [task]);
    } else {
      // 否则查找任务节点的父任务节点
      const parentTask = nodes.find((node) => node.id === edges.find((edge) => edge.target === task.id).source);
      
      // 如果找到了父任务节点
      if (parentTask) {
        // 如果 parentTasks 中不存在该父任务,则添加一个新的键值对
        if (!parentTasks.has(parentTask.id)) {
          parentTasks.set(parentTask.id, []);
        }
        
        // 将任务节点添加到对应的父任务的子任务数组中
        parentTasks.get(parentTask.id).push(task);
      }
    }
  });

  /**
   * 创建一个数组用于存储最终的任务列表
   * @type {Array}
   */
  const taskList = [];
  
  /**
   * 初始化任务序号为 1
   * @type {number}
   */
  let taskIndex = 1;

  // 遍历 parentTasks 中的每个父任务及其子任务
  parentTasks.forEach((tasks) => {
    // 遍历每个子任务
    tasks.forEach((task) => {
      // 获取任务的阻塞原因和阻塞时间
      const { blockedReason, blockedTime } = task.data;
      
      /**
       * 创建一个字符串用于存储阻塞信息
       * @type {string}
       */
      let blockInfo = '';
      
      // 根据阻塞原因和阻塞时间生成阻塞信息字符串
      if (blockedReason && blockedTime) {
        const formattedTime = formatDate(blockedTime);
        blockInfo = `阻塞原因：${blockedReason}；阻塞时间：${formattedTime}`;
      } else if (blockedReason) {
        blockInfo = `阻塞原因：${blockedReason}`;
      } else if (blockedTime) {
        const formattedTime = formatDate(blockedTime);
        blockInfo = `阻塞时间：${formattedTime}`;
      }

      // 查找任务节点经历的所有父节点的名字
      const parentNames = findParentTaskNames(task.id);

      // 将任务添加到任务列表中,包括任务名称、阻塞信息、父任务名称(如果有)以及节点数据
      taskList.push({
        task: `${taskIndex}. ${task.data.name}`,
        blockInfo,
        parent: parentNames,
        nodeData: task.data,
      });

      taskIndex++; // 递增任务序号
    });
  });

  // 返回最终的任务列表
  return taskList;
};

/**
 * 格式化日期字符串
 * @param {string} dateString - 日期字符串
 * @returns {string} - 格式化后的日期字符串
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};