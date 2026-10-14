import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export const DriveDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { drives, registerForDrive, studentProfile } = usePlacement();
  const drive = drives.find((d) => d.id === id);

  if (!drive) {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate('/drives')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: 0
            }}
          >
            <ArrowLeft size={16} /> Back to All Placement Drives
          </button>
        </div>
        <EmptyState title="No placement drives available." description="" />
      </div>
    );
  }

  const isEligible = (studentProfile.cgpa || 0) >= (drive.minCgpa || 0);

  return (
    <div>
      {/* Top Breadcrumb & Back */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/drives')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Back to All Placement Drives
        </button>
      </div>

      {/* Main Drive Header Card */}
      <div
        className="card"
        style={{
          padding: '28px',
          marginBottom: 24,
          borderLeft: '5px solid var(--primary)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {drive.company}
              </span>
              <Badge variant="warning">{drive.tier}</Badge>
              <Badge variant={drive.status === 'Upcoming' ? 'info' : 'neutral'}>{drive.status}</Badge>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 8 }}>
              {drive.role}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} /> {drive.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} /> Drive Date: <strong>{drive.driveDate}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> Registration Deadline: <strong>{drive.deadline}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Compensation Package
              </span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                {drive.package}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant={drive.isRegistered ? 'success' : 'primary'}
                size="md"
                disabled={!isEligible && !drive.isRegistered}
                onClick={() => registerForDrive(drive.id)}
                icon={drive.isRegistered ? CheckCircle2 : undefined}
              >
                {drive.isRegistered ? 'Registered for Drive' : 'Register Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Details Body & Sidebar Info */}
      <div className="grid-3">
        {/* Left 2 Cols: Description, Selection Process, Skills */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Role Overview */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>
              <FileText size={18} color="var(--primary)" />
              Role Description & Expectations
            </h3>
            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 16 }}>
              {drive.description}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              The hired graduates will undergo a 3-month comprehensive enterprise onboarding program covering distributed architecture, code review standards, and continuous deployment workflows.
            </p>
          </div>

          {/* Selection Rounds */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>
              <ShieldCheck size={18} color="var(--primary)" />
              Selection Process & Evaluation Flow
            </h3>
            <div
              style={{
                backgroundColor: 'var(--bg-main)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-main)',
                lineHeight: 1.6,
                marginBottom: 16
              }}
            >
              {drive.selectionProcess}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  1
                </span>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Online Coding Assessment</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>90 mins proctored test with 3 algorithmic coding questions and 15 CS MCQs.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  2
                </span>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Technical Round 1 & System Basics</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Live pair coding on Google Meet / HackerRank CodePair covering data structures.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  3
                </span>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hiring Manager & Culture Fit</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Resume deep-dive, previous hackathon projects, and leadership evaluation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>
              Skills & Tech Stack Required
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(Array.isArray(drive.skillsRequired)
                ? drive.skillsRequired
                : Array.isArray(drive.skills)
                ? drive.skills
                : []
              ).map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#eff6ff',
                    color: 'var(--primary)',
                    border: '1px solid #bfdbfe',
                    fontWeight: 600,
                    fontSize: '0.8125rem'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Eligibility Checklist & Drive Logistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Eligibility Verification Card */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              Your Eligibility Status
            </h3>

            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isEligible ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${isEligible ? 'var(--success-border)' : 'var(--danger-border)'}`,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                marginBottom: 16
              }}
            >
              {isEligible ? (
                <CheckCircle2 size={20} color="var(--success)" />
              ) : (
                <AlertCircle size={20} color="var(--danger)" />
              )}
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isEligible ? '#065f46' : '#991b1b' }}>
                {isEligible ? 'You Meet All Requirements' : 'You Do Not Meet Criteria'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Minimum CGPA Required:</span>
                <strong>{drive.minCgpa} CGPA</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Your Verified CGPA:</span>
                <strong style={{ color: studentProfile.cgpa >= drive.minCgpa ? 'var(--success)' : 'var(--danger)' }}>
                  {studentProfile.cgpa} CGPA
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Allowed Branches:</span>
                <strong>{drive.allowedBranches.join(', ')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Active Backlogs Allowed:</span>
                <strong>0 Backlogs</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
                <span style={{ color: 'var(--text-muted)' }}>Open Vacancies:</span>
                <strong>{drive.vacancies} Positions</strong>
              </div>
            </div>
          </div>

          {/* Drive Venue & Logistics */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              Drive Logistics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Venue & Hall:</span>
                <strong>{drive.venue}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Batch / Graduating Year:</span>
                <strong>Class of 2026</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Total Registered Students:</span>
                <strong>{drive.registeredStudents.length} Students</strong>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <Button
                variant={drive.isRegistered ? 'outline-danger' : 'primary'}
                style={{ width: '100%' }}
                disabled={!isEligible && !drive.isRegistered}
                onClick={() => registerForDrive(drive.id)}
              >
                {drive.isRegistered ? 'Withdraw Registration' : 'Register for Drive'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveDetailsPage;
