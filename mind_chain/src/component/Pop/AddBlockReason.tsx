/* 描述阻塞原因的弹窗 */
import { Modal, Input } from "antd";
import { useRef, useEffect } from "react";

const blockedReasonPop = ({
  visible,
  title,
  onOk,
  onCancel,
  value,
  onChange,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onOk();
    }
  };

  return (
    <Modal title={title} open={visible} onOk={onOk} onCancel={onCancel}>
      <Input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
    </Modal>
  );
};

export default blockedReasonPop;
