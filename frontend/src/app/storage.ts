import type { ProjectRecord, TaskCard, TeamProjectRecord } from './types';

const getProjectStorageKey = (userId: number) => `task-manager-projects-${userId}`;
const getLegacyTeamProjectStorageKey = (userId: number) => `task-manager-team-projects-${userId}`;
const getTeamSelectedProjectStorageKey = (userId: number) => `task-manager-team-selected-project-${userId}`;
const getTaskStorageKey = (userId: number) => `task-manager-task-cards-${userId}`;
const TEAM_PROJECTS_SHARED_KEY = 'task-manager-team-projects-shared';
const TEAM_TASKS_SHARED_KEY = 'task-manager-team-task-cards-shared';

const isTeamTaskCard = (task: TaskCard) => {
  return (
    task.createdByUserId !== undefined
    || task.assignedToUserId !== undefined
    || task.assignedByUserId !== undefined
    || task.visibleToUserIds !== undefined
    || task.collaborationMode !== undefined
  );
};

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
    const parsed = JSON.parse(raw) as TaskCard[];
    const personalTasks = parsed.filter((task) => !isTeamTaskCard(task));

    // Migrate legacy mixed task storage by keeping only personal tasks under user key.
    if (personalTasks.length !== parsed.length) {
      localStorage.setItem(getTaskStorageKey(userId), JSON.stringify(personalTasks));
    }

    return personalTasks;
  } catch {
    localStorage.removeItem(getTaskStorageKey(userId));
    return [];
  }
};

export const saveUserTaskCards = (userId: number, taskCards: TaskCard[]) => {
  localStorage.setItem(getTaskStorageKey(userId), JSON.stringify(taskCards));
};

export const loadSharedTeamTaskCards = (userId: number): TaskCard[] => {
  const rawShared = localStorage.getItem(TEAM_TASKS_SHARED_KEY);
  if (rawShared) {
    try {
      return JSON.parse(rawShared) as TaskCard[];
    } catch {
      localStorage.removeItem(TEAM_TASKS_SHARED_KEY);
    }
  }

  const rawLegacy = localStorage.getItem(getTaskStorageKey(userId));
  if (!rawLegacy) {
    return [];
  }

  try {
    const legacyTasks = JSON.parse(rawLegacy) as TaskCard[];
    const teamTasks = legacyTasks.filter((task) => isTeamTaskCard(task));
    if (teamTasks.length > 0) {
      localStorage.setItem(TEAM_TASKS_SHARED_KEY, JSON.stringify(teamTasks));
    }
    return teamTasks;
  } catch {
    return [];
  }
};

export const saveSharedTeamTaskCards = (taskCards: TaskCard[]) => {
  localStorage.setItem(TEAM_TASKS_SHARED_KEY, JSON.stringify(taskCards));
};

export const loadUserTeamProjects = (userId: number): TeamProjectRecord[] => {
  const rawShared = localStorage.getItem(TEAM_PROJECTS_SHARED_KEY);
  if (rawShared) {
    try {
      return JSON.parse(rawShared) as TeamProjectRecord[];
    } catch {
      localStorage.removeItem(TEAM_PROJECTS_SHARED_KEY);
    }
  }

  const rawLegacy = localStorage.getItem(getLegacyTeamProjectStorageKey(userId));
  if (!rawLegacy) {
    return [];
  }

  try {
    const legacyProjects = JSON.parse(rawLegacy) as TeamProjectRecord[];
    localStorage.setItem(TEAM_PROJECTS_SHARED_KEY, JSON.stringify(legacyProjects));
    return legacyProjects;
  } catch {
    localStorage.removeItem(getLegacyTeamProjectStorageKey(userId));
    return [];
  }
};

export const saveUserTeamProjects = (_userId: number, projects: TeamProjectRecord[]) => {
  localStorage.setItem(TEAM_PROJECTS_SHARED_KEY, JSON.stringify(projects));
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
