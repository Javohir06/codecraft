// Update backend/src/main/java/com/codecraft/controller/DocumentController.java
package com.codecraft.controller;

import com.codecraft.model.Document;
import com.codecraft.model.User;
import com.codecraft.service.DocumentService;
import com.codecraft.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class DocumentController {
    
    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<?> createDocument(@RequestBody CreateDocumentRequest request) {
        try {
            // For demo purposes, use a test user
            // In real app, get from auth token
            User testUser = new User("testuser", "test@example.com", "password");
            testUser.setId(1L); // Set a dummy ID
            
            Document document = documentService.createDocument(
                request.getName() != null ? request.getName() : "Untitled Document",
                request.getContent() != null ? request.getContent() : "// Start coding here...",
                testUser
            );
            
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating document: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable Long id) {
        try {
            Optional<Document> document = documentService.getDocument(id);
            return document.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching document: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Document>> getUserDocuments() {
        try {
            // For demo, return empty list or create test documents
            User testUser = new User("testuser", "test@example.com", "password");
            testUser.setId(1L);
            List<Document> documents = documentService.getUserDocuments(testUser);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
    
    // Request DTO
    public static class CreateDocumentRequest {
        private String name;
        private String content;
        
        // Default constructor
        public CreateDocumentRequest() {}
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}