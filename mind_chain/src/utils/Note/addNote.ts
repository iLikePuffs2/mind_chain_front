import axios from "axios";

// 新增笔记
export const addNote = async (userId: string, newNoteName: string): Promise<number> => {
  try {
    const response = await axios.post(
      `http://localhost:8080/sidebar/add?userId=${userId}&name=${newNoteName}`
    );
    const { code } = response.data;
    return code;
  } catch (error) {
    console.error("新增笔记失败", error);
    return -1;
  }
};