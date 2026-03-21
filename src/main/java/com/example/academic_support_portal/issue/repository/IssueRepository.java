package com.example.academic_support_portal.issue.repository;

import com.example.academic_support_portal.issue.model.CampusIssue;
import com.example.academic_support_portal.issue.model.IssueStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IssueRepository extends MongoRepository<CampusIssue, String> {
  List<CampusIssue> findByCreatedByUserId(String createdByUserId);

  List<CampusIssue> findByStatus(IssueStatus status);
}
