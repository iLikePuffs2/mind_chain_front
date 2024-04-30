export const getCurrentTaskList = (nodes, edges) => {
  const currentTasks = nodes.filter((node) => node.data.details === "1");
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

  currentTasks.forEach((task) => {
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
      taskList.push({
        task: task.data.name,
        parent: task.data.level === 1 ? "" : parentName,
        nodeData: task.data,
      });
    });
  });

  return taskList;
};