package com.example.academic_support_portal.notification;

import com.example.academic_support_portal.tutor.model.TutoringSession;
import com.example.academic_support_portal.tutor_request.model.TutorRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

  private final JavaMailSender mailSender;

  @Value("${app.mail.from:no-reply@academic-support-portal.local}")
  private String fromAddress;

  @Value("${app.frontend.url:http://localhost:5173}")
  private String frontendUrl;

  @Value("${app.mail.enabled:false}")
  private boolean mailEnabled;

  public void sendTutorRequestEmailToTutor(TutorRequest request) {
    if (!mailEnabled) {
      log.info("Mail sending is disabled. Skipping tutor request email. tutorEmail={} requestId={}", request.getTutorEmail(), request.getId());
      return;
    }
    log.info("Preparing tutor request email. tutorEmail={} requestId={}", request.getTutorEmail(), request.getId());
    String subject = "New Tutor Request - Academic Support Portal";
    String body = buildTutorRequestTemplate(request);
    sendPlainText(request.getTutorEmail(), subject, body);
    log.info("Tutor request email dispatched to mail sender. tutorEmail={} requestId={}", request.getTutorEmail(), request.getId());
  }

  public void sendAcceptanceEmailToStudent(TutorRequest request) {
    if (!mailEnabled) {
      log.info("Mail sending is disabled. Skipping session confirmation email. studentEmail={} requestId={}", request.getStudentEmail(), request.getId());
      return;
    }
    String subject = "Your Tutoring Session is Confirmed";
    String body = buildSessionConfirmationTemplate(request);
    sendPlainText(request.getStudentEmail(), subject, body);
  }

  public void notifyTutorOfNewRequest(TutoringSession session) {
    if (session == null) {
      log.warn("Session is null. Skipping tutor notification.");
      return;
    }
    String tutorEmail = safeEmail(session.getTutorEmail());
    if (!StringUtils.hasText(tutorEmail)) {
      log.warn("Tutor email missing. Skipping new request notification. sessionId={}", session.getId());
      return;
    }
    if (!mailEnabled) {
      log.info("Mail sending is disabled. Skipping tutor notification. tutorEmail={} sessionId={}", tutorEmail, session.getId());
      return;
    }
    String subject = "New Tutoring Request Received";
    String body = "Hello " + safe(session.getTutorName()) + ",\n\n"
        + "You have received a new tutoring request.\n\n"
        + "----------- Request Details -----------\n"
        + "Student Name : " + safe(session.getStudentName()) + "\n"
        + "Subject      : " + safe(session.getSubject()) + "\n"
        + "Date         : " + safe(session.getDate()) + "\n"
        + "Time         : " + safe(session.getTime()) + "\n"
        + "Mode         : " + safe(session.getMode()) + "\n"
        + "Message      : " + safe(session.getNote()) + "\n"
        + "---------------------------------------\n\n"
        + "Open dashboard:\n"
        + frontendUrl + "/support/requests\n\n"
        + "Regards,\n"
        + "Academic Support Portal";
    sendPlainText(tutorEmail, subject, body);
    log.info("Tutor request notification sent. sessionId={} tutorEmail={}", session.getId(), tutorEmail);
  }

  public void notifyStudentOfAcceptedRequest(TutoringSession session) {
    if (session == null) {
      log.warn("Session is null. Skipping student acceptance notification.");
      return;
    }
    String studentEmail = safeEmail(session.getStudentEmail());
    if (!StringUtils.hasText(studentEmail)) {
      log.warn("Student email missing. Skipping acceptance notification. sessionId={}", session.getId());
      return;
    }
    if (!mailEnabled) {
      log.info("Mail sending is disabled. Skipping acceptance notification. studentEmail={} sessionId={}", studentEmail, session.getId());
      return;
    }
    String subject = "Your Tutoring Request Was Accepted";
    String body = "Hello " + safe(session.getStudentName()) + ",\n\n"
        + "Your tutoring request has been accepted.\n\n"
        + "-------- Confirmed Session Details --------\n"
        + "Tutor Name   : " + safe(session.getTutorName()) + "\n"
        + "Subject      : " + safe(session.getSubject()) + "\n"
        + "Date         : " + safe(session.getDate()) + "\n"
        + "Time         : " + safe(session.getTime()) + "\n"
        + "Mode         : " + safe(session.getMode()) + "\n"
        + "Status       : " + safe(session.getStatus()) + "\n"
        + "Tutor Note   : " + safe(session.getTutorNote()) + "\n"
        + "-------------------------------------------\n\n"
        + "Open dashboard:\n"
        + frontendUrl + "/support/requests\n\n"
        + "Regards,\n"
        + "Academic Support Portal";
    sendPlainText(studentEmail, subject, body);
    log.info("Student acceptance notification sent. sessionId={} studentEmail={}", session.getId(), studentEmail);
  }

  public void notifyStudentOfRejectedRequest(TutoringSession session) {
    if (session == null) {
      log.warn("Session is null. Skipping student rejection notification.");
      return;
    }
    String studentEmail = safeEmail(session.getStudentEmail());
    if (!StringUtils.hasText(studentEmail)) {
      log.warn("Student email missing. Skipping rejection notification. sessionId={}", session.getId());
      return;
    }
    if (!mailEnabled) {
      log.info("Mail sending is disabled. Skipping rejection notification. studentEmail={} sessionId={}", studentEmail, session.getId());
      return;
    }
    String subject = "Your Tutoring Request Was Rejected";
    String body = "Hello " + safe(session.getStudentName()) + ",\n\n"
        + "Your tutoring request has been rejected.\n\n"
        + "----------- Request Details -----------\n"
        + "Tutor Name   : " + safe(session.getTutorName()) + "\n"
        + "Subject      : " + safe(session.getSubject()) + "\n"
        + "Date         : " + safe(session.getDate()) + "\n"
        + "Time         : " + safe(session.getTime()) + "\n"
        + "Status       : " + safe(session.getStatus()) + "\n"
        + "Tutor Note   : " + safe(session.getTutorNote()) + "\n"
        + "---------------------------------------\n\n"
        + "Open dashboard:\n"
        + frontendUrl + "/support/requests\n\n"
        + "Regards,\n"
        + "Academic Support Portal";
    sendPlainText(studentEmail, subject, body);
    log.info("Student rejection notification sent. sessionId={} studentEmail={}", session.getId(), studentEmail);
  }

  public void sendBookingRequestEmail(
      String tutorEmail,
      String tutorName,
      String studentName,
      String subjectName,
      String sessionDate,
      String sessionTime,
      String note) {
    if (!mailEnabled) {
      log.info("Mail sending is disabled. Skipping booking request email. tutorEmail={}", tutorEmail);
      return;
    }
    String subject = "New Booking Request - Academic Support Portal";
    String body = "Hello " + safe(tutorName) + ",\n\n"
        + "You have a new tutoring booking request.\n\n"
        + "----------- Booking Details -----------\n"
        + "Student Name : " + safe(studentName) + "\n"
        + "Subject      : " + safe(subjectName) + "\n"
        + "Session Date : " + safe(sessionDate) + "\n"
        + "Time         : " + safe(sessionTime) + "\n"
        + "Note         : " + safe(note) + "\n"
        + "---------------------------------------\n\n"
        + "Open dashboard:\n"
        + frontendUrl + "/support/requests\n\n"
        + "Regards,\n"
        + "Academic Support Portal";
    sendPlainText(tutorEmail, subject, body);
  }

  public void sendSessionConfirmationForBooking(
      String studentEmail,
      String studentName,
      String tutorName,
      String subjectName,
      String sessionDate,
      String sessionTime,
      String joinLink) {
    if (studentEmail == null || studentEmail.isBlank()) {
      log.warn("Student email is missing. Skipping booking confirmation email.");
      return;
    }
    if (!mailEnabled) {
      log.info("Mail sending is disabled. Skipping booking confirmation email. studentEmail={}", studentEmail);
      return;
    }
    String subject = "Your Booking is Confirmed - Academic Support Portal";
    String body = "Hello " + safe(studentName) + ",\n\n"
        + "Your tutoring booking has been accepted by the tutor.\n\n"
        + "------ Confirmed Session Details ------\n"
        + "Tutor Name   : " + safe(tutorName) + "\n"
        + "Subject      : " + safe(subjectName) + "\n"
        + "Session Date : " + safe(sessionDate) + "\n"
        + "Time         : " + safe(sessionTime) + "\n"
        + "Join Link    : " + safe(joinLink) + "\n"
        + "---------------------------------------\n\n"
        + "Open dashboard:\n"
        + frontendUrl + "/support/requests\n\n"
        + "Regards,\n"
        + "Academic Support Portal";
    sendPlainText(studentEmail, subject, body);
  }

  private void sendPlainText(String to, String subject, String body) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(fromAddress);
    message.setTo(to);
    message.setSubject(subject);
    message.setText(body);
    mailSender.send(message);
    log.info("Email sent to {} with subject '{}'", to, subject);
  }

  private String buildTutorRequestTemplate(TutorRequest request) {
    return "Hello " + safe(request.getTutorName()) + ",\n\n"
        + "You have received a new tutor request in Academic Support Portal.\n\n"
        + "----------- Request Details -----------\n"
        + "Student Name : " + safe(request.getStudentName()) + "\n"
        + "Student Email: " + safe(request.getStudentEmail()) + "\n"
        + "Subject      : " + safe(request.getSubject()) + "\n"
        + "Preferred Day: " + safe(request.getPreferredDay()) + "\n"
        + "From         : " + safe(request.getPreferredTimeFrom()) + "\n"
        + "To           : " + safe(request.getPreferredTimeTo()) + "\n"
        + "Message      : " + safe(request.getMessage()) + "\n"
        + "---------------------------------------\n\n"
        + "Open and respond from your dashboard:\n"
        + frontendUrl + "/support/requests\n"
        + "If the link does not open, login and go to Support > My Requests.\n\n"
        + "Regards,\n"
        + "Academic Support Portal";
  }

  private String buildSessionConfirmationTemplate(TutorRequest request) {
    return "Hello " + safe(request.getStudentName()) + ",\n\n"
        + "Your tutoring session has been confirmed.\n\n"
        + "-------- Confirmed Session Details --------\n"
        + "Tutor Name   : " + safe(request.getTutorName()) + "\n"
        + "Subject      : " + safe(request.getSubject()) + "\n"
        + "Date/Time    : " + safe(request.getSessionDateTime()) + "\n"
        + "Join Link    : " + safe(request.getJoinLink()) + "\n"
        + "-------------------------------------------\n\n"
        + "Please join the session on time.\n\n"
        + "Regards,\n"
        + "Academic Support Portal";
  }

  private String safe(String value) {
    return value == null || value.isBlank() ? "-" : value;
  }

  private String safeEmail(String value) {
    if (value == null) return null;
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}
