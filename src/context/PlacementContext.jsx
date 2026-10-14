import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  initialStudents,
  currentStudentProfile,
  initialDrives,
  initialJobs,
  initialInternships,
  initialTraining,
  initialAttendanceSummary,
  initialStudentsAttendanceList,
  initialCertifications,
  initialExams,
  initialQueries,
  initialReviews,
  initialAnnouncements,
  initialNotifications
} from '../data';
import {
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  updateUserAvatar
} from '../utils/authStorage';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api';

const PlacementContext = createContext(null);

export const PlacementProvider = ({ children }) => {
  // Auth state initialized with server verification
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Toast feedback state
  const [toasts, setToasts] = useState([]);

  // Profile Picture Modal state
  const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState(false);
  const openProfilePicModal = () => setIsProfilePicModalOpen(true);
  const closeProfilePicModal = () => setIsProfilePicModalOpen(false);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // State collections with initial mock fallbacks
  const [drives, setDrives] = useState(initialDrives);
  const [jobs, setJobs] = useState(initialJobs);
  const [internships, setInternships] = useState(initialInternships);
  const [training, setTraining] = useState(initialTraining);
  const [attendanceSummary, setAttendanceSummary] = useState(initialAttendanceSummary);
  const [studentsAttendance, setStudentsAttendance] = useState(initialStudentsAttendanceList);
  const [certifications, setCertifications] = useState(initialCertifications);
  const [exams, setExams] = useState(initialExams);
  const [queries, setQueries] = useState(initialQueries);
  const [reviews, setReviews] = useState(initialReviews);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [studentProfile, setStudentProfile] = useState(currentStudentProfile);
  const [students, setStudents] = useState(initialStudents);

  // Synchronize and verify auth session with backend on mount
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const token = getStoredToken();
      if (!token) {
        if (isMounted) {
          setCurrentUser(null);
          persistCurrentUser(null);
          setIsAuthChecking(false);
        }
        return;
      }

      try {
        const res = await api.getMe();
        if (isMounted && res?.success && res?.user) {
          setCurrentUser(res.user);
          persistCurrentUser(res.user);
        } else if (isMounted) {
          clearStoredToken();
          persistCurrentUser(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Backend session verification:', err.message);
        if (isMounted) {
          if (err.status === 401 || err.code === 'TOKEN_EXPIRED_OR_INVALID') {
            clearStoredToken();
            persistCurrentUser(null);
            setCurrentUser(null);
          }
        }
      } finally {
        if (isMounted) setIsAuthChecking(false);
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch all live database records from backend
  const refreshLiveBackendData = useCallback(async () => {
    try {
      // Public / General listings
      const [
        drivesRes,
        jobsRes,
        internshipsRes,
        trainingRes,
        certRes,
        examsRes,
        announcementsRes,
        reviewsRes,
        notifsRes
      ] = await Promise.allSettled([
        api.getDrives(),
        api.getJobs(),
        api.getInternships(),
        api.getTraining(),
        api.getCertifications(),
        api.getExams(),
        api.getAnnouncements(),
        api.getReviews(),
        api.getNotifications()
      ]);

      if (drivesRes.status === 'fulfilled' && drivesRes.value?.success) {
        setDrives(drivesRes.value.drives || []);
      }
      if (jobsRes.status === 'fulfilled' && jobsRes.value?.success) {
        setJobs(jobsRes.value.jobs || []);
      }
      if (internshipsRes.status === 'fulfilled' && internshipsRes.value?.success) {
        setInternships(internshipsRes.value.internships || []);
      }
      if (trainingRes.status === 'fulfilled' && trainingRes.value?.success) {
        setTraining(trainingRes.value.training || []);
      }
      if (certRes.status === 'fulfilled' && certRes.value?.success) {
        setCertifications(certRes.value.certifications || []);
      }
      if (examsRes.status === 'fulfilled' && examsRes.value?.success) {
        setExams(examsRes.value.exams || []);
      }
      if (announcementsRes.status === 'fulfilled' && announcementsRes.value?.success) {
        setAnnouncements(announcementsRes.value.announcements || []);
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.success) {
        setReviews(reviewsRes.value.reviews || []);
      }
      if (notifsRes.status === 'fulfilled' && notifsRes.value?.success) {
        setNotifications(notifsRes.value.notifications || []);
      }

      // User-specific authenticated data
      const token = getStoredToken();
      if (token) {
        // Queries
        try {
          const qRes = await api.getQueries();
          if (qRes?.success) setQueries(qRes.queries || []);
        } catch { /* ignored */ }

        // Attendance summary
        try {
          const attRes = await api.getAttendanceSummary();
          if (attRes?.success && attRes?.summary) setAttendanceSummary(attRes.summary);
        } catch { /* ignored */ }

        // Student Profile
        if (currentUser?.role === 'student') {
          try {
            const profRes = await api.getProfile();
            if (profRes?.success && profRes?.profile) {
              setStudentProfile(profRes.profile);
            }
          } catch { /* ignored */ }
        }

        // Admin students & attendance
        if (currentUser?.role === 'admin') {
          try {
            const stRes = await api.getAdminStudents();
            if (stRes?.success && stRes?.students) setStudents(stRes.students);
          } catch { /* ignored */ }

          try {
            const stAttRes = await api.getStudentsAttendance();
            if (stAttRes?.success && stAttRes?.studentsAttendance) {
              setStudentsAttendance(stAttRes.studentsAttendance);
            }
          } catch { /* ignored */ }
        }
      }
    } catch (err) {
      console.warn('Live backend data fetch notice:', err.message);
    }
  }, [currentUser]);

  // Trigger live backend fetch on load and whenever authentication status changes
  useEffect(() => {
    refreshLiveBackendData();
  }, [refreshLiveBackendData]);

  // Synchronize studentProfile with logged in user if student
  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      setStudentProfile((prev) => ({
        ...prev,
        id: currentUser.id || currentUser.studentId || prev.id,
        name: currentUser.name || currentUser.fullName || prev.name,
        email: currentUser.email || prev.email,
        department: currentUser.department || prev.department,
        section: currentUser.section || prev.section,
        year: currentUser.year || prev.year,
        cgpa: currentUser.cgpa || prev.cgpa,
        avatar: currentUser.avatar || prev.avatar
      }));
    }
  }, [currentUser]);

  // Secure Authentication Handlers
  const login = (sessionUser, token) => {
    if (token) {
      setStoredToken(token);
    }
    persistCurrentUser(sessionUser);
    setCurrentUser(sessionUser);
    showToast(
      sessionUser.role === 'admin'
        ? `Logged in as Administrator (${sessionUser.name || sessionUser.fullName})`
        : `Welcome back, ${sessionUser.name || sessionUser.fullName}!`,
      'success'
    );
  };

  const logout = () => {
    clearStoredToken();
    persistCurrentUser(null);
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  };

  // Student Actions
  const registerForDrive = async (driveId) => {
    try {
      const res = await api.registerDrive(driveId);
      if (res?.success) {
        setDrives((prev) =>
          prev.map((drv) => (drv.id === driveId ? res.drive : drv))
        );
        showToast(res.message, res.isRegistered ? 'success' : 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update drive registration.', 'danger');
    }
  };

  const applyForJob = async (jobId) => {
    try {
      const res = await api.applyJob(jobId);
      if (res?.success) {
        setJobs((prev) =>
          prev.map((job) => (job.id === jobId ? res.job : job))
        );
        showToast(res.message, res.hasApplied ? 'success' : 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to apply for job.', 'danger');
    }
  };

  const applyForInternship = async (internshipId) => {
    try {
      const res = await api.applyInternship(internshipId);
      if (res?.success) {
        setInternships((prev) =>
          prev.map((item) => (item.id === internshipId ? res.internship : item))
        );
        showToast(res.message, res.hasApplied ? 'success' : 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to apply for internship.', 'danger');
    }
  };

  const registerCertification = async (certId) => {
    try {
      const res = await api.registerCertification(certId);
      if (res?.success) {
        setCertifications((prev) =>
          prev.map((cert) => (cert.id === certId ? res.certification : cert))
        );
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update certification status.', 'danger');
    }
  };

  const addQuery = async (queryData) => {
    try {
      const res = await api.addQuery(queryData);
      if (res?.success) {
        setQueries((prev) => [res.query, ...prev]);
        showToast('Your query has been submitted to the Placement Cell', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit query.', 'danger');
    }
  };

  const replyToQuery = async (queryId, responseText) => {
    try {
      const res = await api.replyQuery(queryId, responseText);
      if (res?.success) {
        setQueries((prev) =>
          prev.map((q) => (q.id === queryId ? res.query : q))
        );
        showToast('Response recorded and query marked as Resolved', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to reply to query.', 'danger');
    }
  };

  const addReview = async (reviewData) => {
    try {
      const res = await api.addReview(reviewData);
      if (res?.success) {
        setReviews((prev) => [res.review, ...prev]);
        showToast('Feedback submitted successfully! Thank you.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit review.', 'danger');
    }
  };

  const updateProfile = async (updatedFields) => {
    try {
      const res = await api.updateProfile(updatedFields);
      if (res?.success) {
        setStudentProfile(res.profile);
        if (currentUser?.role === 'student') {
          setCurrentUser((prev) => ({
            ...prev,
            name: updatedFields.name || prev.name,
            email: updatedFields.email || prev.email,
            department: updatedFields.department || prev.department
          }));
        }
        showToast('Profile updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'danger');
    }
  };

  const updateProfileAvatar = async (avatarUrl) => {
    const cleanAvatar = avatarUrl || '';
    try {
      const res = await api.updateProfileAvatar(cleanAvatar);
      if (res?.success) {
        setCurrentUser((prev) => (prev ? { ...prev, avatar: cleanAvatar } : prev));
        setStudentProfile((prev) => ({ ...prev, avatar: cleanAvatar }));
        updateUserAvatar(currentUser?.id, currentUser?.role, cleanAvatar);
        if (cleanAvatar) {
          showToast('Profile picture updated successfully', 'success');
        } else {
          showToast('Profile picture removed', 'info');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update avatar.', 'danger');
    }
  };

  const markNotificationAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await api.markNotificationRead(id);
    } catch { /* ignored */ }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsRead();
      showToast('All notifications marked as read', 'info');
    } catch { /* ignored */ }
  };

  // Admin CRUD for Drives
  const addDrive = async (driveData) => {
    try {
      const res = await api.createDrive(driveData);
      if (res?.success) {
        setDrives((prev) => [res.drive, ...prev]);
        showToast(`Placement drive for ${res.drive.company} created`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create placement drive.', 'danger');
    }
  };

  const editDrive = async (id, updatedData) => {
    try {
      const res = await api.updateDrive(id, updatedData);
      if (res?.success) {
        setDrives((prev) =>
          prev.map((drv) => (drv.id === id ? res.drive : drv))
        );
        showToast('Placement drive updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update placement drive.', 'danger');
    }
  };

  const deleteDrive = async (id) => {
    try {
      const res = await api.deleteDrive(id);
      if (res?.success) {
        setDrives((prev) => prev.filter((drv) => drv.id !== id));
        showToast('Placement drive removed', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete drive.', 'danger');
    }
  };

  // Admin CRUD for Jobs
  const addJob = async (jobData) => {
    try {
      const res = await api.createJob(jobData);
      if (res?.success) {
        setJobs((prev) => [res.job, ...prev]);
        showToast(`Job listing for ${res.job.title} posted`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create job listing.', 'danger');
    }
  };

  const editJob = async (id, updatedData) => {
    try {
      const res = await api.updateJob(id, updatedData);
      if (res?.success) {
        setJobs((prev) =>
          prev.map((job) => (job.id === id ? res.job : job))
        );
        showToast('Job listing updated', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update job listing.', 'danger');
    }
  };

  const deleteJob = async (id) => {
    try {
      const res = await api.deleteJob(id);
      if (res?.success) {
        setJobs((prev) => prev.filter((job) => job.id !== id));
        showToast('Job listing deleted', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete job.', 'danger');
    }
  };

  // Admin CRUD for Internships
  const addInternship = async (internshipData) => {
    try {
      const res = await api.createInternship(internshipData);
      if (res?.success) {
        setInternships((prev) => [res.internship, ...prev]);
        showToast(`Internship ${res.internship.title} posted`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to post internship.', 'danger');
    }
  };

  const editInternship = async (id, updatedData) => {
    try {
      const res = await api.updateInternship(id, updatedData);
      if (res?.success) {
        setInternships((prev) =>
          prev.map((item) => (item.id === id ? res.internship : item))
        );
        showToast('Internship updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update internship.', 'danger');
    }
  };

  const deleteInternship = async (id) => {
    try {
      const res = await api.deleteInternship(id);
      if (res?.success) {
        setInternships((prev) => prev.filter((item) => item.id !== id));
        showToast('Internship removed', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove internship.', 'danger');
    }
  };

  // Admin CRUD for Training
  const addTraining = async (trainingData) => {
    try {
      const res = await api.createTraining(trainingData);
      if (res?.success) {
        setTraining((prev) => [res.training, ...prev]);
        showToast('Training session scheduled', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to schedule training.', 'danger');
    }
  };

  const editTraining = async (id, updatedData) => {
    try {
      const res = await api.updateTraining(id, updatedData);
      if (res?.success) {
        setTraining((prev) =>
          prev.map((item) => (item.id === id ? res.training : item))
        );
        showToast('Training session updated', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update training.', 'danger');
    }
  };

  const deleteTraining = async (id) => {
    try {
      const res = await api.deleteTraining(id);
      if (res?.success) {
        setTraining((prev) => prev.filter((item) => item.id !== id));
        showToast('Training session removed', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete training.', 'danger');
    }
  };

  // Admin CRUD for Announcements
  const addAnnouncement = async (data) => {
    try {
      const res = await api.createAnnouncement(data);
      if (res?.success) {
        setAnnouncements((prev) => [res.announcement, ...prev]);
        showToast('Announcement posted for students', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to post announcement.', 'danger');
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const res = await api.deleteAnnouncement(id);
      if (res?.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        showToast('Announcement deleted', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete announcement.', 'danger');
    }
  };

  // Admin Attendance update
  const updateStudentAttendanceRecord = async (studentId, moduleName, newScore) => {
    try {
      const res = await api.updateStudentAttendance(studentId, moduleName, newScore);
      if (res?.success) {
        setStudentsAttendance((prev) =>
          prev.map((rec) => (rec.id === studentId || rec.userId === studentId ? res.record : rec))
        );
        showToast(`Attendance updated for student ${studentId}`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update attendance.', 'danger');
    }
  };

  // Admin CRUD for Certifications
  const addCertification = async (certData) => {
    try {
      const res = await api.createCertification(certData);
      if (res?.success) {
        setCertifications((prev) => [res.certification, ...prev]);
        showToast('Certification opportunity created', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create certification.', 'danger');
    }
  };

  // Admin CRUD for Exams
  const addExam = async (examData) => {
    try {
      const res = await api.createExam(examData);
      if (res?.success) {
        setExams((prev) => [res.exam, ...prev]);
        showToast('New assessment created', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create assessment.', 'danger');
    }
  };

  return (
    <PlacementContext.Provider
      value={{
        currentUser,
        isAuthChecking,
        login,
        logout,
        toasts,
        showToast,
        removeToast,
        drives,
        registerForDrive,
        addDrive,
        editDrive,
        deleteDrive,
        jobs,
        applyForJob,
        addJob,
        editJob,
        deleteJob,
        internships,
        applyForInternship,
        addInternship,
        editInternship,
        deleteInternship,
        training,
        addTraining,
        editTraining,
        deleteTraining,
        attendanceSummary,
        studentsAttendance,
        updateStudentAttendanceRecord,
        certifications,
        registerCertification,
        addCertification,
        exams,
        addExam,
        queries,
        addQuery,
        replyToQuery,
        reviews,
        addReview,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        studentProfile,
        updateProfile,
        updateProfileAvatar,
        isProfilePicModalOpen,
        openProfilePicModal,
        closeProfilePicModal,
        students
      }}
    >
      {children}
    </PlacementContext.Provider>
  );
};

export const usePlacement = () => {
  const context = useContext(PlacementContext);
  if (!context) {
    throw new Error('usePlacement must be used within a PlacementProvider');
  }
  return context;
};
