import React, { useState, useMemo } from 'react';
import { Sparkles, MapPin, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

export const InternshipsPage = () => {
  const { internships, applyForInternship } = usePlacement();

  const [search, setSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInternship, setSelectedInternship] = useState(null);

  const durationOptions = [
    { label: 'All Durations', value: 'all' },
    { label: '6 Months', value: '6 Months' },
    { label: '4 Months', value: '4 Months' }
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Applied by Me', value: 'applied' },
    { label: 'Not Yet Applied', value: 'not-applied' }
  ];

  const filteredInternships = useMemo(() => {
    const safeInternships = Array.isArray(internships) ? internships : [];
    return safeInternships.filter((item) => {
      if (!item) return false;
      const title = String(item.title || '');
      const company = String(item.company || '');
      const skills = Array.isArray(item.skills)
        ? item.skills
        : Array.isArray(item.skillsRequired)
        ? item.skillsRequired
        : [];
      const duration = String(item.duration || '');

      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        company.toLowerCase().includes(search.toLowerCase()) ||
        skills.some((s) => String(s).toLowerCase().includes(search.toLowerCase()));

      const matchesDuration = durationFilter === 'all' || duration.includes(durationFilter);

      let matchesStatus = true;
      if (statusFilter === 'applied') matchesStatus = Boolean(item.hasApplied);
      if (statusFilter === 'not-applied') matchesStatus = !item.hasApplied;

      return matchesSearch && matchesDuration && matchesStatus;
    });
  }, [internships, search, durationFilter, statusFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Internships & PPO Programs</h1>
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
          placeholder="Search by role, company, skills..."
          style={{ maxWidth: 380 }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <FilterDropdown
            label="Duration"
            value={durationFilter}
            onChange={setDurationFilter}
            options={durationOptions}
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Grid */}
      {filteredInternships.length === 0 ? (
        <EmptyState
          title="No internships available."
        />
      ) : (
        <div className="grid-3">
          {filteredInternships.map((item) => (
            <div
              key={item.id}
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
                      {item.company}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                      {item.title}
                    </h3>
                  </div>
                  <Badge variant={item.hasApplied ? 'success' : 'info'}>
                    {item.hasApplied ? 'Applied' : 'PPO Eligible'}
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
                    {item.stipend}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {item.duration}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {item.location}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                  {item.description}
                </p>

                {item.ppoOffered && (
                  <div style={{ fontSize: '0.75rem', color: '#047857', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: 4, marginBottom: 12, display: 'inline-block', fontWeight: 600 }}>
                    ✨ {item.ppoOffered}
                  </div>
                )}

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {(Array.isArray(item.skills)
                    ? item.skills
                    : Array.isArray(item.skillsRequired)
                    ? item.skillsRequired
                    : []
                  ).map((skill, idx) => (
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
                  <span>Deadline: <strong>{item.deadline}</strong></span>
                  <span>{item.applicantsCount} Applicants</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedInternship(item)}
                    style={{ flex: 1 }}
                  >
                    Details
                  </Button>
                  <Button
                    variant={item.hasApplied ? 'success' : 'primary'}
                    size="sm"
                    onClick={() => applyForInternship(item.id)}
                    style={{ flex: 1.5 }}
                    icon={item.hasApplied ? CheckCircle2 : ArrowRight}
                    iconPosition={item.hasApplied ? 'left' : 'right'}
                  >
                    {item.hasApplied ? 'Applied' : 'Apply Now'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedInternship && (
        <Modal
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          title={selectedInternship.title}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => setSelectedInternship(null)}>
                Close
              </Button>
              <Button
                variant={selectedInternship.hasApplied ? 'success' : 'primary'}
                size="sm"
                onClick={() => {
                  applyForInternship(selectedInternship.id);
                  setSelectedInternship(null);
                }}
              >
                {selectedInternship.hasApplied ? 'Withdraw Application' : 'Confirm Internship Application'}
              </Button>
            </div>
          }
        >
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedInternship.company}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedInternship.title}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 6 }}>
                <span>Stipend: <strong>{selectedInternship.stipend}</strong></span>
                <span>Duration: <strong>{selectedInternship.duration}</strong></span>
                <span>Location: <strong>{selectedInternship.location}</strong></span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>Internship Scope & Project Deliverables</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{selectedInternship.description}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>Desired Skill Competencies</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(Array.isArray(selectedInternship.skills)
                  ? selectedInternship.skills
                  : Array.isArray(selectedInternship.skillsRequired)
                  ? selectedInternship.skillsRequired
                  : []
                ).map((s, i) => (
                  <Badge key={i} variant="primary">{s}</Badge>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              PPO Policy: <strong>{selectedInternship.ppoOffered}</strong> • Last Date to Apply: <strong>{selectedInternship.deadline}</strong>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InternshipsPage;
