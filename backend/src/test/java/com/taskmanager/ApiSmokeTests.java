package com.taskmanager;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiSmokeTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerLoginMeAndProjectTaskFlowWorks() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String username = "user_" + suffix;
        String email = "user_" + suffix + "@taskmanager.local";
        String password = "Password123!";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(username, email, password)))
                .andExpect(status().isCreated());

        String userToken = extractToken(mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn());

        JsonNode currentUser = readBody(mockMvc.perform(get("/users/me")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn());

        assertThat(currentUser.get("username").asText()).isEqualTo(username);
        assertThat(currentUser.get("email").asText()).isEqualTo(email);
        assertThat(currentUser.get("role").asText()).isEqualTo("USER");

        String adminToken = extractToken(mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "admin@taskmanager.local",
                                  "password": "Admin123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn());

        JsonNode adminUser = readBody(mockMvc.perform(get("/users/me")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn());
        long adminId = adminUser.get("id").asLong();

        JsonNode createdProject = readBody(mockMvc.perform(post("/projects")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Smoke Project %s",
                          "description": "End to end smoke"
                        }
                        """.formatted(suffix)))
                .andExpect(status().isCreated())
                .andReturn());

        long projectId = createdProject.get("id").asLong();

        JsonNode createdTask = readBody(mockMvc.perform(post("/projects/%d/tasks".formatted(projectId))
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": "Smoke Task %s",
                          "description": "Verify task flow",
                          "status": "TODO",
                          "assignedUserId": %d
                        }
                        """.formatted(suffix, adminId)))
                .andExpect(status().isCreated())
                .andReturn());

        long taskId = createdTask.get("id").asLong();

        mockMvc.perform(patch("/tasks/%d/status".formatted(taskId))
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "DONE"
                                }
                                """))
                .andExpect(status().isOk());

        JsonNode updatedTask = readBody(mockMvc.perform(get("/tasks/%d".formatted(taskId))
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn());

        assertThat(updatedTask.get("projectId").asLong()).isEqualTo(projectId);
        assertThat(updatedTask.get("status").asText()).isEqualTo("DONE");

        mockMvc.perform(delete("/tasks/%d".formatted(taskId))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/projects/%d".formatted(projectId))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    private String extractToken(MvcResult result) throws Exception {
        JsonNode body = readBody(result);
        return body.get("token").asText();
    }

    private JsonNode readBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
