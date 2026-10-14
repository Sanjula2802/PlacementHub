import React, { useState } from 'react';
import { HelpCircle, MessageSquare, CheckCircle2, Clock, Send, User } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FilterDropdown from '../../components/common/FilterDropdown';
import EmptyState from '../../components/common/EmptyState';

export const AdminQueriesPage = () => {
  const { queries, replyToQuery } = usePlacement();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQueryForReply, setSelectedQueryForReply] = useState(null);
  const [replyText, setReplyText] = useState('');

  const statusOptions = [
    { label: 'All Queries', value: 'all' },
    { label: 'Pending Response', value: 'Pending' },
    { label: 'Resolved Tickets', value: 'Resolved' }
  ];

  const handleOpenReply = (query) => {
    setSelectedQueryForReply(query);
    setReplyText(query.adminResponse || '');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQueryForReply) return;

    replyToQuery(selectedQueryForReply.id, replyText);
    setSelectedQueryForReply(null);
    setReplyText('');
  };

  const filteredQueries = queries.filter((q) =>
    statusFilter === 'all' ? true : q.status === statusFilter
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Help Desk & Query Redressal</h1>
        </div>

        <FilterDropdown
          label="Filter Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
      </div>

      {filteredQueries.length === 0 ? (
        <EmptyState title="No records available." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredQueries.map((q) => (
          <div
            key={q.id}
            className="card"
            style={{
              borderLeft: `5px solid ${q.status === 'Resolved' ? 'var(--success)' : 'var(--warning)'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Badge variant={q.status === 'Resolved' ? 'success' : 'warning'}>
                    {q.status}
                  </Badge>
                  <Badge variant="primary">{q.category}</Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Ticket: {q.id}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {q.subject}
                </h3>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Student: <strong>{q.studentName}</strong> ({q.studentId}) • Priority: <strong>{q.priority}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.78125rem', color: 'var(--text-light)' }}>{q.createdAt}</span>
                <Button
                  variant={q.status === 'Resolved' ? 'secondary' : 'primary'}
                  size="sm"
                  icon={MessageSquare}
                  onClick={() => handleOpenReply(q)}
                >
                  {q.status === 'Resolved' ? 'Edit Response' : 'Reply to Student'}
                </Button>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6, backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
              "{q.description}"
            </p>

            {q.status === 'Resolved' && q.adminResponse && (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px'
                }}
              >
                <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#065f46', marginBottom: 4 }}>
                  Official Response Recorded ({q.resolvedAt} by {q.resolvedBy}):
                </div>
                <p style={{ fontSize: '0.84rem', color: '#064e3b', lineHeight: 1.5 }}>
                  {q.adminResponse}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Reply Modal */}
      {selectedQueryForReply && (
        <Modal
          isOpen={!!selectedQueryForReply}
          onClose={() => setSelectedQueryForReply(null)}
          title={`Reply to Query: ${selectedQueryForReply.id}`}
        >
          <form onSubmit={handleSendReply}>
            <div style={{ marginBottom: 14, padding: 12, backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Student Query:</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: 2 }}>{selectedQueryForReply.subject}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                "{selectedQueryForReply.description}"
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Official Placement Office Response</label>
              <textarea
                rows={5}
                required
                className="form-textarea"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Enter response"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button variant="secondary" onClick={() => setSelectedQueryForReply(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Send}>
                Save Response & Mark Resolved
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminQueriesPage;
