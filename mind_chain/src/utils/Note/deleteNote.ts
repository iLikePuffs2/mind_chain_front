import axios from "axios";

// 删除笔记
export const deleteNote = async (userId: string, name: string): Promise<number> => {
  try {
    const response = await axios.delete(
      `http://localhost:8080/sidebar/delete?userId=${userId}&name=${name}`
    );
    const { code } = response.data;
    return code;
  } catch (error) {
    console.error("删除笔记失败", error);
    return -1;
  }
};