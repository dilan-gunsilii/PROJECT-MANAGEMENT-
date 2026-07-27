package com.taskmanager.project;

import com.taskmanager.domain.Project;
import com.taskmanager.domain.Role;
import com.taskmanager.domain.User;
import com.taskmanager.project.dto.ProjectRequest;
import com.taskmanager.project.dto.ProjectResponse;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.UserPrincipal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public ProjectResponse createProject(ProjectRequest request, UserPrincipal principal) {
        User owner = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwner(owner);

        return toResponse(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listProjects(UserPrincipal principal) {
        if (principal.getRole() == Role.ADMIN) {
            return projectRepository.findAll().stream().map(this::toResponse).toList();
        }
        return projectRepository.findAllByOwner_Id(principal.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long id, UserPrincipal principal) {
        Project project = getAccessibleProject(id, principal);
        return toResponse(project);
    }

    public ProjectResponse updateProject(Long id, ProjectRequest request, UserPrincipal principal) {
        Project project = getAccessibleProject(id, principal);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        return toResponse(projectRepository.save(project));
    }

    public void deleteProject(Long id, UserPrincipal principal) {
        Project project = getAccessibleProject(id, principal);
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public Project getAccessibleProject(Long id, UserPrincipal principal) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (principal.getRole() != Role.ADMIN && !project.getOwner().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You cannot access this project");
        }
        return project;
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwner().getId(),
                project.getOwner().getUsername());
    }
}
