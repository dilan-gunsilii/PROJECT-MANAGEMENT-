package com.taskmanager.repository;

import com.taskmanager.domain.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByProject_Id(Long projectId);
}
