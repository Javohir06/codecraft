// Update backend/src/main/java/com/codecraft/controller/CollaborationController.java
package com.codecraft.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class CollaborationController {
    
    @MessageMapping("/document/{documentId}")
    @SendTo("/topic/document/{documentId}")
    public CodeChange handleCodeChange(@DestinationVariable String documentId, 
                                     @Payload CodeChange change) {
        System.out.println("Document " + documentId + " - User " + change.getUsername() + " made changes");
        return change;
    }
    
    // DTO for code changes
    public static class CodeChange {
        private String content;
        private String userId;
        private String username;
        private String type; // connect, disconnect, code_change
        
        public CodeChange() {}
        
        // getters and setters
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}