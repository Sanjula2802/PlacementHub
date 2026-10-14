import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Sparkles,
  GraduationCap,
  CalendarCheck,
  Megaphone,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileQuestion
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

export const StudentDashboard = () => {
  const {
    studentProfile,
    drives,
    jobs,
    internships,
    training,
    attendanceSummary,
    announcements,
    registerForDrive
  } = usePlacement();

  const navigate = useNavigate();

  const upcomingDrives = drives.filter((d) => d.status === 'Upcoming').slice(0, 3);
  const upcomingTrainings = training.filter((t) => t.status === 'Upcoming').slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
                color: '#93c5fd',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(147, 197, 253, 0.3)'
              }}
            >
              {studentProfile.year || 'Student Portal'}
            </span>
            {studentProfile.department && (
              <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{studentProfile.department}</span>
            )}
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
            Welcome back{studentProfile.name ? `, ${studentProfile.name}` : ''}!
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="primary"
            onClick={() => navigate('/drives')}
            icon={Building2}
          >
            Explore Drives
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/profile')}
          >
            My Profile
          </Button>
        </div>
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          title="Placement Drives"
          value={drives.length}
          icon={Building2}
          color="primary"
          onClick={() => navigate('/drives')}
        />
        <StatCard
          title="Active Jobs"
          value={jobs.length}
          icon={Briefcase}
          color="purple"
          onClick={() => navigate('/jobs')}
        />
        <StatCard
          title="Internships"
          value={internships.length}
          icon={Sparkles}
          color="info"
          onClick={() => navigate('/internships')}
        />
        <StatCard
          title="Training Sessions"
          value={training.length}
          icon={GraduationCap}
          color="success"
          onClick={() => navigate('/training')}
        />
      </div>

      {/* Attendance & Quick Actions Split */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {/* Attendance Widget */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CalendarCheck size={18} color="var(--primary)" />
                Pre-Placement Training Attendance
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/attendance')}
              icon={ChevronRight}
              iconPosition="right"
            >
              Detailed Log
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                border: '6px solid var(--success)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--success-light)',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46' }}>
                {attendanceSummary.overallPercentage || 0}%
              </span>
              <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#047857', textTransform: 'uppercase' }}>
                Overall
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {attendanceSummary.status || 'No records available.'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {attendanceSummary.categories && attendanceSummary.categories.length > 0 ? (
              attendanceSummary.categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</span>
                    <span style={{ fontWeight: 700, color: cat.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                      {cat.percentage}% ({cat.attended}/{cat.total})
                    </span>
                  </div>
                  <ProgressBar value={cat.percentage} showPercentage={false} height={6} />
                </div>
              ))
            ) : (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No records available.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              <button
                onClick={() => navigate('/drives')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building2 size={18} color="var(--primary)" />
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Register for Drives
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </button>

              <button
                onClick={() => navigate('/queries')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileQuestion size={18} color="#059669" />
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Career Help Desk
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </button>

              <button
                onClick={() => navigate('/reviews')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrendingUp size={18} color="#d97706" />
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Submit Feedback
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Placement Drives & Training Classes */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Upcoming Placement Drives */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Building2 size={18} color="var(--primary)" />
              Upcoming Placement Drives
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/drives')}
            >
              View All ({drives.length})
            </Button>
          </div>

          {upcomingDrives.length === 0 ? (
            <EmptyState title="No placement drives available." description="" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingDrives.map((drv) => (
                <div
                  key={drv.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {drv.company}
                      </h4>
                      <Badge variant="primary">{drv.tier}</Badge>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                      {drv.role} • <strong style={{ color: '#0f172a' }}>{drv.package}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> Drive: {drv.driveDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> Deadline: {drv.deadline}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/drives/${drv.id}`)}
                    >
                      Details
                    </Button>
                    <Button
                      variant={drv.isRegistered ? 'success' : 'primary'}
                      size="sm"
                      onClick={() => registerForDrive(drv.id)}
                    >
                      {drv.isRegistered ? 'Registered' : 'Register'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Training Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <GraduationCap size={18} color="#059669" />
              Upcoming Training Sessions
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/training')}
            >
              All Schedule
            </Button>
          </div>

          {upcomingTrainings.length === 0 ? (
            <EmptyState title="No training classes available." description="" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingTrainings.map((trn) => (
                <div
                  key={trn.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', flex: 1, paddingRight: 8 }}>
                      {trn.name}
                    </h4>
                    <Badge variant={trn.status === 'Upcoming' ? 'info' : 'neutral'}>
                      {trn.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Trainer: {trn.trainer}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {trn.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {trn.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {trn.venue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements Banner */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Megaphone size={18} color="#ef4444" />
            Recent Announcements from Placement Cell
          </h3>
        </div>

        {recentAnnouncements.length === 0 ? (
          <EmptyState title="No notifications." description="" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {recentAnnouncements.map((ann) => (
              <div
                key={ann.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Badge variant={ann.badgeColor || 'primary'}>{ann.priority} Priority</Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{ann.date}</span>
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    {ann.title}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                    {ann.content}
                  </p>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
                  Issued by: {ann.author}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
