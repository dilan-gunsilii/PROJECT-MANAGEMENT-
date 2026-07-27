package com.taskmanager.user.dto;

import com.taskmanager.domain.Role;
import jakarta.validation.constraints.NotNull;

public class UserRoleRequest {

    @NotNull
    private Role role;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
