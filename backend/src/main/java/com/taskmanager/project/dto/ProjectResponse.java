package com.taskmanager.project.dto;

public class ProjectResponse {

    private final Long id;
    private final String name;
    private final String description;
    private final Long ownerId;
    private final String ownerUsername;

    public ProjectResponse(Long id, String name, String description, Long ownerId, String ownerUsername) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.ownerId = ownerId;
        this.ownerUsername = ownerUsername;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }
}
