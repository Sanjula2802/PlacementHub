import React, { useState } from 'react';
import { FileText, PlusCircle, Calendar, Clock, Award } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export const AdminExamsPage = () => {
  const { exams, addExam } = usePlacement();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Coding Assessment',
    date: '',
    time: '',
    duration: '',
    totalMarks: '',
    platform: '',
    syllabus: '',
    instructions: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addExam(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      type: 'Coding Assessment',
      date: '',
      time: '',
      duration: '',
      totalMarks: '',
      platform: '',
      syllabus: '',
      instructions: ''
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Pre-Placement Assessments & Exams</h1>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={() => setIsAddModalOpen(true)}>
          Create Assessment
        </Button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Assessment Name</th>
              <th>Evaluation Type</th>
              <th>Date & Window</th>
              <th>Platform</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  No records available.
                </td>
              </tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{exam.name}</div>
                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>{exam.syllabus}</div>
                  </td>
                  <td>
                    <Badge variant="primary">{exam.type}</Badge>
                  </td>
                  <td>
                    <div>{exam.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exam.time}</div>
                  </td>
                  <td>{exam.platform}</td>
                  <td>{exam.duration}</td>
                  <td>
                    <Badge variant={exam.status === 'Completed' ? 'success' : 'info'}>{exam.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Assessment Test"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Assessment Title</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter assessment title"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Assessment Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Coding Assessment">Coding Assessment</option>
                <option value="Aptitude & Reasoning">Aptitude & Reasoning</option>
                <option value="Technical Diagnostic">Technical Diagnostic</option>
                <option value="Core CS Fundamentals">Core CS Fundamentals</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Testing Engine / Portal</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="Enter portal or platform"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Window</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="Enter time window"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Syllabus Breakdown</label>
            <textarea
              rows={2}
              required
              className="form-textarea"
              value={formData.syllabus}
              onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
              placeholder="Enter syllabus"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Exam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminExamsPage;
