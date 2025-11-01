import axios from 'axios';

export const recoverHistory = async (userId: string, name: string, noteId: number) => {
  try {
    const response = await axios.post(`http://localhost:8080/graph/history/recovery?userId=${userId}&name=${name}&noteId=${noteId}`);
    return response.data;
  } catch (error) {
    console.error('恢复历史版本失败', error);
    return null;
  }
};