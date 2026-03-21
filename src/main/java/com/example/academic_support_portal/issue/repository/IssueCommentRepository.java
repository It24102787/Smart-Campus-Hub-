package com.example.academic_support_portal.issue.repository;

import com.example.academic_support_portal.issue.model.IssueComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IssueCommentRepository extends MongoRepository<IssueComment, String> {
  List<IssueComment> findByIssueIdOrderByCreatedAtAsc(String issueId);
}
