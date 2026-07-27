package com.taskmanager.project;

import com.taskmanager.project.dto.ProjectRequest;
import com.taskmanager.project.dto.ProjectResponse;
import com.taskmanager.security.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest request,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request, principal));
    }

    @GetMapping
    public List<ProjectResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return projectService.listProjects(principal);
    }

    @GetMapping("/{id}")
    public ProjectResponse get(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return projectService.getProject(id, principal);
    }

    @PutMapping("/{id}")
    public ProjectResponse update(@PathVariable Long id,
                                  @Valid @RequestBody ProjectRequest request,
                                  @AuthenticationPrincipal UserPrincipal principal) {
        return projectService.updateProject(id, request, principal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        projectService.deleteProject(id, principal);
        return ResponseEntity.noContent().build();
    }
}
