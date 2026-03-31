export interface Box {
  _id: string;
  name: string;
  parentId: string | null;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  title: string;
  boxId: string | null;
  content: any;
  order: number;
  icon?: string;
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

export interface User {
  _id: string;
  name: string;
  email: string;
}
