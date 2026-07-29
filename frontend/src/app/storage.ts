import type { ProjectRecord, TaskCard } from './types';

const getProjectStorageKey = (userId: number) => `task-manager-projects-${userId}`;
const getTeamProjectStorageKey = (userId: number) => `task-manager-team-projects-${userId}`;
const getTeamSelectedProjectStorageKey = (userId: number) => `task-manager-team-selected-project-${userId}`;
const getTaskStorageKey = (userId: number) => `task-manager-task-cards-${userId}`;

export const getToken = () => localStorage.getItem('task-manager-token');

export const loadUserProjects = (userId: number): ProjectRecord[] => {
  const raw = localStorage.getItem(getProjectStorageKey(userId));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ProjectRecord[];
  } catch {
    localStorage.removeItem(getProjectStorageKey(userId));
    return [];
  }
};

export const saveUserProjects = (userId: number, projects: ProjectRecord[]) => {
  localStorage.setItem(getProjectStorageKey(userId), JSON.stringify(projects));
};

export const loadUserTaskCards = (userId: number): TaskCard[] => {
  const raw = localStorage.getItem(getTaskStorageKey(userId));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as TaskCard[];
  } catch {
    localStorage.removeItem(getTaskStorageKey(userId));
    return [];
  }
};

export const saveUserTaskCards = (userId: number, taskCards: TaskCard[]) => {
  localStorage.setItem(getTaskStorageKey(userId), JSON.stringify(taskCards));
};

export const loadUserTeamProjects = (userId: number): any[] => {
  const raw = localStorage.getItem(getTeamProjectStorageKey(userId));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as any[];
  } catch {
    localStorage.removeItem(getTeamProjectStorageKey(userId));
    return [];
  }
};

export const saveUserTeamProjects = (userId: number, projects: any[]) => {
  localStorage.setItem(getTeamProjectStorageKey(userId), JSON.stringify(projects));
};

export const loadSelectedTeamProjectId = (userId: number): string | null => {
  return localStorage.getItem(getTeamSelectedProjectStorageKey(userId));
};

export const saveSelectedTeamProjectId = (userId: number, projectId: string | null) => {
  if (projectId) {
    localStorage.setItem(getTeamSelectedProjectStorageKey(userId), projectId);
  } else {
    localStorage.removeItem(getTeamSelectedProjectStorageKey(userId));
  }
};
