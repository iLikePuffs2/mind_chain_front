import React, { useState } from 'react';
import { Drawer, Card } from 'antd';
import { RightCircleTwoTone } from '@ant-design/icons';
import '../css/Test.css';

const App: React.FC = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  // 模拟卡片数据
  const cardData = [
    { id: 1, content: '工作任务' },
    { id: 2, content: '学习规划' },
  ];

  return (
    <>
      <div className="icon-container" onClick={showDrawer}>
        <RightCircleTwoTone style={{ fontSize: '24px' }} />
      </div>
      <Drawer
        title="笔记列表"
        placement="left"
        closable={false}
        onClose={onClose}
        open={open}
      >
        {cardData.map((card) => (
          <Card
            key={card.id}
            style={{ width: '100%', marginBottom: 16 }}
          >
            <p>{card.content}</p>
          </Card>
        ))}
      </Drawer>
    </>
  );
};

export default App;