import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  BookOpen,
  Edit3,
  CheckCircle2,
  FileText,
  Globe,
  Plus,
  X,
  Camera
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export const ProfilePage = () => {
  const { studentProfile, updateProfile, openProfilePicModal } = usePlacement();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: studentProfile?.name || '',
    email: studentProfile?.email || '',
    phone: studentProfile?.phone || '',
    department: studentProfile?.department || '',
    cgpa: studentProfile?.cgpa || '',
    bio: studentProfile?.bio || '',
    skills: [...(studentProfile?.skills || [])]
  });
  const [newSkill, setNewSkill] = useState('');

  const branches = [
    'CSE',
    'CSE-AI/ML',
    'CSE-DS',
    'ECE',
    'EEE',
    'MECH',
    'AERO'
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditModalOpen(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove)
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Placement Profile</h1>
        </div>

        <Button
          variant="primary"
          icon={Edit3}
          onClick={() => {
            setFormData({
              name: studentProfile?.name || '',
              email: studentProfile?.email || '',
              phone: studentProfile?.phone || '',
              department: studentProfile?.department || '',
              cgpa: studentProfile?.cgpa || '',
              bio: studentProfile?.bio || '',
              skills: [...(studentProfile?.skills || [])]
            });
            setIsEditModalOpen(true);
          }}
        >
          Edit Profile Information
        </Button>
      </div>

      {/* Hero Profile Card */}
      <div
        className="card"
        style={{
          padding: '28px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          flexWrap: 'wrap'
        }}
      >
        {studentProfile?.avatar ? (
          <div
            style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
            onClick={openProfilePicModal}
            title="Click to change profile picture"
          >
            <img
              src={studentProfile.avatar}
              alt={studentProfile?.name || 'Profile Picture'}
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #eff6ff',
                boxShadow: 'var(--shadow-md)',
                display: 'block',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                border: '2px solid #ffffff'
              }}
              title="Change profile picture"
            >
              <Camera size={15} />
            </div>
          </div>
        ) : (
          /* Blank profile picture area - no initials, no icons */
          <div
            role="button"
            onClick={openProfilePicModal}
            title="Click to set profile picture"
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              backgroundColor: '#f8fafc',
              border: '3px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        )}

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {studentProfile?.name || 'Student Profile'}
            </h2>
            <Badge variant="success">Eligible for Drives</Badge>
          </div>

          <div style={{ fontSize: '0.92rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 6 }}>
            {studentProfile?.department || ''} {studentProfile?.year ? `• ${studentProfile.year}` : ''}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, maxWidth: 640 }}>
            {studentProfile?.bio || ''}
          </p>
        </div>

        {/* CGPA Badge Box */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '16px 24px',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 700 }}>
            Verified CGPA
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1e40af', lineHeight: 1.2 }}>
            {studentProfile?.cgpa ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 500 }}>Scale of 10.0</span>
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Contact & Student Info */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>
            <User size={18} color="var(--primary)" />
            Personal & Academic Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Roll / Student ID:</span>
              <strong>{studentProfile?.id || '-'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Official College Email:</span>
              <strong>{studentProfile?.email || '-'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Contact Mobile:</span>
              <strong>{studentProfile?.phone || '-'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Class 10th Board:</span>
              <strong>{studentProfile?.tenthMarks || '-'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Class 12th Board:</span>
              <strong>{studentProfile?.twelfthMarks || '-'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
              <span style={{ color: 'var(--text-muted)' }}>Active Standing Backlogs:</span>
              <strong style={{ color: 'var(--success)' }}>0 Backlogs</strong>
            </div>
          </div>
        </div>

        {/* Technical Competencies & Skills */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>
            <Award size={18} color="var(--primary)" />
            Technical Competencies & Stack
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {(studentProfile?.skills || []).length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>No records available.</span>
            ) : (
              studentProfile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)'
                  }}
                >
                  {skill}
                </span>
              ))
            )}
          </div>

          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>
            Completed Certifications:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(studentProfile?.certificationsList || []).length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>No records available.</span>
            ) : (
              studentProfile.certificationsList.map((cert, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.8125rem',
                    color: 'var(--text-main)',
                    backgroundColor: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <CheckCircle2 size={15} color="var(--success)" />
                  <span>{cert}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Semester GPA Track History */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 14 }}>
          <GraduationCap size={18} color="var(--primary)" />
          Semester-wise Academic Progression (GPA)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
          {(studentProfile?.academicHistory || []).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', padding: '12px 0' }}>
              No records available.
            </div>
          ) : (
            studentProfile.academicHistory.map((sem, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sem.sem}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>{sem.gpa}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Student Profile"
      >
        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your college email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Branch / Department</label>
            <select
              required
              className="form-select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="">Select Branch / Department</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">CGPA</label>
            <input
              type="number"
              step="0.01"
              max="10"
              required
              className="form-input"
              value={formData.cgpa}
              onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
              placeholder="Enter CGPA"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Professional Summary / Bio</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Enter professional bio"
            />
          </div>

          {/* Manage Skills */}
          <div className="form-group">
            <label className="form-label">Skills & Technologies</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter skill name"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill}>
                Add
              </Button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {formData.skills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={12} color="#1d4ed8" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
