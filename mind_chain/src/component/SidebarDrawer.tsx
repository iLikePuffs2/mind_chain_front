import React from "react";
import { Drawer, Card, Dropdown, Menu } from "antd";
import { EllipsisOutlined, PlusSquareTwoTone } from "@ant-design/icons";
import { Note } from "../model/note";

interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  onNoteClick: (userId: string, noteId: string) => void;
  onRenameClick: (name: string) => void;
  onDeleteClick: (name: string) => Promise<void>;
  onAddNoteClick: () => void;
}

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  open,
  onClose,
  notes,
  onNoteClick,
  onRenameClick,
  onDeleteClick,
  onAddNoteClick,
}) => {
  // 处理删除笔记
  const handleDeleteNote = async (name: string) => {
    await onDeleteClick(name);
    onClose(); // 关闭抽屉
  };

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ width: "70%" }}>笔记列表</span>
          <PlusSquareTwoTone
            style={{ fontSize: "30px", cursor: "pointer" }}
            onClick={onAddNoteClick}
          />
        </div>
      }
      placement="left"
      closable={false}
      onClose={onClose}
      open={open}
    >
      {notes.map((note) => (
        <Card key={note.id} style={{ marginBottom: 16 }}>
          <div
            onClick={() => {
              const userId = sessionStorage.getItem("userId");
              onNoteClick(userId, note.id);
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{note.name}</span>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item onClick={() => onRenameClick(note.name)}>
                      重命名
                    </Menu.Item>
                    <Menu.Item onClick={() => handleDeleteNote(note.name)}>
                      删除
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisOutlined style={{ fontSize: "20px" }} />
              </Dropdown>
            </div>
          </div>
        </Card>
      ))}
    </Drawer>
  );
};

export default SidebarDrawer;