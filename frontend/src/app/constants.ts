import type { ProjectDraft, ProjectRecord, StaticTaskColumn, TaskChecklistItem, TaskDraft } from './types';

export const emptyAuthForm = {
  username: '',
  email: '',
  password: '',
};

export const taskBoardColumns: StaticTaskColumn[] = [
  {
    status: 'TODO',
    title: 'Yapılacak',
    description: 'Başlamayı bekleyen işler',
    badge: '0',
    accentClass: 'column-yellow',
  },
  {
    status: 'IN_PROGRESS',
    title: 'Yapım Aşamasında',
    description: 'Şu anda üzerinde çalışılan işler',
    badge: '0',
    accentClass: 'column-blue',
  },
  {
    status: 'DONE',
    title: 'Tamamlandı',
    description: 'Bitmiş ve doğrulanmış işler',
    badge: '0',
    accentClass: 'column-green',
  },
];

export const taskBuilderSubtasks: TaskChecklistItem[] = [];

export const initialProjects: ProjectRecord[] = [];

export const existingTeams = ['Tasarım Ekibi', 'Geliştirme Ekibi', 'Pazarlama'];

export const activeTeamProjects = [
  { id: 'team-project-1', name: 'Global UI Refresh', team: 'Tasarım Ekibi' },
  { id: 'team-project-2', name: 'Core API Migration', team: 'Geliştirme Ekibi' },
  { id: 'team-project-3', name: 'Q4 Product Launch', team: 'Pazarlama' },
  { id: 'team-project-4', name: '2026 Strategic Roadmap', team: 'Yönetim' },
];

export const emptyTaskDraft: TaskDraft = {
  purpose: '',
  priority: 'Orta',
  dueDate: '',
};

export const emptyProjectDraft: ProjectDraft = {
  name: '',
  description: '',
  deadline: '',
};

export const statusAccentClassMap: Record<StaticTaskColumn['status'], string> = {
  TODO: 'task-chip--todo',
  IN_PROGRESS: 'task-chip--in-progress',
  DONE: 'task-chip--done',
};
