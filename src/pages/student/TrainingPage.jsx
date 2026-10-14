import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export const TrainingPage = () => {
  const { training } = usePlacement();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions = [
    { label: 'All Sessions', value: 'all' },
    { label: 'Upcoming Only', value: 'Upcoming' },
    { label: 'Past / Completed', value: 'Past' }
  ];

  const filteredTraining = useMemo(() => {
    const safeTraining = Array.isArray(training) ? training : [];
    return safeTraining.filter((t) => {
      if (!t) return false;
      const name = String(t.name || t.title || '');
      const trainer = String(t.trainer || '');
      const topic = String(t.topic || t.description || t.category || '');

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        trainer.toLowerCase().includes(search.toLowerCase()) ||
        topic.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [training, search, statusFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pre-Placement Training & Masterclasses</h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by topic, session name or instructor..."
          style={{ maxWidth: 400 }}
        />

        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
      </div>

      {/* Training Sessions List */}
      {filteredTraining.length === 0 ? (
        <EmptyState
          title="No training classes available."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredTraining.map((session) => (
            <div
              key={session.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                borderLeft: `5px solid ${session.status === 'Upcoming' ? 'var(--primary)' : '#94a3b8'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Badge variant={session.status === 'Upcoming' ? 'primary' : 'neutral'}>
                      {session.status}
                    </Badge>
                    {session.attendanceMandatory && (
                      <Badge variant="danger">Attendance Mandatory</Badge>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{session.mode}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                    {session.name || session.title}
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Instructor: <strong style={{ color: 'var(--text-main)' }}>{session.trainer}</strong> ({session.trainerRole || 'Instructor'})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {session.materialsLink && (
                    <a
                      href={session.materialsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      <FileText size={14} /> Notes & Syllabus
                    </a>
                  )}
                </div>
              </div>

              {/* Topic Details Box */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.84rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                  Curriculum & Focus Areas:
                </div>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{session.topic || session.description}</div>
              </div>

              {/* Schedule Logistics */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 20,
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: 12
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} color="var(--primary)" /> Date: <strong style={{ color: '#0f172a' }}>{session.date}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} color="var(--primary)" /> Time: <strong style={{ color: '#0f172a' }}>{session.time}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} color="var(--primary)" /> Venue: <strong style={{ color: '#0f172a' }}>{session.venue}</strong>
                </span>
                {session.totalRegistered ? (
                  <span style={{ marginLeft: 'auto', color: 'var(--text-light)' }}>
                    {session.totalRegistered} Students Registered
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingPage;
