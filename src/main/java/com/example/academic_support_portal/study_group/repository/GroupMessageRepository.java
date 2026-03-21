package com.example.academic_support_portal.study_group.repository;

import com.example.academic_support_portal.study_group.model.GroupMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface GroupMessageRepository extends MongoRepository<GroupMessage, String> {
  List<GroupMessage> findByGroupIdOrderByTimestampAsc(String groupId);
}
