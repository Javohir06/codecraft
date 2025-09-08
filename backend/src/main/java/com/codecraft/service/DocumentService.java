// backend/src/main/java/com/codecraft/service/DocumentService.java
package com.codecraft.service;

import com.codecraft.model.Document;
import com.codecraft.model.User;
import com.codecraft.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    public Document createDocument(String name, String content, User owner) {
        Document document = new Document(name, content, owner);
        return documentRepository.save(document);
    }
    
    public Optional<Document> getDocument(Long id) {
        return documentRepository.findById(id);
    }
    
    public List<Document> getUserDocuments(User owner) {
        return documentRepository.findByOwner(owner);
    }
    
    public Document updateDocumentContent(Long documentId, String newContent) {
        Optional<Document> doc = documentRepository.findById(documentId);
        if (doc.isPresent()) {
            Document document = doc.get();
            document.setContent(newContent);
            return documentRepository.save(document);
        }
        throw new RuntimeException("Document not found");
    }
}