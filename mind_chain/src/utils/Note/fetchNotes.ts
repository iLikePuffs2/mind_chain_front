import axios from "axios";
import { Note } from "../../model/note";

// 查询笔记列表
export const fetchNotes = async (userId: string): Promise<Note[]> => {
  try {
    const response = await axios.get(
      `http://localhost:8080/sidebar/list?userId=${userId}`
    );
    const { code, data } = response.data;
    if (code === 0) {
      return data;
    } else {
      console.error("查询笔记列表失败");
      return [];
    }
  } catch (error) {
    console.error("查询笔记列表失败", error);
    return [];
  }
};