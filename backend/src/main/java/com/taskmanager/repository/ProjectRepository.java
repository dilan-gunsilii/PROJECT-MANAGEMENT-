package com.taskmanager.repository;

import com.taskmanager.domain.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findAllByOwner_Id(Long ownerId);
}
