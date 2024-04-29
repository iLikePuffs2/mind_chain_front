import axios from "axios";

export const saveAndUpdateNote = async (userId, noteId, noteName, nodes) => {
  try {
    // 检查 noteId 是否为空
    if (!noteId) {
      console.error("笔记 ID 为空，无法保存笔记内容");
      return;
    }

    // 将前端的节点数据转换为后端所需的 Node 格式，并过滤掉 id 为 0 的根节点
    const convertedNodes = nodes
      .filter((node) => node.id !== "0")
      .map((node) => {
        const { id, data } = node;
        const {
          noteId,
          templateId,
          name,
          level,
          context,
          parentId,
          priority,
          deadline,
          status,
          details,
          blockedReason,
          blockedTime,
        } = data;

        return {
          id: parseInt(id, 10),
          noteId,
          templateId,
          name,
          level,
          context,
          parentId: parentId === "0" ? null : parentId,
          priority,
          deadline,
          status,
          details,
          blockedReason,
          blockedTime,
        };
      });

    const response = await axios.post(
      `http://localhost:8080/graph/saveAndUpdate?userId=${userId}&noteId=${noteId}&name=${noteName}`,
      convertedNodes
    );

    const { success, message } = response.data;

    if (success) {
      console.log("保存笔记内容成功");
    } else {
      console.error("保存笔记内容失败:", message);
    }
  } catch (error) {
    console.error("保存笔记内容失败", error);
  }
};