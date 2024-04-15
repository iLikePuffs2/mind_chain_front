export interface Node {
  id: number;
  noteId?: number;
  templateId?: number;
  name: string;
  level: number;
  context?: string;
  parentId?: number;
  priority?: number;
  deadline?: Date;
  status: number;
  blockedReason: number;
}