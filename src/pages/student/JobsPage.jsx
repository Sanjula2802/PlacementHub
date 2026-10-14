import React, { useState, useMemo } from 'react';
import { Briefcase, MapPin, Calendar, Clock, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

export const JobsPage = () => {
  const { jobs = [], applyForJob } = usePlacement();

  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  // Filter options with safe null/undefined handling
  const locationOptions = useMemo(() => {
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    const locs = Array.from(
      new Set(
        safeJobs
          .map((j) => (j && j.location ? String(j.location).trim().split(' ')[0] : ''))
          .filter(Boolean)
      )
    );
    return [{ label: 'All Locations', value: 'all' }, ...locs.map((l) => ({ label: l, value: l }))];
  }, [jobs]);

  const statusOptions = [
    { label: 'All Job Statuses', value: 'all' },
    { label: 'Applied by Me', value: 'applied' },
    { label: 'Not Yet Applied', value: 'not-applied' }
  ];

  const filteredJobs = useMemo(() => {
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    return safeJobs.filter((job) => {
      if (!job) return false;
      const title = String(job.title || '');
      const company = String(job.company || '');
      const skills = Array.isArray(job.skills)
        ? job.skills
        : Array.isArray(job.skillsRequired)
        ? job.skillsRequired
        : [];
      const location = String(job.location || '');

      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        company.toLowerCase().includes(search.toLowerCase()) ||
        skills.some((s) => String(s).toLowerCase().includes(search.toLowerCase()));

      const matchesLocation = locationFilter === 'all' || location.includes(locationFilter);

      let matchesStatus = true;
      if (statusFilter === 'applied') matchesStatus = Boolean(job.hasApplied);
      if (statusFilter === 'not-applied') matchesStatus = !job.hasApplied;

      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [jobs, search, locationFilter, statusFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Direct Job Openings</h1>
          <p className="page-subtitle">
            Curated full-time engineering and product opportunities for 2026 graduates.
          </p>
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
          placeholder="Search by job title, company, skills..."
          style={{ maxWidth: 380 }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <FilterDropdown
            label="Location"
            value={locationFilter}
            onChange={setLocationFilter}
            options={locationOptions}
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs available."
          description="There are currently no job opportunities matching your criteria."
        />
      ) : (
        <div className="grid-3">
          {filteredJobs.map((job) => {
            const skills = Array.isArray(job.skills)
              ? job.skills
              : Array.isArray(job.skillsRequired)
              ? job.skillsRequired
              : [];

            return (
              <div
                key={job.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                        {job.company}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                        {job.title}
                      </h3>
                    </div>
                    <Badge variant={job.hasApplied ? 'success' : 'primary'}>
                      {job.hasApplied ? 'Applied' : (job.type || 'Full-Time')}
                    </Badge>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                      {job.salary}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <MapPin size={13} /> {job.location || 'Hyderabad'}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-muted)',
                          fontWeight: 500
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    <span>Deadline: <strong>{job.deadline}</strong></span>
                    <span>{job.applicantsCount || 0} Applicants</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedJob(job)}
                      style={{ flex: 1 }}
                    >
                      Quick View
                    </Button>
                    <Button
                      variant={job.hasApplied ? 'success' : 'primary'}
                      size="sm"
                      onClick={() => applyForJob(job.id)}
                      style={{ flex: 1.5 }}
                      icon={job.hasApplied ? CheckCircle2 : ArrowRight}
                      iconPosition={job.hasApplied ? 'left' : 'right'}
                    >
                      {job.hasApplied ? 'Applied' : 'Apply Now'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button
                variant={selectedJob.hasApplied ? 'success' : 'primary'}
                size="sm"
                onClick={() => {
                  applyForJob(selectedJob.id);
                  setSelectedJob(null);
                }}
              >
                {selectedJob.hasApplied ? 'Withdraw Application' : 'Apply with Current Profile'}
              </Button>
            </div>
          }
        >
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedJob.company}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedJob.title}</h3>
              <div style={{ display: 'flex', gap: 14, color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 6 }}>
                <span>Package: <strong>{selectedJob.salary}</strong></span>
                <span>Location: <strong>{selectedJob.location}</strong></span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>Job Description</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{selectedJob.description}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>Target Technologies</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(Array.isArray(selectedJob.skills)
                  ? selectedJob.skills
                  : Array.isArray(selectedJob.skillsRequired)
                  ? selectedJob.skillsRequired
                  : []
                ).map((s, i) => (
                  <Badge key={i} variant="primary">{s}</Badge>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Openings: <strong>{selectedJob.openings || selectedJob.vacancies || '10'} vacancies</strong> • Application Deadline: <strong>{selectedJob.deadline}</strong>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default JobsPage;
