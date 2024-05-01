import axios from "axios";

interface NoteDetail {
  note: any;
  nodeList: any[];
}

// 查询笔记详情
export const fetchNoteDetail = async (userId: string, noteId?: string): Promise<NoteDetail | null> => {
  try {
    let url = "";
    if (noteId) {
      url = `http://localhost:8080/graph/detail?noteId=${noteId}&userId=${userId}`;
    } else {
      url = `http://localhost:8080/graph/detail?userId=${userId}`;
    }
    const response = await axios.get(url);
    const { code, data } = response.data;
    if (code === 0) {
      return data;
    } else {
      console.error("获取笔记详情失败");
      return null;
    }
  } catch (error) {
    console.error("获取笔记详情失败", error);
    return null;
  }
};