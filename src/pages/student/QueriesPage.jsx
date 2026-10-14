import React, { useState } from 'react';
import {
  HelpCircle,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  User,
  ShieldCheck,
  Send
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

export const QueriesPage = () => {
  const { queries, addQuery, studentProfile } = usePlacement();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [category, setCategory] = useState('Placement Drive Eligibility');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  const categories = [
    'Placement Drive Eligibility',
    'Resume Verification',
    'Training & Attendance',
    'NOC for Internship',
    'Shortlist & Assessment Issue',
    'General Query'
  ];

  const handleCreateQuery = (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    addQuery({
      category,
      subject,
      description,
      priority
    });

    setSubject('');
    setDescription('');
    setIsCreateModalOpen(false);
  };

  const studentQueries = queries.filter((q) => !studentProfile.id || q.studentId === studentProfile.id);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Career Help Desk & Student Grievances</h1>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Query
        </Button>
      </div>

      {/* Query List */}
      {studentQueries.length === 0 ? (
        <EmptyState title="No records available." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {studentQueries.map((query) => (
            <div
              key={query.id}
              className="card"
              style={{
                borderLeft: `5px solid ${query.status === 'Resolved' ? 'var(--success)' : 'var(--warning)'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Badge variant={query.status === 'Resolved' ? 'success' : 'warning'}>
                      {query.status}
                    </Badge>
                    <Badge variant="primary">{query.category}</Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Ticket ID: {query.id}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {query.subject}
                  </h3>
                </div>

                <span style={{ fontSize: '0.78125rem', color: 'var(--text-light)' }}>
                  Submitted: {query.createdAt}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: 14 }}>
                {query.description}
              </p>

              {/* Admin Response Box */}
              {query.status === 'Resolved' && query.adminResponse ? (
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginTop: 6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <ShieldCheck size={16} color="var(--success)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#065f46' }}>
                      Placement Officer Response:
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#047857', marginLeft: 'auto' }}>
                      {query.resolvedAt} • {query.resolvedBy}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#064e3b', lineHeight: 1.5 }}>
                    {query.adminResponse}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.8125rem',
                    color: '#92400e'
                  }}
                >
                  <Clock size={15} />
                  <span>Under review by the Training & Placement Cell.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Query Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Submit New Help Desk Query"
      >
        <form onSubmit={handleCreateQuery}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject / Topic Summary</label>
            <input
              type="text"
              required
              className="form-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter query subject"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Question</label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter question details"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Send}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QueriesPage;
