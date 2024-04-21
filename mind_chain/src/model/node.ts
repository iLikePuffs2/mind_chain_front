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
  status: number; // 状态(1 可执行,2 被阻塞,3 已完成)
  /* 
    1.状态详情(1 本身可执行-浅绿色,2 有子任务可执行-浅蓝色,3 全部的直接子节点被阻塞-浅红色,4 同级的前置节点未完成-浅红色,5 事件阻塞-红色,6 时间阻塞-红色)
    2.间接阻塞为浅红色，直接阻塞为红色
    3.一个节点处于被阻塞状态时，可能同时有多个原因，所以用英文逗号分割
  */
  details: string; 
}