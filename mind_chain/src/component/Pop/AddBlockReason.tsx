/* 描述阻塞原因的弹窗 */
import { Modal, Input } from "antd";

const blockedReasonPop = ({
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
        value={value}
        onChange={onChange}
      />
    </Modal>
  );
};

export default blockedReasonPop;