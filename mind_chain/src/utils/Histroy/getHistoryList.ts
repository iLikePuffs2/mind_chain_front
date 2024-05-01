import axios from 'axios';

export const getHistoryList = async (userId: string, name: string) => {
  try {
    const response = await axios.get(`http://localhost:8080/graph/history/list?userId=${userId}&name=${name}`);
    return response.data;
  } catch (error) {
    console.error('获取历史版本列表失败', error);
    return null;
  }
};