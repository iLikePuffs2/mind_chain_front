export interface Node {
  id: number;
  noteId?: number;
  templateId?: number;
  name: string;
  level: number; // 所处层级(根节点的直接子节点=1)
  context?: string; // 任务上下文
  parentId?: string; // 父节点的id(一个节点可能有多个父节点id，所以用英文逗号分割)
  priority?: number; // 优先级，优先级高的在左边
  deadline?: Date;
  status: number;
  blockedReason: number;
}