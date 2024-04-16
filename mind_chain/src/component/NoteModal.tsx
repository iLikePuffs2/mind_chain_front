import React from "react";
import { Modal, Input } from "antd";

const NoteModal = ({
  visible,
  title,
  onOk,
  onCancel,
  value,
  onChange,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Input
        placeholder="请输入笔记名称"
        value={value}
        onChange={onChange}
      />
    </Modal>
  );
};

export default NoteModal;