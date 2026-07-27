package com.taskmanager.task;

import com.taskmanager.security.UserPrincipal;
import com.taskmanager.task.dto.TaskRequest;
import com.taskmanager.task.dto.TaskResponse;
import com.taskmanager.task.dto.TaskStatusRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> create(@PathVariable Long projectId,
                                               @Valid @RequestBody TaskRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(projectId, request, principal));
    }

    @GetMapping("/projects/{projectId}/tasks")
    public List<TaskResponse> listByProject(@PathVariable Long projectId,
                                            @AuthenticationPrincipal UserPrincipal principal) {
        return taskService.listProjectTasks(projectId, principal);
    }

    @GetMapping("/tasks/{id}")
    public TaskResponse get(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return taskService.getTask(id, principal);
    }

    @PutMapping("/tasks/{id}")
    public TaskResponse update(@PathVariable Long id,
                               @Valid @RequestBody TaskRequest request,
                               @AuthenticationPrincipal UserPrincipal principal) {
        return taskService.updateTask(id, request, principal);
    }

    @PatchMapping("/tasks/{id}/status")
    public TaskResponse updateStatus(@PathVariable Long id,
                                     @Valid @RequestBody TaskStatusRequest request,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        return taskService.updateTaskStatus(id, request, principal);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        taskService.deleteTask(id, principal);
        return ResponseEntity.noContent().build();
    }
}
