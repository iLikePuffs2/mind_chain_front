export const getBlockedTaskList = (nodes, edges) => {
  const blockedTasks = nodes.filter((node) => {
    const details = node.data.details;
    return details && (details.includes('3') || details.includes('4'));
  });

  const parentTasks = new Map();

  const findParentTask = (nodeId) => {
    const parentEdge = edges.find((edge) => edge.target === nodeId);
    if (parentEdge) {
      const parentNode = nodes.find((node) => node.id === parentEdge.source);
      if (parentNode && parentNode.data.level === 1) {
        return parentNode;
      } else {
        return findParentTask(parentEdge.source);
      }
    }
    return null;
  };

  blockedTasks.forEach((task) => {
    if (task.data.level === 1) {
      parentTasks.set(task.id, [task]);
    } else {
      const parentTask = findParentTask(task.id);
      if (parentTask) {
        if (!parentTasks.has(parentTask.id)) {
          parentTasks.set(parentTask.id, []);
        }
        parentTasks.get(parentTask.id).push(task);
      }
    }
  });

  const taskList = [];
  parentTasks.forEach((tasks, parentId) => {
    const parentName = nodes.find((node) => node.id === parentId).data.name;
    tasks.forEach((task) => {
      const { blockedReason, blockedTime } = task.data;
      let blockInfo = '';

      if (blockedReason && blockedTime) {
        const formattedTime = formatDate(blockedTime);
        blockInfo = `${blockedReason} ${formattedTime}`;
      } else if (blockedReason) {
        blockInfo = blockedReason;
      } else if (blockedTime) {
        const formattedTime = formatDate(blockedTime);
        blockInfo = formattedTime;
      }

      taskList.push({
        task: task.data.name,
        blockInfo,
        parent: task.data.level === 1 ? "" : parentName,
        nodeData: task.data,
      });
    });
  });

  return taskList;
};
  
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