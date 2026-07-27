export type AuthMode = 'login' | 'register';

export type Screen = 'login' | 'dashboard';

export type DashboardView = 'gorevlerim' | 'yeni-proje' | 'yeni-gorev' | 'projelerim' | 'takim' | 'yonetim';

export type Role = 'USER' | 'ADMIN';

export type UserMe = {
  id: number;
  username: string;
  email: string;
  role: Role;
};

export type TaskPriority = 'Yüksek' | 'Orta' | 'Düşük';

export type TaskChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TeamTaskCollaborationMode = 'PUBLIC' | 'PRIVATE';

export type StaticTaskColumn = {
  status: TaskStatus;
  title: string;
  description: string;
  badge: string;
  accentClass: string;
};

export type TaskCard = {
  id: string;
  projectId: string;
  title: string;
  purpose: string;
  priority: TaskPriority;
  dueDate: string;
  progress: number;
  checklistCount: number;
  status: TaskStatus;
  createdByUserId?: number;
  assignedToUserId?: number;
  assignedByUserId?: number;
  visibleToUserIds?: number[];
  collaborationMode?: TeamTaskCollaborationMode;
  checklist?: TaskChecklistItem[];
};

export type TaskDraft = {
  purpose: string;
  priority: TaskPriority;
  dueDate: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  description?: string;
  ownerUsername?: string;
};

export type BackendProjectResponse = {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  ownerUsername: string;
};

export type ProjectDraft = {
  name: string;
  description: string;
};

export type TeamMemberRole = 'ADMIN' | 'USER';

export type TeamMember = {
  id: string;
  name: string;
  role: TeamMemberRole;
  userId: number;
};

export type TeamProjectRecord = {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
};

export type BackendUserResponse = {
  id: number;
  username: string;
  email: string;
  role: Role;
};
