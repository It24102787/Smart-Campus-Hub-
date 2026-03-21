import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronRight,
  Download,
  FileText,
  MessageCircle,
  Plus,
  Search,
  Send,
  Star,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { tutorApi, tutorRequestApi, studyGroupApi, resourceApi, progressApi } from '../../api/supportApi';
import { useAuth } from '../../context/AuthContext';
import { SUBJECTS, DAYS } from '../../utils/constants';
import TutorRequestForm from './TutorRequest';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TutorCard = ({ tutor, onBook, onViewProfile }) => (
  <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onViewProfile(tutor)}>
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.name}`} alt={tutor.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 cursor-pointer" onClick={() => onViewProfile(tutor)}>
        <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{tutor.name}</h3>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{(tutor.subjects || []).join(', ')}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1 text-amber-500 font-black">
          <Star size={16} fill="currentColor" /> {tutor.averageRating?.toFixed?.(1) ?? '0.0'}
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1">{tutor.totalReviews || 0} reviews</p>
      </div>
    </div>

    <div className="space-y-3 mb-6">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-widest">Email</span>
        <span className="text-slate-900 font-bold break-all text-right">{tutor.email || 'N/A'}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-widest">Available</span>
        <span className="text-slate-900 font-bold">{tutor.availability}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-widest">Mode</span>
        <span className="text-slate-900 font-bold">{tutor.mode}</span>
      </div>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => onViewProfile(tutor)}
        className="flex-1 py-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all text-sm"
      >
        Profile
      </button>
      <button
        onClick={() => onBook(tutor)}
        className="flex-[2] py-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
      >
        Book Now
      </button>
    </div>
  </div>
);

const GroupCard = ({ group, onToggleMembership, onViewDetails }) => (
  <div
    className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
    onClick={() => onViewDetails(group)}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
        <Users size={24} />
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{group.memberCount || 0}{group.maxMembers ? ` / ${group.maxMembers}` : ''} Members</span>
        {group.joined && <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest">Joined</span>}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2">{group.title}</h3>
    <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">{group.description}</p>
    <div className="mb-6 text-xs text-slate-300 font-semibold space-y-1">
      <p>Subject: {group.subject}</p>
      {group.meetingDay && <p>Schedule: {group.meetingDay}{group.meetingTime ? ` at ${group.meetingTime}` : ''}</p>}
      <p>Created by: {group.createdByName || 'Unknown'}</p>
    </div>
    <div className="flex items-center justify-between pt-6 border-t border-white/5">
      <button
        onClick={(event) => {
          event.stopPropagation();
          onViewDetails(group);
        }}
        className="text-slate-300 font-bold text-sm"
      >
        Details
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onToggleMembership(group);
        }}
        className="text-primary font-bold text-sm flex items-center gap-1"
      >
        {group.joined ? 'Leave Circle' : 'Join Circle'} <ChevronRight size={18} />
      </button>
    </div>
  </div>
);

const AcademicSupportPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isStudent = userRoles.includes('STUDENT');
  const isTutor = userRoles.includes('TUTOR');
  const isAdmin = userRoles.includes('ADMIN');
  const currentPath = location.pathname.split('/').pop() || 'tutors';
  const canCreateTutorProfile = isAdmin || isTutor;

  const [tutors, setTutors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [resources, setResources] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTutor, setSelectedTutor] = useState(null);
  const [viewedTutor, setViewedTutor] = useState(null);
  const [chatGroup, setChatGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [bookingForm, setBookingForm] = useState({ tutorEmail: '', subject: '', date: '', time: '', note: '' });
  const [bookingErrors, setBookingErrors] = useState({});
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: '', comment: '' });
  const [reviewErrors, setReviewErrors] = useState({});
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAddTutorModal, setShowAddTutorModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [circleSuccess, setCircleSuccess] = useState('');
  const [joiningCircleId, setJoiningCircleId] = useState('');
  const [tutorForm, setTutorForm] = useState({
    name: '',
    email: '',
    subjects: '',
    availability: '',
    mode: 'Online',
    bio: '',
    qualifications: ''
  });
  const [tutorErrors, setTutorErrors] = useState({});
  const [groupForm, setGroupForm] = useState({
    title: '',
    subject: '',
    description: '',
    meetingDay: '',
    meetingTime: '',
    maxMembers: 10
  });
  const [groupErrors, setGroupErrors] = useState({});
  const [progressForm, setProgressForm] = useState({
    moduleCode: '',
    moduleName: '',
    status: 'In Progress',
    grade: '',
    gpaContribution: 0.0
  });
  const [progressErrors, setProgressErrors] = useState({});
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    subject: '',
    description: '',
    type: 'PDF',
    file: null
  });
  const [resourceErrors, setResourceErrors] = useState({});
  const [isResourceDragOver, setIsResourceDragOver] = useState(false);

  const [tutorFilters, setTutorFilters] = useState({
    subject: '',
    mode: '',
    availability: ''
  });

  const chatEndRef = useRef(null);

  const mapSessionToRequest = (session) => {
    if (!session) return null;
    const sessionDateTime = session?.date && session?.time
      ? new Date(`${session.date}T${session.time}`)
      : null;

    return {
      id: `session-${session.id || `${session.studentId || 'student'}-${session.tutorId || 'tutor'}-${session.date || 'date'}-${session.time || 'time'}`}`,
      sourceType: 'SESSION',
      sourceId: session.id || null,
      tutorId: session.tutorId,
      tutorName: session.tutorName || '',
      tutorEmail: session.tutorEmail || '',
      studentId: session.studentId,
      studentName: session.studentName || '',
      studentEmail: session.studentEmail || '',
      subject: session.subject,
      status: session.status || 'REQUESTED',
      joinLink: session.joinLink || '',
      sessionDateTime: sessionDateTime && !Number.isNaN(sessionDateTime.getTime())
        ? sessionDateTime.toISOString()
        : null,
      preferredDay: session.date || '',
      preferredTimeFrom: session.time || '',
      preferredTimeTo: ''
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [tList, gList, myCircles, rList] = await Promise.all([
        tutorApi.getAll(tutorFilters),
        studyGroupApi.getAll(),
        studyGroupApi.getMy().catch(() => []),
        resourceApi.getAll()
      ]);
      setTutors(tList);
      const myCircleIdSet = new Set((myCircles || []).map((circle) => circle.id));
      setGroups((gList || []).map((circle) => ({
        ...circle,
        joined: Boolean(circle.joined || myCircleIdSet.has(circle.id))
      })));
      setResources(rList);

      if (user) {
        const requestsPromise = isTutor
          ? tutorRequestApi.getTutorRequests(user.email, 'ALL')
          : tutorRequestApi.getAll({ studentId: user.id });
        const sessionsPromise = tutorApi.getSessions(user.id, isTutor ? 'TUTOR' : 'STUDENT');

        const [requestsResult, sessionsResult, progressResult] = await Promise.allSettled([
          requestsPromise,
          sessionsPromise,
          progressApi.getAll(user.id)
        ]);

        const requests = requestsResult.status === 'fulfilled' ? requestsResult.value : [];
        const sessions = sessionsResult.status === 'fulfilled' ? sessionsResult.value : [];
        const progress = progressResult.status === 'fulfilled' ? progressResult.value : [];

        if (requestsResult.status === 'rejected') {
          console.warn('Failed to load tutor requests:', requestsResult.reason);
        }
        if (sessionsResult.status === 'rejected') {
          console.warn('Failed to load tutoring sessions:', sessionsResult.reason);
        }
        if (progressResult.status === 'rejected') {
          console.warn('Failed to load progress records:', progressResult.reason);
        }

        const sessionBasedRequests = (sessions || []).map(mapSessionToRequest).filter(Boolean);
        const merged = [...(requests || []), ...sessionBasedRequests];
        setMyRequests(merged);
        setProgressRecords(progress);
      }
    } catch (err) {
      console.error("Failed to load academic support data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (!circleSuccess) {
      return undefined;
    }
    const timer = setTimeout(() => setCircleSuccess(''), 3000);
    return () => clearTimeout(timer);
  }, [circleSuccess]);

  useEffect(() => {
    let interval;
    if (chatGroup) {
      const fetchMessages = async () => {
        try {
          const msgs = await studyGroupApi.getMessages(chatGroup.id);
          setMessages(msgs);
        } catch (e) {
          console.error("Chat sync error", e);
        }
      };
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [chatGroup]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedTutor) {
      setBookingForm(prev => ({
        ...prev,
        tutorEmail: selectedTutor.email || prev.tutorEmail || '',
        subject: (selectedTutor.subjects || [])[0] || prev.subject || ''
      }));
    }
  }, [selectedTutor]);

  useEffect(() => {
    const loadTutorReviews = async () => {
      if (!viewedTutor?.id) {
        return;
      }
      try {
        setReviewsLoading(true);
        const [allReviews, summary] = await Promise.all([
          tutorApi.getReviews(viewedTutor.id),
          tutorApi.getRatingSummary(viewedTutor.id)
        ]);
        setReviews(allReviews || []);
        setRatingSummary(summary || { averageRating: 0, totalReviews: 0 });
      } catch (err) {
        console.error('Failed to load tutor reviews', err);
        setReviews([]);
        setRatingSummary({ averageRating: 0, totalReviews: 0 });
      } finally {
        setReviewsLoading(false);
      }
    };

    setReviewForm({ rating: '', comment: '' });
    setReviewErrors({});
    setReviewSuccess('');
    loadTutorReviews();
  }, [viewedTutor]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatGroup || !user) return;
    try {
      await studyGroupApi.sendMessage(chatGroup.id, {
        senderId: user.id,
        senderName: user.name,
        content: newMessage
      });
      setNewMessage("");
      const msgs = await studyGroupApi.getMessages(chatGroup.id);
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleApplyTutorFilters = async (nextFilters) => {
    try {
      setLoading(true);
      setTutorFilters(nextFilters);
      const data = await tutorApi.getAll(nextFilters);
      setTutors(data);
    } catch (err) {
      console.error('Failed to filter tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateBooking = () => {
    const errs = {};
    if (!selectedTutor?.id) errs.tutorId = "Tutor is required";
    if (!bookingForm.tutorEmail?.trim()) errs.tutorEmail = "Tutor email is required";
    if (!user?.id) errs.studentId = "Student is required";
    if (!bookingForm.subject?.trim()) errs.subject = "Subject is required";
    if (!bookingForm.date) errs.date = "Date is required";
    if (!bookingForm.time) errs.time = "Time is required";
    setBookingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRequestSession = async () => {
    if (!selectedTutor || !user) return;
    if (!validateBooking()) return;

    try {
      setLoading(true);
      const payload = {
        tutorId: selectedTutor.id,
        tutorEmail: bookingForm.tutorEmail.trim(),
        studentId: user.id,
        subject: bookingForm.subject.trim(),
        date: bookingForm.date,
        time: bookingForm.time,
        note: bookingForm.note?.trim() || '',
        mode: selectedTutor.mode || 'Online'
      };
      await tutorApi.bookSession(payload);
      setSelectedTutor(null);
      setBookingForm({ tutorEmail: '', subject: '', date: '', time: '', note: '' });
      loadData();
      alert("Session booked successfully.");
    } catch (err) {
      console.error("Session request failed:", err);
      if (err.response?.status === 400) {
        const serverErrors = err.response.data || {};
        if (serverErrors.message) {
          setBookingErrors((prev) => ({ ...prev, _message: serverErrors.message }));
        } else {
          setBookingErrors(serverErrors);
        }
      } else {
        alert(err.response?.data?.message || "Failed to book session. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateTutorForm = () => {
    const errs = {};
    if (!tutorForm.name.trim()) errs.name = "Name is required";
    if (!tutorForm.email.trim()) errs.email = "Email is required";
    if (tutorForm.email && !/^\S+@\S+\.\S+$/.test(tutorForm.email)) errs.email = "Valid email is required";
    if (!tutorForm.subjects.trim()) errs.subjects = "At least one subject is required";
    if (!tutorForm.availability.trim()) errs.availability = "Availability is required";
    if (!tutorForm.mode.trim()) errs.mode = "Mode is required";
    setTutorErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddTutor = async () => {
    if (!canCreateTutorProfile) {
      alert("Only tutor or admin accounts can register tutor profiles.");
      return;
    }

    if (!validateTutorForm()) return;
    try {
      setLoading(true);
      await tutorApi.create({
        name: tutorForm.name.trim(),
        email: tutorForm.email.trim(),
        subjects: tutorForm.subjects.split(',').map(s => s.trim()).filter(Boolean),
        availability: tutorForm.availability.trim(),
        mode: tutorForm.mode.trim(),
        bio: tutorForm.bio?.trim() || '',
        qualifications: tutorForm.qualifications?.trim() || ''
      });
      setShowAddTutorModal(false);
      setTutorForm({ name: '', email: '', subjects: '', availability: '', mode: 'Online', bio: '', qualifications: '' });
      loadData();
    } catch (err) {
      console.error("Add tutor failed:", err);
      if (err.response?.status === 400) {
        setTutorErrors(err.response.data);
      } else if (err.response?.status === 403) {
        alert("Access denied. Please sign in with an admin account.");
      } else {
        alert(err.response?.data?.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTutor = async (id) => {
    if (!window.confirm("Are you sure you want to remove this tutor?")) return;
    try {
      setLoading(true);
      // We need a delete method in tutorApi
      await tutorApi.delete(id);
      loadData();
    } catch (err) {
      console.error("Delete tutor failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateGroupForm = () => {
    const errs = {};
    if (!groupForm.title.trim()) errs.title = "Circle title is required";
    if (!groupForm.subject) errs.subject = "Subject is required";
    if (!groupForm.description.trim()) errs.description = "Description is required";
    if (groupForm.maxMembers && Number(groupForm.maxMembers) < 2) errs.maxMembers = "Max members must be at least 2";
    setGroupErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateGroup = async () => {
    if (!validateGroupForm()) return;
    try {
      setLoading(true);
      await studyGroupApi.create({
        title: groupForm.title.trim(),
        description: groupForm.description.trim(),
        subject: groupForm.subject,
        meetingDay: groupForm.meetingDay || null,
        meetingTime: groupForm.meetingTime || null,
        maxMembers: groupForm.maxMembers ? Number(groupForm.maxMembers) : null
      });
      setShowAddGroupModal(false);
      setGroupForm({ title: '', subject: '', description: '', meetingDay: '', meetingTime: '', maxMembers: 10 });
      setCircleSuccess('Circle created successfully.');
      await loadData();
    } catch (err) {
      console.error("Create group failed:", err);
      if (err.response?.status === 400) {
        setGroupErrors(err.response.data);
      } else {
        alert(err.response?.data?.message || "Failed to create group.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCircleMembership = async (group) => {
    if (!user) return;
    try {
      setJoiningCircleId(group.id);
      if (group.joined) {
        const updated = await studyGroupApi.leave(group.id);
        setSelectedCircle(updated);
        setCircleSuccess('You have left the circle.');
      } else {
        const updated = await studyGroupApi.join(group.id);
        setSelectedCircle(updated);
        setCircleSuccess('Joined circle successfully.');
      }
      await loadData();
    } catch (err) {
      console.error("Join failed:", err);
      alert(err.response?.data?.message || "Unable to join this group.");
    } finally {
      setJoiningCircleId('');
    }
  };

  const handleOpenCircleDetails = async (group) => {
    try {
      const details = await studyGroupApi.getById(group.id);
      setSelectedCircle(details);
    } catch (err) {
      console.error('Failed to load circle details:', err);
      alert(err.response?.data?.message || 'Failed to load circle details.');
    }
  };

  const handleAddProgress = async () => {
    if (!user) return;
    setLoading(true);
    setProgressErrors({});
    try {
      await progressApi.create({ ...progressForm, studentId: user.id });
      setProgressForm({ moduleCode: '', moduleName: '', status: 'In Progress', grade: '', gpaContribution: 0.0 });
      setShowProgressModal(false);
      loadData();
    } catch (err) {
      console.error("Add progress failed:", err);
      if (err.response?.status === 400) {
        setProgressErrors(err.response.data);
      } else {
        alert(err.response?.data?.message || "Failed to add progress record.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResource = async () => {
    if (!user) return;
    const errs = {};
    if (!resourceForm.title?.trim()) errs.title = "Title is required";
    if (!resourceForm.subject?.trim()) errs.subject = "Subject is required";
    if (!resourceForm.file) errs.file = "Please select a file";
    if (resourceForm.file && resourceForm.file.size > 10 * 1024 * 1024) errs.file = "File size must be 10MB or less";
    if (Object.keys(errs).length > 0) {
      setResourceErrors(errs);
      return;
    }

    setLoading(true);
    setResourceErrors({});
    try {
      const formData = new FormData();
      formData.append('title', resourceForm.title.trim());
      formData.append('subject', resourceForm.subject.trim());
      formData.append('description', resourceForm.description?.trim() || '');
      formData.append('type', resourceForm.type || 'PDF');
      formData.append('uploaderId', user.id || '');
      formData.append('uploaderName', user.name || '');
      formData.append('file', resourceForm.file);
      await resourceApi.create(formData);
      setResourceForm({ title: '', subject: '', description: '', type: 'PDF', file: null });
      closeResourceModal();
      loadData();
    } catch (err) {
      console.error("Upload resource failed:", err);
      const serverMessage = err.response?.data?.message;
      if (err.response?.status === 400 && err.response?.data && typeof err.response.data === 'object') {
        setResourceErrors({ ...err.response.data, _message: serverMessage });
      } else {
        setResourceErrors({ _message: serverMessage || "Failed to upload resource. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgress = async (id) => {
    if (window.confirm("Are you sure?")) {
      await progressApi.delete(id);
      loadData();
    }
  };

  const handleResourceFileSelect = (file) => {
    if (!file) return;
    setResourceForm((prev) => {
      const dot = file.name.lastIndexOf('.');
      const derivedTitle = dot > 0 ? file.name.slice(0, dot) : file.name;
      return {
        ...prev,
        file,
        title: prev.title || derivedTitle
      };
    });
    setResourceErrors((prev) => ({ ...prev, file: undefined }));
  };

  const handleResourceFileInput = (e) => {
    const file = e.target.files?.[0];
    handleResourceFileSelect(file);
    e.target.value = '';
  };

  const handleResourceDrop = (e) => {
    e.preventDefault();
    setIsResourceDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleResourceFileSelect(file);
  };

  const closeResourceModal = () => {
    setShowResourceModal(false);
    setIsResourceDragOver(false);
    setResourceErrors({});
    setResourceForm({ title: '', subject: '', description: '', type: 'PDF', file: null });
  };

  const validateReview = () => {
    const errs = {};
    const rating = Number(reviewForm.rating);
    if (!Number.isInteger(rating)) errs.rating = 'Rating is required';
    if (Number.isInteger(rating) && (rating < 1 || rating > 5)) errs.rating = 'Rating must be between 1 and 5';
    setReviewErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitReview = async () => {
    if (!isStudent || !viewedTutor?.id) return;
    if (!validateReview()) return;

    try {
      setReviewSubmitting(true);
      await tutorApi.createOrUpdateReview(viewedTutor.id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment?.trim() || ''
      });
      const [allReviews, summary, tutorDetail] = await Promise.all([
        tutorApi.getReviews(viewedTutor.id),
        tutorApi.getRatingSummary(viewedTutor.id),
        tutorApi.getById(viewedTutor.id)
      ]);
      setReviews(allReviews || []);
      setRatingSummary(summary || { averageRating: 0, totalReviews: 0 });
      setViewedTutor(tutorDetail);
      setTutors(prev => prev.map(t => t.id === tutorDetail.id ? tutorDetail : t));
      setReviewSuccess('Review saved successfully.');
      setReviewErrors({});
    } catch (err) {
      console.error('Failed to save review:', err);
      setReviewSuccess('');
      alert(err.response?.data?.message || 'Failed to save review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading && tutors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading academic resources...</p>
      </div>
    );
  }

  const tabs = isTutor
    ? [{ id: 'requests', label: 'My Requests', path: '/support/requests' }]
    : [
      { id: 'tutors', label: 'Tutors', path: '/support/tutors' },
      { id: 'groups', label: 'Circles', path: '/support/groups' },
      { id: 'resources', label: 'Library', path: '/support/resources' },
      { id: 'progress', label: 'Calendar', path: '/support/progress' },
      { id: 'requests', label: 'My Requests', path: '/support/requests' }
    ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{isTutor ? 'Tutor Dashboard' : 'Academic Support'}</h1>
          <p className="text-slate-500 mt-1 font-medium italic">{isTutor ? 'Manage and respond to student tutor requests.' : 'Peer excellence through collaboration.'}</p>
        </div>

        <div className="flex bg-white p-2 rounded-[24px] border border-slate-100 shadow-xl overflow-x-auto scrollbar-none items-center gap-2">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                currentPath === tab.id || (currentPath === 'support' && tab.id === 'tutors')
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {tab.label}
            </Link>
          ))}
          {canCreateTutorProfile && (
            <>
              <div className="w-px h-8 bg-slate-100 mx-2 hidden md:block"></div>
              <button
                onClick={() => setShowAddTutorModal(true)}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all whitespace-nowrap"
              >
                + Add Tutor
              </button>
            </>
          )}
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        <Routes>
          <Route index element={<TutorsView tutors={tutors} onBook={setSelectedTutor} onViewProfile={setViewedTutor} filters={tutorFilters} onApplyFilters={handleApplyTutorFilters} isAdmin={isAdmin} canAddTutor={canCreateTutorProfile} onAddTutor={() => setShowAddTutorModal(true)} onDeleteTutor={handleDeleteTutor} />} />
          <Route path="tutors" element={<TutorsView tutors={tutors} onBook={setSelectedTutor} onViewProfile={setViewedTutor} filters={tutorFilters} onApplyFilters={handleApplyTutorFilters} isAdmin={isAdmin} canAddTutor={canCreateTutorProfile} onAddTutor={() => setShowAddTutorModal(true)} onDeleteTutor={handleDeleteTutor} />} />
          <Route
            path="groups"
            element={
              <GroupsView
                groups={groups}
                onToggleMembership={handleToggleCircleMembership}
                onOpenDetails={handleOpenCircleDetails}
                onAddGroup={() => setShowAddGroupModal(true)}
                joiningCircleId={joiningCircleId}
                circleSuccess={circleSuccess}
              />
            }
          />
          <Route path="resources" element={<ResourcesView resources={resources} onAdd={() => setShowResourceModal(true)} user={user} isAdmin={isAdmin} onDelete={(id) => setResources((prev) => prev.filter((r) => r.id !== id))} />} />
          <Route path="progress" element={<ProgressView requests={myRequests} />} />
          <Route path="requests" element={<RequestsView requests={myRequests} user={user} tutors={tutors} onRefresh={loadData} />} />
          <Route path="tutors/request" element={<TutorRequestForm />} />
        </Routes>
      </div>

      {/* Overlays */}
      {viewedTutor && (
        <Modal title="Tutor Profile" onClose={() => setViewedTutor(null)}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden mb-4 border-4 border-primary/10 shadow-lg">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewedTutor.name}`} alt={viewedTutor.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{viewedTutor.name}</h3>
            <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">{(viewedTutor.subjects || []).join(', ')}</p>
            <div className="flex items-center gap-1 text-amber-500 font-black mt-2">
              <Star size={20} fill="currentColor" /> {ratingSummary.averageRating?.toFixed?.(1) ?? '0.0'} ({ratingSummary.totalReviews || 0})
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subjects</p>
                <p className="text-lg font-black text-slate-900">{(viewedTutor.subjects || []).join(', ')}</p>
              </div>
              <div className="flex-1 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Qualifications</p>
                <p className="text-lg font-black text-slate-900">{viewedTutor.qualifications || 'Not provided'}</p>
              </div>
            </div>

            {viewedTutor.bio && (
              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">About the Tutor</p>
                <p className="text-slate-600 font-medium leading-relaxed">{viewedTutor.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Availability</p>
                <p className="text-lg font-black text-slate-900">{viewedTutor.availability}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mode</p>
                <p className="text-lg font-black text-slate-900">{viewedTutor.mode}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tutor Email</p>
              <p className="text-lg font-black text-slate-900 break-all">{viewedTutor.email || 'N/A'}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Reviews</p>
              {reviewsLoading && <p className="text-sm text-slate-500">Loading reviews...</p>}
              {!reviewsLoading && reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-slate-100 rounded-2xl p-4">
                    <p className="text-sm font-black text-amber-500">Rating: {review.rating}/5</p>
                    {review.comment ? <p className="text-sm text-slate-600 mt-1">{review.comment}</p> : <p className="text-sm text-slate-400 mt-1 italic">No comment</p>}
                  </div>
                ))}
              </div>
            </div>

            {isStudent && (
              <div className="bg-white p-6 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Rate this Tutor</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Rating</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                      className={cn("w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1", reviewErrors.rating ? "border-red-500" : "border-slate-200")}
                    >
                      <option value="">Select rating</option>
                      {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {reviewErrors.rating && <p className="text-red-500 text-[10px] font-bold mt-1">{reviewErrors.rating}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Comment (Optional)</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 min-h-[90px]"
                      placeholder="Share your experience"
                    />
                  </div>
                  {reviewSuccess && <p className="text-emerald-600 text-sm font-semibold">{reviewSuccess}</p>}
                  <button onClick={handleSubmitReview} disabled={reviewSubmitting} className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                    {reviewSubmitting ? 'Saving...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedTutor(viewedTutor);
              setViewedTutor(null);
            }}
            className="w-full py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30"
          >
            Book Session with {viewedTutor.name.split(' ')[0]}
          </button>
        </Modal>
      )}

      {selectedTutor && (
        <Modal title="Book Session" onClose={() => setSelectedTutor(null)}>
          <p className="text-slate-500 mb-6">Select your preferred date and time for a session with <span className="text-primary font-bold">{selectedTutor.name}</span>.</p>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tutor Name</label>
              <input
                type="text"
                value={selectedTutor.name || ''}
                readOnly
                className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-3xl outline-none font-bold mt-1 text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tutor Email</label>
              <input
                type="email"
                value={bookingForm.tutorEmail}
                readOnly
                className={cn(
                  "w-full px-6 py-4 bg-slate-100 border rounded-3xl outline-none font-bold mt-1 text-slate-700",
                  bookingErrors.tutorEmail ? "border-red-500/50 ring-2 ring-red-500/10" : "border-slate-100"
                )}
              />
              {bookingErrors.tutorEmail && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{bookingErrors.tutorEmail}</p>}
            </div>
            {bookingErrors.mode && <p className="text-red-500 text-[10px] font-bold ml-2">{bookingErrors.mode}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Subject</label>
                <input
                  type="text"
                  value={bookingForm.subject}
                  onChange={(e) => setBookingForm({ ...bookingForm, subject: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 bg-slate-50 border rounded-3xl outline-none font-bold mt-1",
                    bookingErrors.subject ? "border-red-500/50 ring-2 ring-red-500/10" : "border-slate-100"
                  )}
                />
                {bookingErrors.subject && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{bookingErrors.subject}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Session Date</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 bg-slate-50 border rounded-3xl outline-none font-bold mt-1",
                    bookingErrors.date ? "border-red-500/50 ring-2 ring-red-500/10" : "border-slate-100"
                  )}
                />
                {bookingErrors.date && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{bookingErrors.date}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Time</label>
                <input
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 bg-slate-50 border rounded-3xl outline-none font-bold mt-1",
                    bookingErrors.time ? "border-red-500/50 ring-2 ring-red-500/10" : "border-slate-100"
                  )}
                />
                {bookingErrors.time && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{bookingErrors.time}</p>}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Note / Message</label>
              <textarea
                value={bookingForm.note}
                onChange={(e) => setBookingForm({ ...bookingForm, note: e.target.value })}
                className={cn(
                  "w-full px-6 py-4 bg-slate-50 border rounded-3xl outline-none font-bold mt-1 min-h-[100px]",
                  bookingErrors.note ? "border-red-500/50 ring-2 ring-red-500/10" : "border-slate-100"
                )}
                placeholder="Share your goals and what you need help with."
              />
              {bookingErrors.note && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{bookingErrors.note}</p>}
            </div>
            {bookingErrors.tutorId && <p className="text-red-500 text-[10px] font-bold ml-2">{bookingErrors.tutorId}</p>}
            {bookingErrors.studentId && <p className="text-red-500 text-[10px] font-bold ml-2">{bookingErrors.studentId}</p>}
            {bookingErrors._message && <p className="text-red-500 text-[10px] font-bold ml-2">{bookingErrors._message}</p>}
            <button onClick={handleRequestSession} className="w-full py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30">Confirm Booking</button>
          </div>
        </Modal>
      )}

      {showAddTutorModal && (
        <Modal title="Register as Tutor" onClose={() => setShowAddTutorModal(false)}>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2 scrollbar-none">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input
                  type="text"
                  value={tutorForm.name}
                  onChange={(e) => setTutorForm({ ...tutorForm, name: e.target.value })}
                  className={cn("w-full px-6 py-4 bg-slate-50 border rounded-3xl outline-none font-bold mt-1", tutorErrors.name ? "border-red-500" : "border-slate-100")}
                  placeholder="John Doe"
                />
                {tutorErrors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{tutorErrors.name}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tutor Email</label>
                <input
                  type="email"
                  value={tutorForm.email}
                  onChange={(e) => setTutorForm({ ...tutorForm, email: e.target.value })}
                  className={cn("w-full px-6 py-4 bg-slate-50 border rounded-3xl outline-none font-bold mt-1", tutorErrors.email ? "border-red-500" : "border-slate-100")}
                  placeholder="tutor@campus.com"
                />
                {tutorErrors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{tutorErrors.email}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subjects (comma separated)</label>
                <input
                  type="text"
                  value={tutorForm.subjects}
                  onChange={(e) => setTutorForm({ ...tutorForm, subjects: e.target.value })}
                  className={cn("w-full px-6 py-4 bg-slate-50 border rounded-3xl outline-none font-bold mt-1", tutorErrors.subjects ? "border-red-500" : "border-slate-100")}
                  placeholder="Mathematics, Physics"
                />
                {tutorErrors.subjects && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{tutorErrors.subjects}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Preferred Mode</label>
                <select
                  value={tutorForm.mode}
                  onChange={(e) => setTutorForm({ ...tutorForm, mode: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold mt-1"
                >
                  <option>Online</option>
                  <option>On-Campus</option>
                  <option>Hybrid</option>
                </select>
                {tutorErrors.mode && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{tutorErrors.mode}</p>}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Availability</label>
              <input
                type="text"
                value={tutorForm.availability}
                onChange={(e) => setTutorForm({ ...tutorForm, availability: e.target.value })}
                className={cn("w-full px-6 py-4 bg-slate-50 border rounded-3xl outline-none font-bold mt-1", tutorErrors.availability ? "border-red-500" : "border-slate-100")}
                placeholder="Mon, Wed 09:00 - 12:00"
              />
              {tutorErrors.availability && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{tutorErrors.availability}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Qualifications</label>
              <input
                type="text"
                value={tutorForm.qualifications}
                onChange={(e) => setTutorForm({ ...tutorForm, qualifications: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold mt-1"
                placeholder="MSc in Computer Science"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Bio</label>
              <textarea
                value={tutorForm.bio}
                onChange={(e) => setTutorForm({ ...tutorForm, bio: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold mt-1 min-h-[120px]"
                placeholder="Tell students about your experience and teaching style..."
              />
            </div>

            <button onClick={handleAddTutor} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">Complete Registration</button>
          </div>
        </Modal>
      )}

      {showAddGroupModal && (
        <Modal title="Start New Circle" onClose={() => setShowAddGroupModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
              <input
                type="text"
                value={groupForm.title}
                onChange={(e) => setGroupForm({ ...groupForm, title: e.target.value })}
                className={cn("w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1", groupErrors.title ? "border-red-500" : "border-slate-200")}
                placeholder="Software Engineering"
              />
              {groupErrors.title && <p className="text-red-500 text-[10px] font-bold mt-1">{groupErrors.title}</p>}
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
              <textarea
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                className={cn("w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1 min-h-[100px]", groupErrors.description ? "border-red-500" : "border-slate-200")}
                placeholder="Preparing for final exam"
              />
              {groupErrors.description && <p className="text-red-500 text-[10px] font-bold mt-1">{groupErrors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                <select
                  value={groupForm.subject}
                  onChange={(e) => setGroupForm({ ...groupForm, subject: e.target.value })}
                  className={cn("w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1", groupErrors.subject ? "border-red-500" : "border-slate-200")}
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
                {groupErrors.subject && <p className="text-red-500 text-[10px] font-bold mt-1">{groupErrors.subject}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Members</label>
                <input
                  type="number"
                  min="2"
                  value={groupForm.maxMembers}
                  onChange={(e) => setGroupForm({ ...groupForm, maxMembers: e.target.value })}
                  className={cn("w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1", groupErrors.maxMembers ? "border-red-500" : "border-slate-200")}
                />
                {groupErrors.maxMembers && <p className="text-red-500 text-[10px] font-bold mt-1">{groupErrors.maxMembers}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meeting Day (Optional)</label>
                <select
                  value={groupForm.meetingDay}
                  onChange={(e) => setGroupForm({ ...groupForm, meetingDay: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1"
                >
                  <option value="">No fixed day</option>
                  {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meeting Time (Optional)</label>
                <input
                  type="time"
                  value={groupForm.meetingTime}
                  onChange={(e) => setGroupForm({ ...groupForm, meetingTime: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1"
                />
              </div>
            </div>
            <button onClick={handleCreateGroup} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all">
              Create Circle
            </button>
          </div>
        </Modal>
      )}

      {selectedCircle && (
        <Modal title="Circle Details" onClose={() => setSelectedCircle(null)}>
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
              <h3 className="text-xl font-black text-slate-900">{selectedCircle.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{selectedCircle.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <p><span className="font-black text-slate-500 uppercase tracking-wider">Subject:</span> <span className="font-semibold text-slate-800">{selectedCircle.subject}</span></p>
                <p><span className="font-black text-slate-500 uppercase tracking-wider">Members:</span> <span className="font-semibold text-slate-800">{selectedCircle.memberCount}{selectedCircle.maxMembers ? ` / ${selectedCircle.maxMembers}` : ''}</span></p>
                <p><span className="font-black text-slate-500 uppercase tracking-wider">Created By:</span> <span className="font-semibold text-slate-800">{selectedCircle.createdByName || '-'}</span></p>
                <p><span className="font-black text-slate-500 uppercase tracking-wider">Created At:</span> <span className="font-semibold text-slate-800">{selectedCircle.createdAt ? new Date(selectedCircle.createdAt).toLocaleString() : '-'}</span></p>
                <p className="col-span-2"><span className="font-black text-slate-500 uppercase tracking-wider">Schedule:</span> <span className="font-semibold text-slate-800">{selectedCircle.meetingDay ? `${selectedCircle.meetingDay}${selectedCircle.meetingTime ? ` at ${selectedCircle.meetingTime}` : ''}` : 'Not set'}</span></p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Members</p>
              <div className="max-h-52 overflow-y-auto space-y-2">
                {(selectedCircle.members || []).map((member) => (
                  <div key={member.id} className="px-4 py-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{member.userName}</p>
                      <p className="text-xs text-slate-500">{member.userEmail}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      member.role === 'OWNER' ? 'bg-primary/15 text-primary' : 'bg-slate-100 text-slate-600'
                    )}>
                      {member.role}
                    </span>
                  </div>
                ))}
                {(selectedCircle.members || []).length === 0 && <p className="text-sm text-slate-400">No members found.</p>}
              </div>
            </div>

            <button
              onClick={() => handleToggleCircleMembership(selectedCircle)}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                selectedCircle.joined
                  ? "bg-rose-500 text-white"
                  : "bg-primary text-white shadow-xl shadow-primary/20"
              )}
            >
              {selectedCircle.joined ? 'Leave Circle' : 'Join Circle'}
            </button>
          </div>
        </Modal>
      )}

      {showProgressModal && (
        <Modal title="Add Progress Record" onClose={() => setShowProgressModal(false)}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module Code</label>
                <input
                  type="text"
                  value={progressForm.moduleCode}
                  onChange={(e) => setProgressForm({ ...progressForm, moduleCode: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1",
                    progressErrors.moduleCode ? "border-red-500" : "border-slate-200"
                  )}
                  placeholder="CS101"
                />
                {progressErrors.moduleCode && <p className="text-red-500 text-[10px] font-bold mt-1">{progressErrors.moduleCode}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module Name</label>
                <input
                  type="text"
                  value={progressForm.moduleName}
                  onChange={(e) => setProgressForm({ ...progressForm, moduleName: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1",
                    progressErrors.moduleName ? "border-red-500" : "border-slate-200"
                  )}
                  placeholder="Data Structures"
                />
                {progressErrors.moduleName && <p className="text-red-500 text-[10px] font-bold mt-1">{progressErrors.moduleName}</p>}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
              <select value={progressForm.status} onChange={(e) => setProgressForm({ ...progressForm, status: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1">
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <button onClick={handleAddProgress} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Track Progress</button>
          </div>
        </Modal>
      )}

      {showResourceModal && (
        <Modal title="Upload Resource" onClose={closeResourceModal}>
          <div className="space-y-6">
            {resourceErrors._message && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-xs font-bold uppercase tracking-widest">
                {resourceErrors._message}
              </div>
            )}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
              <input
                type="text"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1",
                  resourceErrors.title ? "border-red-500" : "border-slate-200"
                )}
                placeholder="Lecture Notes Week 5"
              />
              {resourceErrors.title && <p className="text-red-500 text-[10px] font-bold mt-1">{resourceErrors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                <select
                  value={resourceForm.subject}
                  onChange={(e) => setResourceForm({ ...resourceForm, subject: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1",
                    resourceErrors.subject ? "border-red-500" : "border-slate-200"
                  )}
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {resourceErrors.subject && <p className="text-red-500 text-[10px] font-bold mt-1">{resourceErrors.subject}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
                <select value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1">
                  <option>PDF</option>
                  <option>Video</option>
                  <option>Code</option>
                  <option>Link</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">File (Drag & Drop)</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsResourceDragOver(true);
                }}
                onDragLeave={() => setIsResourceDragOver(false)}
                onDrop={handleResourceDrop}
                className={cn(
                  "mt-2 rounded-2xl border-2 border-dashed p-6 text-center transition-all",
                  isResourceDragOver ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50",
                  resourceErrors.file ? "border-red-500" : ""
                )}
              >
                <p className="text-sm font-semibold text-slate-700">
                  {resourceForm.file ? resourceForm.file.name : "Drop file here or choose from computer"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {resourceForm.file
                    ? `${(resourceForm.file.size / 1024 / 1024).toFixed(2)} MB`
                    : "Max size 10MB"}
                </p>
                <label className="inline-block mt-4 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-100">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.csv,.xlsx"
                    onChange={handleResourceFileInput}
                  />
                </label>
              </div>
              {resourceErrors.file && <p className="text-red-500 text-[10px] font-bold mt-1">{resourceErrors.file}</p>}
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
              <textarea
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 min-h-[100px]"
                placeholder="Briefly describe what this material covers..."
              />
            </div>
            <button onClick={handleUploadResource} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Submit Resource</button>
          </div>
        </Modal>
      )}

      {chatGroup && (
        <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white">
            <div>
              <h3 className="text-xl font-black">{chatGroup.title || chatGroup.name}</h3>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Live Study Circle</p>
            </div>
            <button onClick={() => setChatGroup(null)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex flex-col", msg.senderId === user.id ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-3xl text-sm",
                  msg.senderId === user.id ? "bg-primary text-white rounded-br-none" : "bg-slate-100 text-slate-700 rounded-bl-none"
                )}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{msg.senderName}</p>
                  <p className="font-medium leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-[8px] font-bold text-slate-300 mt-1 uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
            {messages.length === 0 && <p className="text-center text-slate-300 text-xs py-10 font-bold uppercase tracking-widest">No messages yet. Start the conversation!</p>}
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50">
            <div className="relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full bg-white border border-slate-200 py-4 pl-6 pr-14 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )
      }

    </div >
  );
};

// Sub-Views
const TutorsView = ({ tutors, onBook, onViewProfile, filters, onApplyFilters, isAdmin, canAddTutor, onAddTutor, onDeleteTutor }) => {
  const [nameSearch, setNameSearch] = useState('');
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const filteredTutors = tutors.filter(t =>
    t.name.toLowerCase().includes(nameSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm items-end">
        <div className="flex-1 w-full space-y-4 lg:space-y-0 lg:flex lg:gap-4">
          <div className="flex-[2]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Search Tutor Name</label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-3xl outline-none focus:bg-white focus:border-primary/20 transition-all font-bold text-slate-600"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Subject</label>
            <select
              value={localFilters.subject}
              onChange={(e) => setLocalFilters({ ...localFilters, subject: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-3xl outline-none focus:bg-white focus:border-primary/20 transition-all font-bold text-slate-600"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="w-full lg:w-40">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Mode</label>
            <select
              value={localFilters.mode}
              onChange={(e) => setLocalFilters({ ...localFilters, mode: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-3xl outline-none focus:bg-white focus:border-primary/20 transition-all font-bold text-slate-600"
            >
              <option value="">Any Mode</option>
              <option>Online</option>
              <option>On-Campus</option>
            </select>
          </div>

          <div className="w-full lg:w-44">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Availability</label>
            <select
              value={localFilters.availability}
              onChange={(e) => setLocalFilters({ ...localFilters, availability: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-3xl outline-none focus:bg-white focus:border-primary/20 transition-all font-bold text-slate-600"
            >
              <option value="">Any</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <button
            onClick={() => onApplyFilters(localFilters)}
            className="flex-1 lg:flex-none px-8 py-4 bg-primary text-white rounded-3xl font-bold hover:shadow-lg transition-all"
          >
            Search
          </button>
          <button
            onClick={() => {
              const resetFilters = { subject: '', mode: '', availability: '' };
              setLocalFilters(resetFilters);
              onApplyFilters(resetFilters);
              setNameSearch('');
            }}
            className="flex-1 lg:flex-none px-8 py-4 bg-slate-100 text-slate-500 rounded-3xl font-bold hover:bg-slate-200 transition-all"
          >
            Reset
          </button>
          {canAddTutor && (
            <button
              onClick={onAddTutor}
              className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 text-white rounded-3xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-slate-900/10"
            >
              <Plus size={20} /> Add Tutor
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredTutors.map(tutor => (
          <div key={tutor.id} className="relative group">
            {isAdmin && (
              <button
                onClick={() => onDeleteTutor(tutor.id)}
                className="absolute -top-3 -right-3 w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            )}
            <TutorCard tutor={tutor} onBook={onBook} onViewProfile={onViewProfile} />
          </div>
        ))}
      </div>
      {filteredTutors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-4">
            <Users size={32} />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No tutors found matching your search</p>
        </div>
      )}
    </div>
  );
};

const GroupsView = ({ groups, onToggleMembership, onOpenDetails, onAddGroup, joiningCircleId, circleSuccess }) => (
  <div className="space-y-8">
    <div className="flex justify-between items-center bg-primary/5 p-8 rounded-[40px] border border-primary/10">
      <div className="flex gap-6 items-center">
        <div className="w-16 h-16 bg-primary text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-primary/20">
          <MessageCircle size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Study Circles</h2>
          <p className="text-slate-500 font-medium">Join a group and master your modules together.</p>
        </div>
      </div>
      <button onClick={onAddGroup} className="px-10 py-4 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest border border-primary/20 shadow-sm hover:bg-primary hover:text-white transition-all">
        Start New Circle
      </button>
    </div>
    {circleSuccess && (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700 font-bold text-xs uppercase tracking-widest">
        {circleSuccess}
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {groups.map(group => (
        <div key={group.id} className={cn(joiningCircleId === group.id && 'opacity-60 pointer-events-none')}>
          <GroupCard
            group={group}
            onToggleMembership={onToggleMembership}
            onViewDetails={onOpenDetails}
          />
        </div>
      ))}
    </div>
    {groups.length === 0 && (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active circles available.</p>
      </div>
    )}
  </div>
);

const ResourcesView = ({ resources, onAdd, user, isAdmin, onDelete }) => {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [statusMessage, setStatusMessage] = useState('');

  const subjects = Array.from(new Set((resources || []).map((r) => r.subject).filter(Boolean))).sort();
  const resourceTypes = Array.from(new Set((resources || []).map((r) => r.type).filter(Boolean))).sort();
  const fallbackTypes = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX'];
  const types = resourceTypes.length > 0 ? resourceTypes : fallbackTypes;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredResources = (resources || [])
    .filter((file) => {
      const title = file.title || '';
      if (normalizedSearch && !title.toLowerCase().includes(normalizedSearch)) return false;
      if (subject && file.subject !== subject) return false;
      if (type && file.type !== type) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'newest' || sort === 'oldest') {
        const aTime = new Date(a.uploadedAt || 0).getTime();
        const bTime = new Date(b.uploadedAt || 0).getTime();
        return sort === 'newest' ? bTime - aTime : aTime - bTime;
      }
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      if (sort === 'title-asc') return aTitle.localeCompare(bTitle);
      if (sort === 'title-desc') return bTitle.localeCompare(aTitle);
      return 0;
    });

  const handleClearFilters = () => {
    setSearch('');
    setSubject('');
    setType('');
    setSort('newest');
  };

  const handleDeleteResource = async (file) => {
    if (!file?.id) return;
    const ok = window.confirm("Are you sure you want to delete this resource?");
    if (!ok) return;
    try {
      await resourceApi.delete(file.id);
      if (typeof onDelete === 'function') {
        onDelete(file.id);
      }
      setStatusMessage('Resource deleted successfully.');
    } catch (err) {
      console.error("Delete resource failed:", err);
      alert(err.response?.data?.message || "Failed to delete resource.");
    }
  };

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <h2 className="text-2xl font-black text-slate-900">Resource Library</h2>

        {statusMessage && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700 font-bold text-xs uppercase tracking-widest">
            {statusMessage}
          </div>
        )}

        <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
            <div className="xl:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Title</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
              >
                <option value="">All Types</option>
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleClearFilters}
              className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredResources.map(file => (
            (() => {
              const canDelete = Boolean(isAdmin || (user?.id && file.uploaderId === user.id));
              return (
            <div key={file.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <FileText size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 truncate">{file.title}</h3>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  <span>{file.subject}</span>
                  <span>&bull;</span>
                  <span>{new Date(file.uploadedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!file.downloadable}
                  onClick={() => resourceApi.download(file.id)}
                  className={cn(
                    "p-4 rounded-2xl transition-all shadow-sm",
                    file.downloadable
                      ? "bg-slate-50 text-slate-400 hover:bg-primary hover:text-white active:scale-95"
                      : "bg-slate-100 text-slate-300 cursor-not-allowed"
                  )}
                >
                  <Download size={24} />
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDeleteResource(file)}
                    className="p-4 rounded-2xl transition-all shadow-sm bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-95"
                    aria-label="Delete resource"
                  >
                    <Trash2 size={22} />
                  </button>
                )}
              </div>
            </div>
              );
            })()
          ))}
          {filteredResources.length === 0 && (
            <p className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-100 rounded-[40px]">No resources found.</p>
          )}
        </div>
      </div>
      <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl h-fit">
        <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
          <ArrowUpRight size={28} />
        </div>
        <h3 className="text-2xl font-black mb-4">Sharing is Caring</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">Earn "Campus Credits" and help fellow students excel.</p>
        <button
          onClick={onAdd}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-white hover:text-primary transition-all"
        >
          Upload New File
        </button>
      </div>
    </div>
  );
};

const ProgressView = ({ requests }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const meetings = (requests || [])
    .filter((req) => ['REQUESTED', 'PENDING', 'CONFIRMED', 'ACCEPTED'].includes(req.status))
    .map((req) => {
      let eventDate = null;
      let timeLabel = '';
      if (req.sessionDateTime) {
        const dt = new Date(req.sessionDateTime);
        if (!Number.isNaN(dt.getTime())) {
          eventDate = dt;
          timeLabel = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } else if (req.preferredDay) {
        const dt = new Date(req.preferredDay);
        if (!Number.isNaN(dt.getTime())) {
          eventDate = dt;
          const from = req.preferredTimeFrom || '';
          const to = req.preferredTimeTo || '';
          timeLabel = `${from}${to ? ` - ${to}` : ''}`.trim();
        }
      }
      if (!eventDate) return null;
      const key = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return {
        id: req.id,
        dateKey: key,
        subject: req.subject || 'Session',
        status: req.status,
        timeLabel: timeLabel || '-',
        tutor: req.tutorName || req.tutorEmail || '-',
        joinLink: req.joinLink || ''
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));

  const meetingsByDate = meetings.reduce((acc, meeting) => {
    if (!acc[meeting.dateKey]) acc[meeting.dateKey] = [];
    acc[meeting.dateKey].push(meeting);
    return acc;
  }, {});

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startOffset = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const dayCells = [];
  for (let i = 0; i < startOffset; i += 1) dayCells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    dayCells.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  }
  while (dayCells.length % 7 !== 0) dayCells.push(null);

  const selectedMeetings = meetingsByDate[selectedDate] || [];
  const monthTitle = currentMonth.toLocaleString([], { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Meeting Calendar</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider"
          >
            Prev
          </button>
          <span className="font-black text-slate-800 min-w-[160px] text-center">{monthTitle}</span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {dayCells.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-slate-50/60" />;
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const isSelected = key === selectedDate;
              const count = (meetingsByDate[key] || []).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={cn(
                    "h-20 rounded-xl border text-left p-2 transition-all",
                    isSelected ? "border-primary bg-primary/10" : "border-slate-100 hover:border-primary/40 bg-white"
                  )}
                >
                  <div className="text-sm font-bold text-slate-800">{date.getDate()}</div>
                  {count > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black">
                      {count} meeting{count > 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-1">Selected Day</h3>
          <p className="text-xs text-slate-500 font-bold mb-4">{selectedDate}</p>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {selectedMeetings.length === 0 && (
              <p className="text-sm text-slate-400 font-semibold">No meetings on this day.</p>
            )}
            {selectedMeetings.map((meeting) => (
              <div key={meeting.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                <p className="font-black text-slate-900">{meeting.subject}</p>
                <p className="text-xs text-slate-600 font-semibold mt-1">Time: {meeting.timeLabel}</p>
                <p className="text-xs text-slate-600 font-semibold">Tutor: {meeting.tutor}</p>
                <span className={cn(
                  "inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  meeting.status === 'CONFIRMED' || meeting.status === 'ACCEPTED'
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                )}>
                  {meeting.status}
                </span>
                {meeting.joinLink && (
                  <a
                    href={meeting.joinLink}
                    target="_blank"
                    rel="noreferrer"
                    className="block mt-2 text-xs font-bold text-primary hover:underline break-all"
                  >
                    Open Meeting Link
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestsView = ({ requests, user, tutors, onRefresh }) => {
  const isTutor = user?.roles?.includes('TUTOR');
  const tutorNameMap = new Map((tutors || []).map((t) => [t.id, t.name]));
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmForm, setConfirmForm] = useState({ sessionDateTime: '', joinLink: '' });
  const [confirmErrors, setConfirmErrors] = useState({});
  const [accepting, setAccepting] = useState(false);
  const [rejectingId, setRejectingId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const openAcceptModal = (request) => {
    setSelectedRequest(request);
    setConfirmForm({
      sessionDateTime: request?.sourceType === 'SESSION'
        ? (request?.sessionDateTime ? new Date(request.sessionDateTime).toISOString().slice(0, 16) : '')
        : '',
      joinLink: request?.joinLink || ''
    });
    setConfirmErrors({});
  };

  const validateAcceptForm = () => {
    const nextErrors = {};
    if (selectedRequest?.sourceType !== 'SESSION' && !confirmForm.sessionDateTime) {
      nextErrors.sessionDateTime = 'Confirmed date and time is required';
    }
    if (!confirmForm.joinLink.trim()) {
      nextErrors.joinLink = 'Join link is required';
    } else {
      try {
        new URL(confirmForm.joinLink.trim());
      } catch (e) {
        nextErrors.joinLink = 'Join link must be a valid URL';
      }
    }
    setConfirmErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAccept = async () => {
    if (!selectedRequest || !validateAcceptForm()) return;
    try {
      setAccepting(true);
      let response;
      if (selectedRequest.sourceType === 'SESSION') {
        if (!selectedRequest.sourceId) {
          alert('Invalid session record.');
          return;
        }
        response = await tutorApi.updateSessionStatus(selectedRequest.sourceId, 'ACCEPTED', {
          joinLink: confirmForm.joinLink.trim()
        });
      } else {
        const payload = {
          sessionDateTime: new Date(confirmForm.sessionDateTime).toISOString(),
          joinLink: confirmForm.joinLink.trim()
        };
        response = await tutorRequestApi.updateStatus(selectedRequest.id, 'ACCEPTED', payload);
      }
      setSelectedRequest(null);
      setSuccessMessage(response?.warning || response?.message || 'Request accepted successfully.');
      if (typeof onRefresh === 'function') {
        await onRefresh();
      }
    } catch (err) {
      console.error('Failed to accept request:', err);
      alert(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async (request) => {
    if (!request) return;
    const ok = window.confirm('Are you sure you want to reject this request?');
    if (!ok) return;

    try {
      const rejectKey = request.sourceType === 'SESSION' ? request.sourceId : request.id;
      setRejectingId(rejectKey || request.id || 'rejecting');
      let response;
      if (request.sourceType === 'SESSION') {
        if (!request.sourceId) {
          alert('Invalid session record.');
          return;
        }
        response = await tutorApi.updateSessionStatus(request.sourceId, 'REJECTED');
      } else {
        response = await tutorRequestApi.reject(request.id);
      }
      setSuccessMessage(response?.warning || response?.message || 'Request rejected successfully.');
      if (typeof onRefresh === 'function') {
        await onRefresh();
      }
    } catch (err) {
      console.error('Failed to reject request:', err);
      alert(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setRejectingId('');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-slate-900">{isTutor ? 'Pending Requests' : 'Session History'}</h2>
      {successMessage && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700 font-bold text-sm">
          {successMessage}
        </div>
      )}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-8 py-4">Subject</th>
              <th className="px-8 py-4">{isTutor ? 'Student' : 'Tutor'}</th>
              <th className="px-8 py-4">Date & Time</th>
              <th className="px-8 py-4">Status</th>
              {isTutor && <th className="px-8 py-4">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map(req => (
              <tr key={req.id}>
                <td className="px-8 py-6 text-slate-900 font-bold">{req.subject}</td>
                <td className="px-8 py-6 text-slate-500 font-medium">
                  {isTutor
                    ? `${req.studentName || req.studentEmail || req.studentId || '-'} (${req.studentEmail || '-'})`
                    : (req.tutorName || tutorNameMap.get(req.tutorId) || req.tutorId || '-')}
                </td>
                <td className="px-8 py-6 text-slate-600 font-medium">
                  {req.sessionDateTime
                    ? new Date(req.sessionDateTime).toLocaleString()
                    : `${req.preferredDay || '-'} ${req.preferredTimeFrom || ''}${req.preferredTimeTo ? ` - ${req.preferredTimeTo}` : ''}`.trim()}
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    req.status === 'REQUESTED' || req.status === 'PENDING'
                      ? "bg-amber-100 text-amber-700"
                      : req.status === 'CONFIRMED' || req.status === 'ACCEPTED'
                        ? "bg-emerald-100 text-emerald-700"
                        : req.status === 'REJECTED' || req.status === 'CANCELLED'
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-100 text-slate-700"
                  )}>
                    {req.status}
                  </span>
                </td>
                {isTutor && (
                  <td className="px-8 py-6">
                    {(req.status === 'PENDING' || (req.status === 'REQUESTED' && req.sourceType !== 'SESSION')) ? (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={accepting || Boolean(rejectingId)}
                          onClick={() => openAcceptModal(req)}
                          className="px-4 py-2 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          disabled={accepting || Boolean(rejectingId)}
                          onClick={() => handleReject(req)}
                          className="px-4 py-2 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-60"
                        >
                          {(rejectingId === (req.sourceType === 'SESSION' ? req.sourceId : req.id)) ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    ) : (req.status === 'REQUESTED' && req.sourceType === 'SESSION') ? (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={accepting || Boolean(rejectingId)}
                          onClick={() => openAcceptModal(req)}
                          className="px-4 py-2 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-60"
                        >
                          {accepting ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          disabled={accepting || Boolean(rejectingId)}
                          onClick={() => handleReject(req)}
                          className="px-4 py-2 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-60"
                        >
                          {(rejectingId === (req.sourceType === 'SESSION' ? req.sourceId : req.id)) ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={isTutor ? 5 : 4} className="px-8 py-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                  No requests yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <Modal title="Confirm Session & Accept" onClose={() => setSelectedRequest(null)}>
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-600 font-medium">
              <p><strong>Student:</strong> {selectedRequest.studentName} ({selectedRequest.studentEmail})</p>
              <p><strong>Subject:</strong> {selectedRequest.subject}</p>
              {selectedRequest.sourceType === 'SESSION' ? (
                <p><strong>Booked Slot:</strong> {selectedRequest.sessionDateTime ? new Date(selectedRequest.sessionDateTime).toLocaleString() : '-'}</p>
              ) : (
                <p><strong>Requested Slot:</strong> {selectedRequest.preferredDay} {selectedRequest.preferredTimeFrom} - {selectedRequest.preferredTimeTo}</p>
              )}
            </div>
            {selectedRequest.sourceType !== 'SESSION' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmed Date & Time</label>
                <input
                  type="datetime-local"
                  value={confirmForm.sessionDateTime}
                  onChange={(e) => setConfirmForm((prev) => ({ ...prev, sessionDateTime: e.target.value }))}
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1",
                    confirmErrors.sessionDateTime ? "border-red-500" : "border-slate-200"
                  )}
                />
                {confirmErrors.sessionDateTime && <p className="text-red-500 text-[10px] font-bold mt-1">{confirmErrors.sessionDateTime}</p>}
              </div>
            )}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Join Link URL</label>
              <input
                type="url"
                value={confirmForm.joinLink}
                onChange={(e) => setConfirmForm((prev) => ({ ...prev, joinLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
                className={cn(
                  "w-full px-4 py-3 bg-slate-50 border rounded-xl mt-1",
                  confirmErrors.joinLink ? "border-red-500" : "border-slate-200"
                )}
              />
              {confirmErrors.joinLink && <p className="text-red-500 text-[10px] font-bold mt-1">{confirmErrors.joinLink}</p>}
            </div>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-60 disabled:hover:scale-100"
            >
              {accepting ? 'Accepting...' : 'Confirm & Accept'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300 relative">
      <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
        <X size={24} className="text-slate-400" />
      </button>
      <h2 className="text-2xl font-black text-slate-900 mb-6 pr-10">{title}</h2>
      {children}
    </div>
  </div>
);

export default AcademicSupportPage;

