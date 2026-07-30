import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from 'react';
import {
  emptyAuthForm,
  emptyProjectDraft,
  emptyTaskDraft,
  initialProjects,
  statusAccentClassMap,
  taskBoardColumns,
  taskBuilderSubtasks,
} from './app/constants';
import {
  getToken,
  loadUserProjects,
  saveUserProjects,
  loadUserTeamProjects,
  saveUserTeamProjects,
  loadSelectedTeamProjectId,
  saveSelectedTeamProjectId,
  loadUserTaskCards,
  saveUserTaskCards,
  loadSharedTeamTaskCards,
  saveSharedTeamTaskCards,
} from './app/storage';
import type {
  AuthMode,
  BackendProjectResponse,
  BackendUserResponse,
  DashboardView,
  ProjectDraft,
  ProjectRecord,
  Role,
  Screen,
  StaticTaskColumn,
  TaskCard,
  TaskChecklistItem,
  TeamTaskCollaborationMode,
  TaskDraft,
  TeamMember,
  TeamProjectRecord,
  TaskPriority,
  UserMe,
} from './app/types';

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [token, setToken] = useState<string | null>(() => getToken());
  const [currentUser, setCurrentUser] = useState<UserMe | null>(null);
  const [screen, setScreen] = useState<Screen>(() => (getToken() ? 'dashboard' : 'login'));
  const [dashboardView, setDashboardView] = useState<DashboardView>('gorevlerim');
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [teamProjects, setTeamProjects] = useState<TeamProjectRecord[]>([]);
  const [selectedTeamProjectId, setSelectedTeamProjectId] = useState<string | null>(null);
  const [taskCards, setTaskCards] = useState<TaskCard[]>([]);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(emptyProjectDraft);
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(emptyTaskDraft);
  const [taskChecklist, setTaskChecklist] = useState<TaskChecklistItem[]>(taskBuilderSubtasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isTeamProjectMenuOpen, setIsTeamProjectMenuOpen] = useState(false);
  const [isTeamProjectModalOpen, setIsTeamProjectModalOpen] = useState(false);
  const [isTeamNewTaskModalOpen, setIsTeamNewTaskModalOpen] = useState(false);
  const [isTeamMembersModalOpen, setIsTeamMembersModalOpen] = useState(false);
  const [isUserSettingsModalOpen, setIsUserSettingsModalOpen] = useState(false);
  const [userSettingsForm, setUserSettingsForm] = useState({ username: '', email: '', password: '' });
  const [teamProjectDraft, setTeamProjectDraft] = useState<ProjectDraft>(emptyProjectDraft);
  const [teamModalSaveAsTemplate, setTeamModalSaveAsTemplate] = useState(false);
  const [teamModalSearch, setTeamModalSearch] = useState('');
  const [teamModalMemberLookupError, setTeamModalMemberLookupError] = useState('');
  const [teamProjectDeleteError, setTeamProjectDeleteError] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMemberSearch, setTeamMemberSearch] = useState('');
  const [teamTaskDraft, setTeamTaskDraft] = useState<TaskDraft>(emptyTaskDraft);
  const [teamTaskAssigneeUserId, setTeamTaskAssigneeUserId] = useState<string>('');
  const [teamTaskVisibleUserIds, setTeamTaskVisibleUserIds] = useState<string[]>([]);
  const [teamTaskChecklist, setTeamTaskChecklist] = useState<TaskChecklistItem[]>(taskBuilderSubtasks);
  const [teamTaskCollaborationMode, setTeamTaskCollaborationMode] = useState<TeamTaskCollaborationMode>('PUBLIC');
  const [teamEditingTaskId, setTeamEditingTaskId] = useState<string | null>(null);
  const [teamNewSubtaskText, setTeamNewSubtaskText] = useState('');
  const [draggedTeamTaskId, setDraggedTeamTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingSession, setLoadingSession] = useState(false);

  const hasUserId = (value: number | string | undefined, userId: number | undefined) => {
    if (userId === undefined) {
      return false;
    }

    return Number(value) === userId;
  };

  const isTeamTaskCard = (task: TaskCard) => {
    return (
      task.createdByUserId !== undefined
      || task.assignedToUserId !== undefined
      || task.assignedByUserId !== undefined
      || task.visibleToUserIds !== undefined
      || task.collaborationMode !== undefined
    );
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const actorName = (currentUser?.username?.trim() || currentUser?.email || 'Proje Sahibi').trim();
  const isCurrentProjectAdmin = teamMembers.some(
    (member) => hasUserId(member.userId, currentUser?.id) && member.role === 'ADMIN',
  );
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId],
  );
  const visibleTeamProjects = useMemo(
    () =>
      teamProjects.filter((project) =>
        project.members.some((member) => hasUserId(member.userId, currentUser?.id)),
      ),
    [currentUser?.id, teamProjects],
  );
  const selectedTeamProject = useMemo(
    () => visibleTeamProjects.find((project) => project.id === selectedTeamProjectId) ?? visibleTeamProjects[0] ?? null,
    [visibleTeamProjects, selectedTeamProjectId],
  );
  const currentTeamRoleLabel = useMemo(() => {
    const currentMember = selectedTeamProject?.members.find((member) => hasUserId(member.userId, currentUser?.id));
    return currentMember?.role === 'ADMIN' ? 'Admin' : 'User';
  }, [currentUser?.id, selectedTeamProject]);
  const selectedTeamProjectAdmins = useMemo(
    () => selectedTeamProject?.members.filter((member) => member.role === 'ADMIN') ?? [],
    [selectedTeamProject],
  );
  const selectedTeamProjectTasks = useMemo(
    () => taskCards.filter((task) => task.projectId === selectedTeamProject?.id),
    [taskCards, selectedTeamProject?.id],
  );
  const visibleTeamTasks = useMemo(() => {
    if (!selectedTeamProject) {
      return [] as TaskCard[];
    }

    if (isCurrentProjectAdmin) {
      return selectedTeamProjectTasks;
    }

    return selectedTeamProjectTasks.filter((task) => {
      const canViewByVisibility =
        !task.visibleToUserIds || task.visibleToUserIds.includes(currentUser?.id ?? Number.MIN_SAFE_INTEGER);

      return canViewByVisibility;
    });
  }, [currentUser?.id, isCurrentProjectAdmin, selectedTeamProject, selectedTeamProjectTasks]);
  const teamTasksByStatus = useMemo(
    () =>
      taskBoardColumns.reduce<Record<StaticTaskColumn['status'], TaskCard[]>>(
        (accumulator, column) => {
          accumulator[column.status] = visibleTeamTasks.filter((task) => task.status === column.status);
          return accumulator;
        },
        { TODO: [], IN_PROGRESS: [], DONE: [] },
      ),
    [visibleTeamTasks],
  );

  const navigationItems = useMemo(
    () => [
      { label: 'Bireysel', view: 'gorevlerim' as DashboardView },
      { label: 'Takım', view: 'takim' as DashboardView },
    ],
    [],
  );

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');

  const getTeamTaskCollaborationMode = (task: TaskCard): TeamTaskCollaborationMode => task.collaborationMode ?? 'PUBLIC';

  const canUserEditTeamTask = (task: TaskCard) => {
    if (getTeamTaskCollaborationMode(task) === 'PRIVATE' && !isCurrentProjectAdmin) {
      return false;
    }
    return true;
  };

  const requestJson = async <T,>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

    const text = await response.text();
    const payload = text && text.trim().startsWith('{') ? JSON.parse(text) : text || null;

    if (!response.ok) {
      if (typeof payload === 'string') {
        throw new Error(payload || 'İstek başarısız oldu.');
      }

      throw new Error(payload?.message ?? payload?.error ?? 'İstek başarısız oldu.');
    }

    return payload as T;
  };

  const createProjectOnBackend = async (name: string, description: string) => {
    const createdProject = await requestJson<BackendProjectResponse>('/projects', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: description.trim() || undefined,
      }),
    });
    return createdProject;
  };

  const openNewTaskModal = () => {
    resetIndividualTaskEditor();
    setDashboardView('yeni-gorev');
  };

  const openTaskEditModal = (task: TaskCard) => {
    setError('');
    setEditingTaskId(task.id);
    setTaskDraft({
      purpose: task.purpose,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setTaskChecklist(task.checklist ? task.checklist.map((item) => ({ ...item })) : taskBuilderSubtasks.map((item) => ({ ...item })));
    setNewSubtaskText('');
    setDashboardView('yeni-gorev');
  };

  const openNewProjectModal = () => {
    setProjectDraft(emptyProjectDraft);
    setDashboardView('yeni-proje');
  };

  // Team view independent modal handlers
  const openTeamNewProjectModal = () => {
    setTeamProjectDraft(emptyProjectDraft);
    setTeamMembers(
      currentUser
        ? [{ id: `member-owner-${currentUser.id}`, name: actorName, role: 'ADMIN', userId: currentUser.id }]
        : [],
    );
    setTeamModalSearch('');
    setTeamModalMemberLookupError('');
    setDashboardView('takim');
    setIsTeamProjectModalOpen(true);
  };

  const closeTeamProjectModal = () => {
    setIsTeamProjectModalOpen(false);
    setTeamProjectDraft(emptyProjectDraft);
    setTeamModalMemberLookupError('');
  };

  const openTeamMembersModal = () => {
    setIsTeamMembersModalOpen(true);
  };

  const closeTeamMembersModal = () => {
    setIsTeamMembersModalOpen(false);
    setTeamMemberSearch('');
  };

  const resetIndividualTaskEditor = () => {
    setTaskDraft(emptyTaskDraft);
    setTaskChecklist(taskBuilderSubtasks);
    setNewSubtaskText('');
    setEditingTaskId(null);
  };

  const openUserSettingsModal = () => {
    if (!currentUser) {
      setError('Önce oturum açmanız gerekiyor.');
      return;
    }

    setError('');
    setUserSettingsForm({
      username: currentUser.username,
      email: currentUser.email,
      password: '',
    });
    setIsUserSettingsModalOpen(true);
  };

  const closeUserSettingsModal = () => {
    setIsUserSettingsModalOpen(false);
    setUserSettingsForm({ username: '', email: '', password: '' });
  };

  const updateCurrentUserSettings = () => {
    if (!userSettingsForm.username.trim() || !userSettingsForm.email.trim()) {
      setError('Kullanıcı adı ve e-posta gereklidir.');
      return;
    }

    void (async () => {
      try {
        setError('');
        const payload = await requestJson<UserMe>('/users/me', {
          method: 'PUT',
          body: JSON.stringify({
            username: userSettingsForm.username.trim(),
            email: userSettingsForm.email.trim(),
            password: userSettingsForm.password.trim() || undefined,
          }),
        });

        setCurrentUser(payload);
        setMessage('Kullanıcı bilgileri güncellendi.');
        closeUserSettingsModal();
      } catch (updateError) {
        setError(updateError instanceof Error ? updateError.message : 'Kullanıcı bilgileri güncellenemedi.');
      }
    })();
  };

  const updateCurrentTeamMembers = (updater: (current: TeamMember[]) => TeamMember[]) => {
    setTeamMembers((current) => {
      const nextMembers = updater(current);

      if (selectedTeamProjectId) {
        setTeamProjects((projects) =>
          projects.map((project) =>
            project.id === selectedTeamProjectId ? { ...project, members: nextMembers } : project,
          ),
        );
      }

      return nextMembers;
    });
  };

  const openTeamProjectPage = (projectId: string) => {
    const nextProject = visibleTeamProjects.find((project) => project.id === projectId);
    if (!nextProject) {
      return;
    }

    setSelectedTeamProjectId(projectId);
    setTeamMembers(nextProject.members);
    setIsTeamProjectMenuOpen(false);
  };

  const deleteProjectFromBackend = async (projectId: string) => {
    if (!/^\d+$/.test(projectId)) {
      return;
    }

    await requestJson(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  };

  const deleteTaskFromBackend = async (taskId: string) => {
    if (!/^\d+$/.test(taskId)) {
      return;
    }

    await requestJson(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  };

  const getProjectDeleteErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message === 'You cannot access this project') {
      return 'Sadece adminler silebilir.';
    }

    return error instanceof Error ? error.message : 'Proje silinemedi.';
  };

  const deleteIndividualProject = (projectId: string) => {
    void (async () => {
      try {
        setError('');
        await deleteProjectFromBackend(projectId);
        const remainingProjects = projects.filter((project) => project.id !== projectId);
        setProjects(remainingProjects);
        if (currentUser) {
          saveUserProjects(currentUser.id, remainingProjects);
        }
        setTaskCards((current) => current.filter((task) => task.projectId !== projectId));
        if (selectedProjectId === projectId) {
          setSelectedProjectId(remainingProjects[0]?.id ?? '');
        }
      } catch (deleteError) {
        setError(getProjectDeleteErrorMessage(deleteError));
      }
    })();
  };

  const deleteTeamProject = (projectId: string) => {
    void (async () => {
      try {
        setError('');
        setTeamProjectDeleteError('');
        await deleteProjectFromBackend(projectId);
        const remainingProjects = teamProjects.filter((project) => project.id !== projectId);
        const remainingVisibleProjects = remainingProjects.filter((project) =>
          project.members.some((member) => hasUserId(member.userId, currentUser?.id)),
        );
        setTeamProjects(remainingProjects);
        setTaskCards((current) => current.filter((task) => task.projectId !== projectId));
        if (selectedTeamProjectId === projectId) {
          const nextProject = remainingVisibleProjects[0] ?? null;
          setSelectedTeamProjectId(nextProject?.id ?? null);
          setTeamMembers(nextProject?.members ?? []);
        }
      } catch (deleteError) {
        setTeamProjectDeleteError(getProjectDeleteErrorMessage(deleteError));
      }
    })();
  };

  const deleteIndividualTask = (taskId: string) => {
    void (async () => {
      try {
        setError('');
        await deleteTaskFromBackend(taskId);
        setTaskCards((current) => current.filter((task) => task.id !== taskId));
        setMessage('Görev silindi.');
        setTimeout(() => setMessage(''), 3000);
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Görev silinemedi.');
      }
    })();
  };

  const deleteTeamTask = (task: TaskCard) => {
    if (!canUserEditTeamTask(task)) {
      setError('Bu görev private modda. Sadece admin silebilir.');
      return;
    }

    void (async () => {
      try {
        setError('');
        await deleteTaskFromBackend(task.id);
        setTaskCards((current) => current.filter((item) => item.id !== task.id));
        setMessage('Görev silindi.');
        setTimeout(() => setMessage(''), 3000);
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Görev silinemedi.');
      }
    })();
  };

  const addTeamMember = async (rawName: string) => {
    if (!isCurrentProjectAdmin) {
      setError('Sadece admin kullanıcılar ekip üyesi ekleyebilir.');
      return;
    }

    const name = rawName.trim();
    if (!name) {
      return;
    }

    try {
      setError('');
      setTeamModalMemberLookupError('');
      const resolved = await requestJson<BackendUserResponse>(`/users/resolve?identity=${encodeURIComponent(name)}`);

      updateCurrentTeamMembers((current) => {
        const exists = current.some((member) => hasUserId(member.userId, resolved.id));
        if (exists) {
          return current;
        }

        return [
          ...current,
          {
            id: `member-${resolved.id}`,
            name: resolved.username,
            role: 'USER',
            userId: resolved.id,
          },
        ];
      });
    } catch (addMemberError) {
      if (addMemberError instanceof Error && addMemberError.message === 'User not found') {
        setTeamModalMemberLookupError('kişi bulunamadı');
        return;
      }

      const message = addMemberError instanceof Error ? addMemberError.message : 'Kullanıcı eklenemedi.';
      setError(message);
    }
  };

  const removeTeamMember = (memberId: string) => {
    if (!isCurrentProjectAdmin) {
      setError('Sadece admin kullanıcılar ekip üyesi silebilir.');
      return;
    }

    updateCurrentTeamMembers((current) => current.filter((member) => member.id !== memberId));
  };

  const toggleTeamMemberRole = async (memberId: string) => {
    if (!isCurrentProjectAdmin) {
      setError('Sadece admin kullanıcılar rol değiştirebilir.');
      return;
    }

    const selected = teamMembers.find((member) => member.id === memberId);
    if (!selected) {
      return;
    }

    const adminCount = teamMembers.filter((member) => member.role === 'ADMIN').length;
    if (selected.role === 'ADMIN' && adminCount === 1) {
      setError('En az bir admin olmalı.');
      return;
    }

    updateCurrentTeamMembers((current) =>
      current.map((member) => {
        if (member.id !== memberId) {
          return member;
        }

        return { ...member, role: member.role === 'ADMIN' ? 'USER' : 'ADMIN' };
      }),
    );
  };

  const openTeamNewTaskModal = () => {
    setDashboardView('takim');

    if (!currentUser) {
      setError('Önce oturum açmanız gerekiyor.');
      return;
    }

    if (!selectedTeamProject) {
      setError('Önce bir takım projesi oluşturun veya seçin.');
      setIsTeamProjectMenuOpen(true);
      return;
    }

    setError('');
    const defaultVisibleUserIds = isCurrentProjectAdmin
      ? (selectedTeamProject?.members ?? []).map((member) => String(member.userId))
      : Array.from(
          new Set([String(currentUser.id), ...selectedTeamProjectAdmins.map((member) => String(member.userId))]),
        );

    setTeamTaskDraft(emptyTaskDraft);
    setTeamTaskChecklist(taskBuilderSubtasks);
    setTeamNewSubtaskText('');
    setTeamTaskAssigneeUserId(String(currentUser.id));
    setTeamTaskVisibleUserIds(defaultVisibleUserIds);
    setTeamTaskCollaborationMode('PUBLIC');
    setTeamEditingTaskId(null);
    setIsTeamNewTaskModalOpen(true);
  };

  const closeTeamTaskModal = () => {
    setIsTeamNewTaskModalOpen(false);
    setTeamTaskDraft(emptyTaskDraft);
    setTeamTaskChecklist(taskBuilderSubtasks);
    setTeamNewSubtaskText('');
    setTeamTaskAssigneeUserId('');
    setTeamTaskVisibleUserIds([]);
    setTeamTaskCollaborationMode('PUBLIC');
    setTeamEditingTaskId(null);
  };

  const openTeamTaskEditModal = (task: TaskCard) => {
    if (!canUserEditTeamTask(task)) {
      setError('Bu görev private modda. Sadece admin düzenleyebilir.');
      return;
    }

    const effectiveAssigneeId = task.assignedToUserId ?? currentUser?.id;

    setError('');
    setDashboardView('takim');
    setTeamEditingTaskId(task.id);
    setTeamTaskDraft({
      purpose: task.purpose,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setTeamTaskChecklist(task.checklist ? task.checklist.map((item) => ({ ...item })) : []);
    setTeamNewSubtaskText('');
    setTeamTaskAssigneeUserId(effectiveAssigneeId ? String(effectiveAssigneeId) : '');
    setTeamTaskVisibleUserIds((task.visibleToUserIds ?? []).map((userId) => String(userId)));
    setTeamTaskCollaborationMode(getTeamTaskCollaborationMode(task));
    setIsTeamNewTaskModalOpen(true);
  };

  const toggleTeamTaskChecklistItem = (itemId: string) => {
    setTeamTaskChecklist((current) => current.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)));
  };

  const addTeamTaskChecklistItem = () => {
    const trimmedText = teamNewSubtaskText.trim();
    if (!trimmedText) {
      return;
    }

    setTeamTaskChecklist((current) => [
      ...current,
      {
        id: `team-subtask-${Date.now()}-${current.length + 1}`,
        label: trimmedText,
        done: false,
      },
    ]);
    setTeamNewSubtaskText('');
  };

  const editTeamTaskChecklistItem = (itemId: string) => {
    const currentItem = teamTaskChecklist.find((item) => item.id === itemId);
    if (!currentItem) {
      return;
    }

      const nextLabel = window.prompt('Alt görevi düzenle', currentItem.label);
    if (nextLabel === null) {
      return;
    }

    const trimmedLabel = nextLabel.trim();
    if (!trimmedLabel) {
      return;
    }

    setTeamTaskChecklist((current) =>
      current.map((item) => (item.id === itemId ? { ...item, label: trimmedLabel } : item)),
    );
  };

  const removeTeamTaskChecklistItem = (itemId: string) => {
    setTeamTaskChecklist((current) => current.filter((item) => item.id !== itemId));
  };

  const toggleTeamTaskVisibleUser = (userId: string) => {
    setTeamTaskVisibleUserIds((current) => {
      if (current.includes(userId)) {
        return current.filter((id) => id !== userId);
      }
      return [...current, userId];
    });
  };

  const createTeamProjectCard = () => {
    if (!teamProjectDraft.name.trim()) {
      setError('Proje adı gereklidir');
      return;
    }

    void (async () => {
      try {
        setError('');
        const createdProject = await createProjectOnBackend(teamProjectDraft.name.trim(), teamProjectDraft.description);
        const projectMembers = currentUser
          ? [
              { id: `member-owner-${currentUser.id}`, name: actorName, role: 'ADMIN', userId: currentUser.id },
              ...teamMembers.filter((member) => !hasUserId(member.userId, currentUser.id)),
            ]
          : [...teamMembers];

        setTeamProjects((current) => [
          {
            id: String(createdProject.id),
            name: createdProject.name,
            description: createdProject.description ?? '',
            deadline: teamProjectDraft.deadline || undefined,
            members: projectMembers.map((member) =>
              hasUserId(member.userId, currentUser?.id) ? { ...member, role: 'ADMIN' } : { ...member, role: 'USER' },
            ),
          },
          ...current,
        ]);
        setSelectedTeamProjectId(String(createdProject.id));
        setTeamMembers(
          projectMembers.map((member) =>
            hasUserId(member.userId, currentUser?.id) ? { ...member, role: 'ADMIN' } : { ...member, role: 'USER' },
          ),
        );
        setIsProjectMenuOpen(false);
        setIsTeamProjectMenuOpen(false);
        setDashboardView('takim');
        closeTeamProjectModal();
        setMessage('Proje başarıyla oluşturuldu ve proje sayfası açıldı.');
        setTimeout(() => setMessage(''), 3000);
      } catch (projectError) {
        setError(projectError instanceof Error ? projectError.message : 'Proje oluşturulamadı');
      }
    })();
  };

  const createTeamTaskCard = () => {
    if (!teamTaskDraft.purpose.trim()) {
      setError('Görev amacı gereklidir');
      return;
    }
    if (!selectedTeamProject) {
      setError('Önce bir takım projesi seçin.');
      return;
    }

    const editingTask = teamEditingTaskId ? taskCards.find((task) => task.id === teamEditingTaskId) : null;
    const collaborationMode: TeamTaskCollaborationMode = isCurrentProjectAdmin
      ? teamTaskCollaborationMode
      : (editingTask?.collaborationMode ?? 'PUBLIC');

    if (collaborationMode === 'PRIVATE' && !isCurrentProjectAdmin) {
      setError('Private görevleri sadece admin düzenleyebilir.');
      return;
    }

    const defaultUserVisibility = currentUser
      ? Array.from(
          new Set([String(currentUser.id), ...selectedTeamProjectAdmins.map((member) => String(member.userId))]),
        )
      : [];
    const finalVisibleUserIds = isCurrentProjectAdmin
      ? teamTaskVisibleUserIds
      : (editingTask?.visibleToUserIds ?? defaultUserVisibility.map((id) => Number(id))).map((id) => String(id));

    if (isCurrentProjectAdmin && finalVisibleUserIds.length === 0) {
      setError('En az bir kullanıcı görünürlük listesinde olmalı.');
      return;
    }

    const assigneeUserId = Number(teamTaskAssigneeUserId || editingTask?.assignedToUserId || currentUser?.id);
    const teamCreatorId = currentUser?.id;
    const completedCount = teamTaskChecklist.filter((item) => item.done).length;
    const progress = teamTaskChecklist.length ? Math.round((completedCount / teamTaskChecklist.length) * 100) : 0;
    const checklistSnapshot = teamTaskChecklist.map((item) => ({ ...item }));
    const newTask: TaskCard = {
      id: teamEditingTaskId ?? `task-${Date.now()}`,
      projectId: selectedTeamProject.id,
      title: teamTaskDraft.purpose.substring(0, 50),
      purpose: teamTaskDraft.purpose,
      priority: teamTaskDraft.priority,
      dueDate: teamTaskDraft.dueDate,
      progress,
      checklistCount: checklistSnapshot.length,
      status: editingTask?.status ?? 'TODO',
      createdByUserId: editingTask?.createdByUserId ?? teamCreatorId,
      assignedToUserId: Number.isNaN(assigneeUserId) ? teamCreatorId : assigneeUserId,
      assignedByUserId: editingTask?.assignedByUserId ?? teamCreatorId,
      visibleToUserIds: finalVisibleUserIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id)),
      collaborationMode,
      checklist: checklistSnapshot,
    };

    setTaskCards((current) => {
      if (!teamEditingTaskId) {
        return [...current, newTask];
      }
      return current.map((task) => (task.id === teamEditingTaskId ? newTask : task));
    });

    closeTeamTaskModal();
    setMessage(teamEditingTaskId ? 'Görev başarıyla güncellendi' : 'Görev başarıyla oluşturuldu');
    setTimeout(() => setMessage(''), 3000);
  };

  const moveTeamTaskToStatus = (taskId: string, status: StaticTaskColumn['status']) => {
    setTaskCards((current) =>
      current.map((task) =>
        task.id === taskId && task.projectId === selectedTeamProject?.id ? { ...task, status } : task,
      ),
    );
    setDraggedTeamTaskId(null);
  };

  const handleTeamTaskDragStart = (task: TaskCard) => {
    if (!canUserEditTeamTask(task)) {
      setError('Bu görev private modda. Sadece admin taşıyabilir.');
      return;
    }
    setDraggedTeamTaskId(task.id);
  };

  const handleTeamTaskDragEnd = () => {
    setDraggedTeamTaskId(null);
  };

  const handleTeamColumnDrop = (event: DragEvent<HTMLElement>, status: StaticTaskColumn['status']) => {
    event.preventDefault();

    if (!draggedTeamTaskId) {
      return;
    }

    const task = taskCards.find((item) => item.id === draggedTeamTaskId);
    if (!task) {
      setDraggedTeamTaskId(null);
      return;
    }

    if (!canUserEditTeamTask(task)) {
      setError('Bu görev private modda. Sadece admin taşıyabilir.');
      setDraggedTeamTaskId(null);
      return;
    }

    const previousStatus = task.status;
    if (previousStatus === status) {
      setDraggedTeamTaskId(null);
      return;
    }

    moveTeamTaskToStatus(task.id, status);

    void (async () => {
      try {
        await persistTaskStatus(task.id, status);
      } catch (persistError) {
        moveTeamTaskToStatus(task.id, previousStatus);
        setError(persistError instanceof Error ? persistError.message : 'Görev durumu güncellenemedi.');
      }
    })();
  };

  const updateSelectedProjectName = (name: string) => {
    setProjects((current) => current.map((project) => (project.id === selectedProjectId ? { ...project, name } : project)));
  };

  const syncTeamProjectsFromStorage = (userId: number) => {
    const savedTeamProjects = loadUserTeamProjects(userId);
    const visibleSavedTeamProjects = savedTeamProjects.filter((project) =>
      project.members.some((member) => hasUserId(member.userId, userId)),
    );
    const savedSelectedTeamProjectId = loadSelectedTeamProjectId(userId);
    const nextSelectedTeamProjectId =
      savedSelectedTeamProjectId && visibleSavedTeamProjects.some((project) => project.id === savedSelectedTeamProjectId)
        ? savedSelectedTeamProjectId
        : visibleSavedTeamProjects[0]?.id ?? null;

    setTeamProjects(savedTeamProjects);
    setSelectedTeamProjectId(nextSelectedTeamProjectId);
  };

  const openProjectPage = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectMenuOpen(false);
    setDashboardView('gorevlerim');
  };

  const createProjectCard = () => {
    const trimmedName = projectDraft.name.trim();
    const projectName = trimmedName || 'Yeni proje';

    void (async () => {
      try {
        setError('');
        const createdProject = await createProjectOnBackend(projectName, projectDraft.description);
        const createdProjectRecord: ProjectRecord = {
          id: String(createdProject.id),
          name: createdProject.name,
          description: createdProject.description ?? undefined,
          deadline: projectDraft.deadline || undefined,
          ownerUsername: createdProject.ownerUsername,
        };

        setProjects((current) => {
          const nextProjects = [createdProjectRecord, ...current];
          if (currentUser) {
            saveUserProjects(currentUser.id, nextProjects);
          }
          return nextProjects;
        });
        setSelectedProjectId(String(createdProject.id));
        setIsProjectMenuOpen(false);
        setDashboardView('gorevlerim');
        setProjectDraft(emptyProjectDraft);
        setMessage('Proje oluşturuldu ve görevler sayfası açıldı.');
      } catch (projectError) {
        setError(projectError instanceof Error ? projectError.message : 'Proje oluşturulamadı');
      }
    })();
  };

  const toggleChecklistItem = (itemId: string) => {
    setTaskChecklist((current) => current.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)));
  };

  const addChecklistItem = () => {
    const trimmedText = newSubtaskText.trim();
    if (!trimmedText) {
      return;
    }

    setTaskChecklist((current) => [
      ...current,
      {
        id: `subtask-${Date.now()}-${current.length + 1}`,
        label: trimmedText,
        done: false,
      },
    ]);
    setNewSubtaskText('');
  };

  const editChecklistItem = (itemId: string) => {
    const currentItem = taskChecklist.find((item) => item.id === itemId);
    if (!currentItem) {
      return;
    }

      const nextLabel = window.prompt('Alt görevi düzenle', currentItem.label);
    if (nextLabel === null) {
      return;
    }

    const trimmedLabel = nextLabel.trim();
    if (!trimmedLabel) {
      return;
    }

    setTaskChecklist((current) => current.map((item) => (item.id === itemId ? { ...item, label: trimmedLabel } : item)));
  };

  const removeChecklistItem = (itemId: string) => {
    setTaskChecklist((current) => current.filter((item) => item.id !== itemId));
  };

  const moveTaskToStatus = (taskId: string, status: StaticTaskColumn['status']) => {
    setTaskCards((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));
    setDraggedTaskId(null);
  };

  const persistTaskStatus = async (taskId: string, status: StaticTaskColumn['status']) => {
    // Locally created draft tasks use non-numeric ids (task-...), skip backend sync for them.
    if (!/^\d+$/.test(taskId)) {
      return;
    }

    await requestJson(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  };

  const createTaskCard = () => {
    const editingTask = editingTaskId ? taskCards.find((task) => task.id === editingTaskId) : null;
    const trimmedPurpose = taskDraft.purpose.trim();
    const title = trimmedPurpose ? trimmedPurpose.split('\n')[0].slice(0, 48) : 'Yeni görev';
    const completedCount = taskChecklist.filter((item) => item.done).length;
    const progress = taskChecklist.length ? Math.round((completedCount / taskChecklist.length) * 100) : 0;
    const checklistSnapshot = taskChecklist.map((item) => ({ ...item }));

    const newTask: TaskCard = {
      id: editingTaskId ?? `task-${Date.now()}`,
      projectId: selectedProjectId,
      title,
      purpose: trimmedPurpose || 'Görev amacı girilmedi.',
      priority: taskDraft.priority,
      dueDate: taskDraft.dueDate,
      progress,
      checklistCount: checklistSnapshot.length,
      status: editingTask?.status ?? 'TODO',
      checklist: checklistSnapshot,
    };

    setTaskCards((current) => (editingTaskId ? current.map((task) => (task.id === editingTaskId ? newTask : task)) : [newTask, ...current]));
    setMessage(editingTaskId ? 'Görev güncellendi.' : 'Görev yapacaklar bölümüne eklendi.');
    setDashboardView('gorevlerim');
    resetIndividualTaskEditor();
  };

  const handleTaskDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleColumnDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleColumnDrop = (event: DragEvent<HTMLElement>, status: StaticTaskColumn['status']) => {
    event.preventDefault();

    if (!draggedTaskId) {
      return;
    }

    const taskId = draggedTaskId;
    const previousStatus = taskCards.find((task) => task.id === taskId)?.status;

    if (previousStatus === status) {
      setDraggedTaskId(null);
      return;
    }

    moveTaskToStatus(taskId, status);

    void (async () => {
      try {
        await persistTaskStatus(taskId, status);
      } catch (persistError) {
        if (previousStatus) {
          moveTaskToStatus(taskId, previousStatus);
        }
        setError(persistError instanceof Error ? persistError.message : 'Görev durumu güncellenemedi.');
      }
    })();
  };

  const filteredTaskCards = taskCards.filter((task) => task.projectId === selectedProjectId);

  const resetFeedback = () => {
    setMessage('');
    setError('');
  };

  const loadCurrentUser = async () => {
    if (!token) {
      setCurrentUser(null);
      setScreen('login');
      setDashboardView('gorevlerim');
      return;
    }

    setLoadingSession(true);
    try {
      const user = await requestJson<UserMe>('/users/me');
      setCurrentUser(user);
      setDashboardView('gorevlerim');
      setScreen('dashboard');
    } catch {
      localStorage.removeItem('task-manager-token');
      setToken(null);
      setCurrentUser(null);
      setDashboardView('gorevlerim');
      setScreen('login');
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    void loadCurrentUser();
  }, [token]);

  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setSelectedProjectId('');
      setTeamProjects([]);
      setSelectedTeamProjectId(null);
      setTeamMembers([]);
      setTaskCards([]);
      return;
    }

    const savedProjects = loadUserProjects(currentUser.id);
    setProjects(savedProjects);
    setSelectedProjectId(savedProjects[0]?.id ?? '');

    syncTeamProjectsFromStorage(currentUser.id);

    const personalTaskCards = loadUserTaskCards(currentUser.id);
    const sharedTeamTaskCards = loadSharedTeamTaskCards(currentUser.id);
    const mergedTaskCards = [...personalTaskCards, ...sharedTeamTaskCards].filter(
      (task, index, all) => all.findIndex((candidate) => candidate.id === task.id) === index,
    );
    setTaskCards(mergedTaskCards);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'task-manager-team-projects-shared') {
        syncTeamProjectsFromStorage(currentUser.id);
      }

      if (event.key === 'task-manager-team-task-cards-shared') {
        const personalTaskCards = loadUserTaskCards(currentUser.id);
        const sharedTeamTaskCards = loadSharedTeamTaskCards(currentUser.id);
        const mergedTaskCards = [...personalTaskCards, ...sharedTeamTaskCards].filter(
          (task, index, all) => all.findIndex((candidate) => candidate.id === task.id) === index,
        );
        setTaskCards(mergedTaskCards);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    saveUserProjects(currentUser.id, projects);
  }, [currentUser, projects]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    saveUserTeamProjects(currentUser.id, teamProjects);
  }, [currentUser, teamProjects]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const personalTaskCards = taskCards.filter((task) => !isTeamTaskCard(task));
    const sharedTeamTaskCards = taskCards.filter((task) => isTeamTaskCard(task));

    saveUserTaskCards(currentUser.id, personalTaskCards);
    saveSharedTeamTaskCards(sharedTeamTaskCards);
  }, [currentUser, taskCards]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    saveSelectedTeamProjectId(currentUser.id, selectedTeamProjectId);
  }, [currentUser, selectedTeamProjectId]);

  useEffect(() => {
    if (!selectedTeamProject) {
      return;
    }

    setTeamMembers(selectedTeamProject.members);
  }, [selectedTeamProject]);

  const handleRegister = async () => {
    resetFeedback();
    try {
      const payload = await requestJson<{ message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
        }),
      }, false);

      setMessage(payload.message ?? 'Kullanıcı başarıyla kaydedildi.');
      setAuthMode('login');
      setAuthForm((current) => ({ ...current, password: '' }));
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Kayıt işlemi başarısız oldu.');
    }
  };

  const handleLogin = async () => {
    resetFeedback();
    try {
      const payload = await requestJson<{ token: string; message?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      }, false);

      localStorage.setItem('task-manager-token', payload.token);
      setToken(payload.token);
      setDashboardView('gorevlerim');
      setScreen('dashboard');
      setMessage(payload.message ?? 'Giriş başarılı.');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Giriş işlemi başarısız oldu.');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (authMode === 'register') {
      await handleRegister();
      return;
    }

    await handleLogin();
  };

  const handleLogout = () => {
    localStorage.removeItem('task-manager-token');
    setToken(null);
    setCurrentUser(null);
    setDashboardView('gorevlerim');
    setScreen('login');
    setMessage('Oturum kapatıldı.');
    setError('');
  };

  if (screen === 'login') {
    return (
      <main className="auth-shell">
        <aside className="panel auth-panel auth-card">
          <div className="auth-badge">{authMode === 'login' ? 'Giriş' : 'Kayıt'}</div>
          <h2>{authMode === 'login' ? 'Hesabına giriş yap' : 'Yeni hesap oluştur'}</h2>
          <p>{authMode === 'login' ? "Dashboard'a geçmek için giriş yap." : 'Önce kayıt ol, sonra giriş yap.'}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <label>
                Kullanıcı adı
                <input
                  value={authForm.username}
                  onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))}
                  placeholder="ad_soyad"
                />
              </label>
            )}

            <label>
              E-posta
              <input
                value={authForm.email}
                onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="dln.gnsl@gmail.com"
              />
            </label>

            <label>
              Şifre
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="••••••••••"
              />
            </label>

            <button className="primary-button full-width" type="submit">
              {authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="auth-links">
            <button
              className="link-button"
              type="button"
              onClick={() => {
                resetFeedback();
                setAuthMode(authMode === 'login' ? 'register' : 'login');
              }}
            >
              {authMode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
            </button>
          </div>

          <div className="auth-status-stack">
            {message && <div className="status-chip success">{message}</div>}
            {error && <div className="status-chip error">{error}</div>}
          </div>
        </aside>
      </main>
    );
  }

  const renderMainPanel = () => {
    if (dashboardView === 'takim') {
      return (
        <div className="team-view-container">
          <section className="team-main">
            <div className="team-header">
              <div className="team-title-section">
                <h1>Takım Projeleri</h1>
                <p>Tüm ekip üyelerinin projelerini ve görevlerini yönetin</p>
              </div>
              
              <div className="team-toolbar">
                <div className="team-controls">
                  <div className="project-title-row">
                    <input
                      className="project-name-pill"
                      value={selectedTeamProject?.name ?? 'Takım Projeleri'}
                      readOnly
                      aria-label="Takım projesi"
                    />
                    <button
                      className="project-picker-button"
                      type="button"
                      aria-label="Takım proje listesini aç"
                      aria-expanded={isTeamProjectMenuOpen}
                      onClick={() => setIsTeamProjectMenuOpen((current) => !current)}
                    >
                      ⌄
                    </button>
                    {isTeamProjectMenuOpen && (
                      <div className="project-picker-popover" role="menu" aria-label="Takım proje listesi">
                        <span className="project-picker-label">Tüm Projeler</span>
                        {visibleTeamProjects.length === 0 ? (
                          <div className="muted">Henüz proje eklenmedi.</div>
                        ) : (
                          visibleTeamProjects.map((project) => (
                            <div
                              key={project.id}
                              className={`project-picker-item ${project.id === selectedTeamProject?.id ? 'active' : ''}`}
                              style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
                            >
                              <button
                                type="button"
                                onClick={() => openTeamProjectPage(project.id)}
                                style={{ all: 'unset', cursor: 'pointer', flex: 1 }}
                              >
                                <span>{project.name}</span>
                                <small className="muted" style={{ display: 'block', marginTop: 4 }}>
                                  {(project.members ?? []).map((member) => `${member.name}: ${member.role === 'ADMIN' ? 'Admin' : 'User'}`).join(' · ')}
                                </small>
                              </button>
                              <button className="secondary-button small" type="button" onClick={() => deleteTeamProject(project.id)}>
                                Sil
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <button className="secondary-button small" type="button">
                    {currentTeamRoleLabel}
                  </button>
                </div>
                <div className="team-actions">
                  <button className="primary-button small" type="button" onClick={openTeamNewProjectModal}>
                    + Proje Ekle
                  </button>
                  <button className="primary-button small" type="button" onClick={openTeamNewTaskModal}>
                    + Görev Ekle
                  </button>
                </div>
              </div>
              {teamProjectDeleteError && <div className="status-chip error compact team-members-hint">{teamProjectDeleteError}</div>}

              <div
                className="project-details-panel"
                style={{
                  marginTop: 8,
                  padding: '10px 12px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <p style={{ margin: 0, color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Açıklama:</strong> {selectedTeamProject?.description || '-'}
                </p>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Tarih:</strong> {selectedTeamProject?.deadline || '-'}
                </p>
              </div>

              {error && <div className="status-chip error compact team-members-hint">{error}</div>}
            </div>

            <div className="team-board">
              {taskBoardColumns.map((column) => (
                <div
                  key={column.status}
                  className={`team-column ${column.accentClass}`}
                  onDragOver={handleColumnDragOver}
                  onDrop={(event) => handleTeamColumnDrop(event, column.status)}
                >
                  <div className="team-column-header">
                    <div>
                      <h3>{column.title}</h3>
                      <p>{column.description}</p>
                    </div>
                    <span className="team-badge">{teamTasksByStatus[column.status].length}</span>
                  </div>
                  <div className="team-column-cards">
                    {teamTasksByStatus[column.status].length > 0 ? (
                      teamTasksByStatus[column.status].map((task) => {
                        const assignee = selectedTeamProject?.members.find((member) => hasUserId(member.userId, task.assignedToUserId));
                        const creator = selectedTeamProject?.members.find((member) => hasUserId(member.userId, task.createdByUserId));
                        const visibilityNames = (task.visibleToUserIds ?? [])
                          .map((userId) => selectedTeamProject?.members.find((member) => hasUserId(member.userId, userId))?.name)
                          .filter((name): name is string => Boolean(name));
                        const canEditTask = canUserEditTeamTask(task);
                        const collaborationModeLabel = getTeamTaskCollaborationMode(task) === 'PRIVATE' ? 'Private' : 'Public';
                        return (
                          <article
                            className={`task-card-mini ${draggedTeamTaskId === task.id ? 'dragging' : ''}`}
                            key={task.id}
                            draggable={canEditTask}
                            onDragStart={() => handleTeamTaskDragStart(task)}
                            onDragEnd={handleTeamTaskDragEnd}
                          >
                            <div className="task-card-mini-top">
                              <button className={`task-chip ${statusAccentClassMap[task.status]}`} type="button">
                                {task.priority}
                              </button>
                              {task.dueDate ? <small>{task.dueDate}</small> : <span />}
                            </div>
                            <strong>{task.title}</strong>
                            <div className="task-mini-footer" style={{ display: 'block' }}>
                              <small>
                                Oluşturan: {creator?.name ?? 'Bilinmiyor'}
                              </small>
                              <small>
                                Atanan: {assignee?.name ?? 'Belirsiz'}
                              </small>
                              <small>
                                Görünürlük: {visibilityNames.length > 0 ? visibilityNames.join(', ') : 'Tanımsız'}
                              </small>
                              <small>Mod: {collaborationModeLabel}</small>
                              <button
                                className="secondary-button small"
                                type="button"
                                onClick={() => openTeamTaskEditModal(task)}
                                disabled={!canEditTask}
                                title={!canEditTask ? 'Private görevleri sadece admin düzenleyebilir.' : undefined}
                              >
                                Düzenle
                              </button>
                              <button className="secondary-button small" type="button" onClick={() => deleteTeamTask(task)} disabled={!canEditTask}>
                                Sil
                              </button>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className="empty-state">Bu kolonda henüz görev yok.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </section>

          <aside className="team-sidebar">
            <div className="team-sidebar-card">
              <h4>Proje Ayarları</h4>
              <div className="team-settings">
                <button className="team-setting-btn" type="button" onClick={openTeamMembersModal}>
                  👥 Üyeler
                </button>
              </div>
            </div>
          </aside>
          {isTeamProjectModalOpen && (
            <div className="task-modal-backdrop" role="presentation" onClick={closeTeamProjectModal}>
              <section
                className="task-modal panel team-project-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="team-new-project-title"
                onClick={(event) => event.stopPropagation()}
              >
                <header className="task-modal-header">
                  <div>
                    <span className="eyebrow">Takım</span>
                    <h2 id="team-new-project-title">Yeni Proje Oluştur</h2>
                  </div>

                  <button className="icon-button" type="button" aria-label="Kapat" onClick={closeTeamProjectModal}>
                    ×
                  </button>
                </header>

                <div className="task-modal-body team-project-body">
                  <section className="project-spec">
                    <label className="task-modal-label" htmlFor="team-project-name">
                      Proje Adı
                    </label>
                    <input
                      id="team-project-name"
                      className="task-modal-input"
                      type="text"
                      placeholder="Örn."
                      value={teamProjectDraft.name}
                      onChange={(event) => setTeamProjectDraft((current) => ({ ...current, name: event.target.value }))}
                    />

                    <label className="task-modal-label" htmlFor="team-project-description">
                      Proje Açıklaması
                    </label>
                    <textarea
                      id="team-project-description"
                      className="task-modal-textarea"
                      placeholder="Projenin amacı, başarı kriterleri ve ana paydaşlar..."
                      rows={6}
                      value={teamProjectDraft.description}
                      onChange={(event) => setTeamProjectDraft((current) => ({ ...current, description: event.target.value }))}
                    />

                    <label className="task-modal-label" htmlFor="team-project-deadline">
                      Hedef Tamamlama Tarihi
                    </label>
                    <input
                      id="team-project-deadline"
                      className="task-modal-input"
                      type="date"
                      value={teamProjectDraft.deadline}
                      onChange={(event) => setTeamProjectDraft((current) => ({ ...current, deadline: event.target.value }))}
                    />

                  </section>

                  <aside className="project-collab">
                    <div className="collab-header">
                      <h3>İşbirliği</h3>
                      <p className="muted">Roller ve ekip üyelerini seçin</p>
                    </div>

                    <div className="collab-search-row">
                      <input
                        className="task-modal-input"
                        placeholder="Kullanıcı ara veya e-posta ekle"
                        value={teamModalSearch}
                        onChange={(e) => {
                          setTeamModalSearch(e.target.value);
                          setTeamModalMemberLookupError('');
                        }}
                      />
                      <button
                        className="primary-button small"
                        type="button"
                        disabled={!isCurrentProjectAdmin}
                        onClick={() => {
                          void addTeamMember(teamModalSearch);
                          setTeamModalSearch('');
                        }}
                      >
                        Projeye Ekle
                      </button>
                    </div>

                    {teamModalMemberLookupError && <div className="status-chip error compact">{teamModalMemberLookupError}</div>}

                    <div className="collab-members">
                      {teamMembers.length === 0 ? (
                        <div className="muted">Henüz ekip üyesi eklenmedi.</div>
                      ) : (
                        teamMembers.map((member) => (
                            <div key={member.id} className="member-item">
                              <div>
                                <strong>{member.name}</strong>
                                <div className="muted" style={{ fontSize: '0.85rem' }}>
                                  {member.role === 'ADMIN' ? 'Admin' : 'User'}
                                </div>
                              </div>
                              <div>
                                <button
                                  className="secondary-button small"
                                  type="button"
                                  disabled={!isCurrentProjectAdmin || hasUserId(member.userId, currentUser?.id)}
                                  onClick={() => removeTeamMember(member.id)}
                                >
                                  Kaldır
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <button className="secondary-button full-width" type="button" onClick={closeTeamProjectModal}>
                        İptal
                      </button>
                      <button className="primary-button full-width" style={{ marginTop: 10 }} type="button" onClick={createTeamProjectCard}>
                        Projeyi Oluştur
                      </button>
                    </div>
                  </aside>
                </div>
              </section>
            </div>
          )}

          {isTeamMembersModalOpen && (
            <div className="task-modal-backdrop" role="presentation" onClick={closeTeamMembersModal}>
              <section
                className="task-modal panel team-project-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="team-members-title"
                onClick={(event) => event.stopPropagation()}
              >
                <header className="task-modal-header">
                  <div>
                    <span className="eyebrow">Takım Üyeleri</span>
                    <h2 id="team-members-title">Üye Yönetimi</h2>
                  </div>
                  <button className="icon-button" type="button" aria-label="Kapat" onClick={closeTeamMembersModal}>
                    ×
                  </button>
                </header>

                <div className="task-modal-body">
                  <section className="team-members-controls">
                    <input
                      className="task-modal-input"
                      placeholder="Kullanıcı adı veya e-posta"
                      value={teamMemberSearch}
                      onChange={(event) => setTeamMemberSearch(event.target.value)}
                    />
                    <button
                      className="primary-button small"
                      type="button"
                      disabled={!isCurrentProjectAdmin}
                      onClick={() => {
                        void addTeamMember(teamMemberSearch);
                        setTeamMemberSearch('');
                      }}
                    >
                      Üye Ekle
                    </button>
                  </section>

                  {!isCurrentProjectAdmin && (
                    <div className="status-chip compact team-members-hint">Bu projede sadece Admin rolündeki kullanıcılar üye ekleyebilir, silebilir ve rol değiştirebilir.</div>
                  )}

                  {error && <div className="status-chip error compact">{error}</div>}

                  <section className="team-members-list">
                    {teamMembers.map((member) => (
                      <article key={member.id} className="member-item">
                        <div>
                          <strong>{member.name}</strong>
                        </div>
                        <div className="team-member-actions">
                          <button
                            className="secondary-button small"
                            type="button"
                            disabled={!isCurrentProjectAdmin}
                            onClick={() => {
                              void toggleTeamMemberRole(member.id);
                            }}
                          >
                            {member.role === 'ADMIN' ? 'Admin' : 'User'}
                          </button>
                          <button
                            className="secondary-button small"
                            type="button"
                            disabled={!isCurrentProjectAdmin || hasUserId(member.userId, currentUser?.id)}
                            onClick={() => removeTeamMember(member.id)}
                          >
                            Sil
                          </button>
                        </div>
                      </article>
                    ))}
                  </section>
                </div>
              </section>
            </div>
          )}

          {isTeamNewTaskModalOpen && (
            <div className="task-modal-backdrop" role="presentation" onClick={closeTeamTaskModal}>
              <section
                className="task-modal panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="team-new-task-title"
                onClick={(event) => event.stopPropagation()}
              >
                <header className="task-modal-header">
                  <div>
                    <span className="eyebrow">Takım Görevi</span>
                    <h2 id="team-new-task-title">{teamEditingTaskId ? 'Görevi Düzenle' : 'Yeni Görev Taslağı'}</h2>
                  </div>

                  <button className="icon-button" type="button" aria-label="Kapat" onClick={closeTeamTaskModal}>
                    ×
                  </button>
                </header>

                <div className="task-modal-body">
                  <section className="task-modal-section">
                    <label className="task-modal-label" htmlFor="team-task-purpose">
                      Görev amacı ve stratejik hedefler
                    </label>
                    <textarea
                      id="team-task-purpose"
                      className="task-modal-textarea"
                      placeholder="Bu görevin ana hedeflerini ve beklenen çıktıları buraya yazın..."
                      rows={6}
                      value={teamTaskDraft.purpose}
                      onChange={(event) => setTeamTaskDraft((current) => ({ ...current, purpose: event.target.value }))}
                    />
                  </section>

                  <section className="task-modal-row">
                    <div className="task-modal-choice-group">
                      <span className="task-modal-label">Öncelik durumu</span>
                      <div className="task-priority-group">
                        {(['Yüksek', 'Orta', 'Düşük'] as TaskPriority[]).map((priority) => (
                          <button
                            key={priority}
                            className={`task-pill ${teamTaskDraft.priority === priority ? 'active' : ''}`}
                            type="button"
                            onClick={() => setTeamTaskDraft((current) => ({ ...current, priority }))}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="task-modal-date-group">
                      <label className="task-modal-label" htmlFor="team-task-due-date">
                        Bitiş tarihi
                      </label>
                      <input
                        id="team-task-due-date"
                        className="task-modal-input"
                        type="date"
                        value={teamTaskDraft.dueDate}
                        onChange={(event) => setTeamTaskDraft((current) => ({ ...current, dueDate: event.target.value }))}
                      />
                    </div>

                  </section>

                  {isCurrentProjectAdmin ? (
                    <section className="task-modal-section">
                      <label className="task-modal-label" htmlFor="team-task-collaboration-mode">
                        Düzenleme modu
                      </label>
                      <select
                        id="team-task-collaboration-mode"
                        className="task-modal-input"
                        value={teamTaskCollaborationMode}
                        onChange={(event) => setTeamTaskCollaborationMode(event.target.value as TeamTaskCollaborationMode)}
                      >
                        <option value="PUBLIC">Public (herkes düzenleyebilir)</option>
                        <option value="PRIVATE">Private (sadece admin düzenleyebilir)</option>
                      </select>
                    </section>
                  ) : (
                    <section className="task-modal-section">
                      <label className="task-modal-label">Düzenleme modu</label>
                      <div className="status-chip compact team-members-hint">Public</div>
                    </section>
                  )}

                  <section className="task-progress-card">
                    <div className="section-heading">
                      <h3>Alt görevler</h3>
                      <span>{teamTaskChecklist.length}</span>
                    </div>

                    <div className="task-checklist">
                      {teamTaskChecklist.map((subtask) => (
                        <div className="task-checklist-item" key={subtask.id}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <input type="checkbox" checked={subtask.done} onChange={() => toggleTeamTaskChecklistItem(subtask.id)} />
                            <span>{subtask.label}</span>
                          </label>
                          <button
                            className="secondary-button small"
                            type="button"
                            onClick={() => removeTeamTaskChecklistItem(subtask.id)}
                          >
                            Sil
                          </button>
                        </div>
                      ))}

                      <div className="task-checklist-new-row">
                        <input
                          className="task-modal-input"
                          type="text"
                          placeholder="Yeni bir alt görev ekle..."
                          value={teamNewSubtaskText}
                          onChange={(event) => setTeamNewSubtaskText(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addTeamTaskChecklistItem();
                            }
                          }}
                        />
                        <button className="secondary-button" type="button" onClick={addTeamTaskChecklistItem}>
                          Ekle
                        </button>
                      </div>
                    </div>
                  </section>

                  {isCurrentProjectAdmin ? (
                    <section className="task-modal-section">
                      <label className="task-modal-label">Görevin kimlerde görüneceği</label>
                      <div className="task-checklist">
                        {selectedTeamProject?.members.map((member) => {
                          const userId = String(member.userId);
                          return (
                            <label className="task-checklist-item" key={`visible-${member.id}`}>
                              <input
                                type="checkbox"
                                checked={teamTaskVisibleUserIds.includes(userId)}
                                onChange={() => toggleTeamTaskVisibleUser(userId)}
                              />
                              <span>
                                {member.name} ({member.role === 'ADMIN' ? 'Admin' : 'User'})
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  ) : (
                    <section className="task-modal-section">
                      <label className="task-modal-label">Görünürlük</label>
                      <div className="status-chip compact team-members-hint">
                        Bu görev yalnızca sende ve projedeki Admin kullanıcılarında görünecek.
                      </div>
                    </section>
                  )}
                </div>

                <footer className="task-modal-footer">
                  <button className="secondary-button" type="button" onClick={closeTeamTaskModal}>
                    İptal
                  </button>
                  <button className="primary-button" type="button" onClick={createTeamTaskCard}>
                    {teamEditingTaskId ? 'Güncelle' : 'Görevi Oluştur'}
                  </button>
                </footer>
              </section>
            </div>
          )}
        </div>
      );
    }

    if (dashboardView === 'projelerim' || dashboardView === 'yonetim') {
      return (
        <section className="panel section-card task-placeholder">
          <div className="section-heading">
            <h3>Hazırlanıyor</h3>
            <span>Geçici görünüm</span>
          </div>
          <p>Bu bölümün detaylarını sonraki adımda ekleyeceğiz.</p>
          <button className="secondary-button" type="button" onClick={() => setDashboardView('gorevlerim')}>
            Görevlerime dön
          </button>
        </section>
      );
    }

    const normalizedQuery = query.trim().toLowerCase();
    const tasksByStatus = taskBoardColumns.reduce<Record<StaticTaskColumn['status'], TaskCard[]>>(
      (accumulator, column) => {
        accumulator[column.status] = filteredTaskCards.filter((task) => {
          if (task.status !== column.status) {
            return false;
          }

          if (!normalizedQuery) {
            return true;
          }

          return [task.title, task.purpose, task.priority, task.dueDate].join(' ').toLowerCase().includes(normalizedQuery);
        });

        return accumulator;
      },
      { TODO: [], IN_PROGRESS: [], DONE: [] },
    );

    const isTaskModalOpen = dashboardView === 'yeni-gorev';
    const isProjectModalOpen = dashboardView === 'yeni-proje';

    return (
      <>
        <section className="task-board">
          {taskBoardColumns.map((column) => (
            <article
              className={`panel task-column ${column.accentClass}`}
              key={column.status}
              onDragOver={handleColumnDragOver}
              onDrop={(event) => handleColumnDrop(event, column.status)}
            >
              <div className="task-column-header">
                <div>
                  <h3>{column.title}</h3>
                  <p>{column.description}</p>
                </div>
                <span className="status-chip compact">{tasksByStatus[column.status].length}</span>
              </div>

              <div className="task-column-cards">
                {tasksByStatus[column.status].length > 0 ? (
                  tasksByStatus[column.status].map((task) => (
                    <article
                      className={`task-card-mini ${draggedTaskId === task.id ? 'dragging' : ''}`}
                      key={task.id}
                      draggable
                      onDragStart={() => handleTaskDragStart(task.id)}
                      onDragEnd={handleTaskDragEnd}
                    >
                      <div className="task-card-mini-top">
                        <button className={`task-chip ${statusAccentClassMap[task.status]}`} type="button">
                          {task.priority}
                        </button>
                        {task.dueDate ? <small>{task.dueDate}</small> : <span />}
                      </div>
                      <strong>{task.title}</strong>
                      <div className="task-mini-footer">
                        <div className="task-mini-progress">
                          <div className="task-progress-bar">
                            <div style={{ width: `${task.progress}%` }} />
                          </div>
                          <small>{task.progress}%</small>
                        </div>
                        <small>{task.checklistCount} alt görev</small>
                        <button className="secondary-button small" type="button" onClick={() => openTaskEditModal(task)}>
                          Düzenle
                        </button>
                        <button className="secondary-button small" type="button" onClick={() => deleteIndividualTask(task.id)}>
                          Sil
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">Bu kolonda henüz görev yok.</div>
                )}
              </div>
            </article>
          ))}
        </section>

        {isProjectModalOpen && (
          <div className="task-modal-backdrop" role="presentation" onClick={() => setDashboardView('gorevlerim')}>
            <section
              className="task-modal panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-project-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="task-modal-header">
                <div>
                  <span className="eyebrow">Yeni Proje Taslağı</span>
                  <h2 id="new-project-title">Yeni Proje Taslağı</h2>
                </div>

                <button className="icon-button" type="button" aria-label="Kapat" onClick={() => setDashboardView('gorevlerim')}>
                  ×
                </button>
              </header>

              <div className="task-modal-body">
                <section className="task-modal-section">
                  <label className="task-modal-label" htmlFor="project-name">
                    Proje adı
                  </label>
                  <input
                    id="project-name"
                    className="task-modal-input"
                    type="text"
                    placeholder="Yeni proje adı..."
                    value={projectDraft.name}
                    onChange={(event) => setProjectDraft((current) => ({ ...current, name: event.target.value }))}
                  />
                </section>

                <section className="task-modal-section">
                  <label className="task-modal-label" htmlFor="project-description">
                    Proje açıklaması
                  </label>
                  <textarea
                    id="project-description"
                    className="task-modal-textarea"
                    placeholder="Bu proje için kısa bir açıklama yazın..."
                    rows={5}
                    value={projectDraft.description}
                    onChange={(event) => setProjectDraft((current) => ({ ...current, description: event.target.value }))}
                  />
                </section>

                <section className="task-modal-section">
                  <label className="task-modal-label" htmlFor="project-deadline">
                    Proje tarihi
                  </label>
                  <input
                    id="project-deadline"
                    className="task-modal-input"
                    type="date"
                    value={projectDraft.deadline}
                    onChange={(event) => setProjectDraft((current) => ({ ...current, deadline: event.target.value }))}
                  />
                </section>
              </div>

              <footer className="task-modal-footer">
                <button className="secondary-button" type="button" onClick={() => setDashboardView('gorevlerim')}>
                  İptal
                </button>
                <button className="primary-button" type="button" onClick={createProjectCard}>
                  Projeyi Oluştur
                </button>
              </footer>
            </section>
          </div>
        )}

        {isTaskModalOpen && (
          <div className="task-modal-backdrop" role="presentation" onClick={() => {
            setDashboardView('gorevlerim');
            resetIndividualTaskEditor();
          }}>
            <section
              className="task-modal panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-task-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="task-modal-header">
                <div>
                  <span className="eyebrow">Yeni Görev Taslağı</span>
                  <h2 id="new-task-title">{editingTaskId ? 'Görevi Düzenle' : 'Yeni Görev Taslağı'}</h2>
                </div>

                <button className="icon-button" type="button" aria-label="Kapat" onClick={() => {
                  setDashboardView('gorevlerim');
                  resetIndividualTaskEditor();
                }}>
                  ×
                </button>
              </header>

              <div className="task-modal-body">
                <section className="task-modal-section">
                  <label className="task-modal-label" htmlFor="task-purpose">
                    Görev amacı ve stratejik hedefler
                  </label>
                  <textarea
                    id="task-purpose"
                    className="task-modal-textarea"
                    placeholder="Bu görevin ana hedeflerini ve beklenen çıktıları buraya yazın..."
                    rows={6}
                    value={taskDraft.purpose}
                    onChange={(event) => setTaskDraft((current) => ({ ...current, purpose: event.target.value }))}
                  />
                </section>

                <section className="task-modal-row">
                  <div className="task-modal-choice-group">
                    <span className="task-modal-label">Öncelik durumu</span>
                    <div className="task-priority-group">
                      {(['Yüksek', 'Orta', 'Düşük'] as TaskPriority[]).map((priority) => (
                        <button
                          key={priority}
                          className={`task-pill ${taskDraft.priority === priority ? 'active' : ''}`}
                          type="button"
                          onClick={() => setTaskDraft((current) => ({ ...current, priority }))}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="task-modal-date-group">
                    <span className="task-modal-label">Teslim tarihi</span>
                    <input
                      className="task-modal-input"
                      type="date"
                      value={taskDraft.dueDate}
                      onChange={(event) => setTaskDraft((current) => ({ ...current, dueDate: event.target.value }))}
                    />
                  </div>

                  <div className="task-modal-status-group">
                    <span className="task-modal-label">Mevcut durum</span>
                    <div className="task-modal-status">Yapılacaklar</div>
                  </div>
                </section>

                <section className="task-progress-card">
                  <div className="section-heading">
                    <h3>Alt görevler ve kontrol listesi</h3>
                  </div>
                  <div className="task-progress-shell">
                    <div className="task-progress-bar">
                      <div style={{ width: `${taskChecklist.length ? Math.round((taskChecklist.filter((item) => item.done).length / taskChecklist.length) * 100) : 0}%` }} />
                    </div>
                    <strong>
                      {taskChecklist.length ? Math.round((taskChecklist.filter((item) => item.done).length / taskChecklist.length) * 100) : 0}%
                    </strong>
                  </div>

                  <div className="task-checklist">
                    {taskChecklist.map((subtask) => (
                      <div className="task-checklist-item" key={subtask.id}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                          <input type="checkbox" checked={subtask.done} onChange={() => toggleChecklistItem(subtask.id)} />
                          <span>{subtask.label}</span>
                        </label>
                        <button className="secondary-button small" type="button" onClick={() => removeChecklistItem(subtask.id)}>
                          Sil
                        </button>
                      </div>
                    ))}

                    <div className="task-checklist-new-row">
                      <input
                        className="task-modal-input"
                        type="text"
                        placeholder="Yeni bir alt görev ekle..."
                        value={newSubtaskText}
                        onChange={(event) => setNewSubtaskText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addChecklistItem();
                          }
                        }}
                      />
                      <button className="secondary-button" type="button" onClick={addChecklistItem}>
                        Ekle
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              <footer className="task-modal-footer">
                <button className="secondary-button" type="button" onClick={() => {
                  setDashboardView('gorevlerim');
                  resetIndividualTaskEditor();
                }}>
                  İptal
                </button>
                <button className="primary-button" type="button" onClick={createTaskCard}>
                  {editingTaskId ? 'Güncelle' : 'Görevi Oluştur'}
                </button>
              </footer>
            </section>
          </div>
        )}

      </>
    );
  };

  const isTeamView = dashboardView === 'takim';

  return (
    <main className="app-shell">
      <aside className="sidebar panel glow">
        <div className="sidebar-main">
          <div className="brand-block">
            <div className="brand-mark">TM</div>
            <div className="brand-copy">
              <strong style={{ color: 'var(--blue)' }}>Project Management</strong>
            </div>
          </div>

          <div className="sidebar-username-box" aria-label="Kullanıcı adı">
            <span className="sidebar-username-label">Kullanıcı adı</span>
            <strong className="sidebar-username-value">{currentUser?.username ?? 'Misafir'}</strong>
          </div>

          <nav className="sidebar-nav" aria-label="Ana menü">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                className={`sidebar-link ${dashboardView === item.view ? 'active' : ''}`}
                type="button"
                onClick={() => setDashboardView(item.view)}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-link" type="button" onClick={openUserSettingsModal}>
            Ayarlar
          </button>
          {currentUser ? (
            <button className="secondary-button full-width" type="button" onClick={handleLogout}>
              Oturumu Kapat
            </button>
          ) : null}
        </div>
      </aside>

      <div className={`workspace ${dashboardView === 'yeni-gorev' || dashboardView === 'yeni-proje' ? 'dimmed' : ''}`}>
        {!isTeamView && (
          <header className="topbar panel">
          <div className="project-header">
            <span className="eyebrow">Proje yönetimi</span>
            <div className="project-title-row">
              <input
                className="project-name-pill"
                value={selectedProject?.name ?? ''}
                onChange={(event) => updateSelectedProjectName(event.target.value)}
                aria-label="Proje adı"
              />
              <button
                className="project-picker-button"
                type="button"
                aria-label="Proje listesini aç"
                aria-expanded={isProjectMenuOpen}
                onClick={() => setIsProjectMenuOpen((current) => !current)}
              >
                ⌄
              </button>
              {isProjectMenuOpen && (
                <div className="project-picker-popover" role="menu" aria-label="Proje listesi">
                  <span className="project-picker-label">Projeler</span>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`project-picker-item ${project.id === selectedProjectId ? 'active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <button
                        type="button"
                        onClick={() => openProjectPage(project.id)}
                        style={{ all: 'unset', cursor: 'pointer', flex: 1 }}
                      >
                        {project.name}
                      </button>
                      <button className="secondary-button small" type="button" onClick={() => deleteIndividualProject(project.id)}>
                        Sil
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p>
              Seçili proje sayfası. Proje adını doğrudan düzenleyebilir ve listeden başka bir proje açabilirsin.
            </p>
            {selectedProject ? (
              <div className="project-details-panel" style={{ marginTop: 8 }}>
                <p style={{ margin: 0, color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Açıklama:</strong> {selectedProject.description || '-'}
                </p>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Tarih:</strong> {selectedProject.deadline || '-'}
                </p>
              </div>
            ) : null}
          </div>

          <div className="topbar-actions">
            <div className="status-chip compact">{isAdmin ? 'Yönetici modu' : 'Kişisel alan'}</div>
            <button className="primary-button" type="button" onClick={openNewProjectModal}>
              Yeni Proje
            </button>
            <button className="primary-button" type="button" onClick={openNewTaskModal}>
              Yeni Görev
            </button>
          </div>
          </header>
        )}

        {!isTeamView && error && <div className="status-chip error">{error}</div>}

        {renderMainPanel()}

        {isUserSettingsModalOpen && (
          <div className="task-modal-backdrop" role="presentation" onClick={closeUserSettingsModal}>
            <section
              className="task-modal panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-settings-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="task-modal-header">
                <div>
                  <span className="eyebrow">Ayarlar</span>
                  <h2 id="user-settings-title">Kullanıcı İşlemlerini Güncelleme</h2>
                </div>
                <button className="icon-button" type="button" aria-label="Kapat" onClick={closeUserSettingsModal}>
                  ×
                </button>
              </header>

              <div className="task-modal-body">
                <section className="task-modal-section">
                  <label className="task-modal-label" htmlFor="settings-username">
                    Kullanıcı adı
                  </label>
                  <input
                    id="settings-username"
                    className="task-modal-input"
                    value={userSettingsForm.username}
                    onChange={(event) => setUserSettingsForm((current) => ({ ...current, username: event.target.value }))}
                  />
                </section>

                <section className="task-modal-section">
                  <label className="task-modal-label" htmlFor="settings-email">
                    E-posta
                  </label>
                  <input
                    id="settings-email"
                    className="task-modal-input"
                    value={userSettingsForm.email}
                    onChange={(event) => setUserSettingsForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </section>

                <section className="task-modal-section">
                  <label className="task-modal-label" htmlFor="settings-password">
                    Şifre
                  </label>
                  <input
                    id="settings-password"
                    className="task-modal-input"
                    type="password"
                    placeholder="Değiştirmek istemiyorsan boş bırak"
                    value={userSettingsForm.password}
                    onChange={(event) => setUserSettingsForm((current) => ({ ...current, password: event.target.value }))}
                  />
                </section>
              </div>

              <footer className="task-modal-footer">
                <button className="secondary-button" type="button" onClick={closeUserSettingsModal}>
                  İptal
                </button>
                <button className="primary-button" type="button" onClick={updateCurrentUserSettings}>
                  Güncelle
                </button>
              </footer>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;