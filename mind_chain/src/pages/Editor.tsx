import React, { useState } from 'react';
import { List, Typography } from 'antd';
import { getCurrentTaskList } from '../utils/Editor/CurrentTaskList';
import { getBlockedTaskList } from '../utils/Editor/BlockedTaskList';

interface EditorProps {
  nodes: any[];
  edges: any[];
}

const Editor: React.FC<EditorProps> = ({ nodes, edges }) => {
  const [taskList, setTaskList] = useState([]);

  const fetchCurrentTaskList = () => {
    const currentTaskList = getCurrentTaskList(nodes, edges);
    setTaskList(currentTaskList);
  };

  const fetchBlockedTaskList = () => {
    const blockedTaskList = getBlockedTaskList(nodes, edges);
    setTaskList(blockedTaskList);
  };

  return (
    <div className="text-container">
      <div className="button-container">
        <button onClick={fetchCurrentTaskList}>当前任务列表</button>
        <button onClick={fetchBlockedTaskList}>阻塞任务列表</button>
        <button>任务上下文</button>
      </div>
      <List
        size="small"
        bordered
        dataSource={taskList}
        renderItem={(item: any) => (
          <List.Item>
            <Typography.Text strong>{item.task}</Typography.Text>
            {item.blockInfo && ` (${item.blockInfo})`} ({item.parent})
          </List.Item>
        )}
      />
    </div>
  );
};

export default Editor;