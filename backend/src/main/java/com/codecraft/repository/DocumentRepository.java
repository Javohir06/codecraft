// backend/src/main/java/com/codecraft/repository/DocumentRepository.java
package com.codecraft.repository;

import com.codecraft.model.Document;
import com.codecraft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByOwner(User owner);
}