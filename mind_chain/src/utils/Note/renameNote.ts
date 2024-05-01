import axios from "axios";

// 笔记重命名
export const renameNote = async (userId: string, oldName: string, newName: string): Promise<{ code: number; message: string }> => {
  try {
    const response = await axios.put(
      `http://localhost:8080/sidebar/rename?userId=${userId}&oldName=${oldName}&newName=${newName}`
    );
    const { code, message } = response.data;
    return { code, message };
  } catch (error) {
    console.error("笔记重命名失败", error);
    return { code: -1, message: "笔记重命名失败" };
  }
};