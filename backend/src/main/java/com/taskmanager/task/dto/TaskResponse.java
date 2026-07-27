package com.taskmanager.task.dto;

import com.taskmanager.domain.TaskStatus;

public class TaskResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final TaskStatus status;
    private final Long projectId;
    private final Long assignedUserId;

    public TaskResponse(Long id, String title, String description, TaskStatus status, Long projectId, Long assignedUserId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.projectId = projectId;
        this.assignedUserId = assignedUserId;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public Long getProjectId() {
        return projectId;
    }

    public Long getAssignedUserId() {
        return assignedUserId;
    }
}
