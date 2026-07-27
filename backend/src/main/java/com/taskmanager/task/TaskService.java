package com.taskmanager.task;

import com.taskmanager.domain.Project;
import com.taskmanager.domain.Role;
import com.taskmanager.domain.Task;
import com.taskmanager.domain.User;
import com.taskmanager.project.ProjectService;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.task.dto.TaskRequest;
import com.taskmanager.task.dto.TaskResponse;
import com.taskmanager.task.dto.TaskStatusRequest;
import com.taskmanager.security.UserPrincipal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, ProjectService projectService, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    public TaskResponse createTask(Long projectId, TaskRequest request, UserPrincipal principal) {
        Project project = projectService.getAccessibleProject(projectId, principal);
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setProject(project);
        task.setAssignedUser(resolveAssignedUser(request.getAssignedUserId()));
        return toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listProjectTasks(Long projectId, UserPrincipal principal) {
        Project project = projectService.getAccessibleProject(projectId, principal);
        return taskRepository.findAllByProject_Id(project.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long id, UserPrincipal principal) {
        Task task = getAccessibleTask(id, principal);
        return toResponse(task);
    }

    public TaskResponse updateTask(Long id, TaskRequest request, UserPrincipal principal) {
        Task task = getAccessibleTask(id, principal);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setAssignedUser(resolveAssignedUser(request.getAssignedUserId()));
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTaskStatus(Long id, TaskStatusRequest request, UserPrincipal principal) {
        Task task = getAccessibleTask(id, principal);
        task.setStatus(request.getStatus());
        return toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long id, UserPrincipal principal) {
        Task task = getAccessibleTask(id, principal);
        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    private Task getAccessibleTask(Long id, UserPrincipal principal) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        if (principal.getRole() != Role.ADMIN && !task.getProject().getOwner().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You cannot access this task");
        }
        return task;
    }

    private User resolveAssignedUser(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned user not found"));
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getProject().getId(),
                task.getAssignedUser() == null ? null : task.getAssignedUser().getId());
    }
}
