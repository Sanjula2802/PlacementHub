import React, { useState } from 'react';
import { Award, PlusCircle, Calendar, Tag, Users } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export const AdminCertificationsPage = () => {
  const { certifications, addCertification } = usePlacement();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    category: '',
    voucherDiscount: '',
    deadline: '',
    examDate: '',
    duration: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCertification(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      provider: '',
      category: '',
      voucherDiscount: '',
      deadline: '',
      examDate: '',
      duration: '',
      description: ''
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Industry Certifications</h1>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={() => setIsAddModalOpen(true)}>
          Add Certification Opportunity
        </Button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Certification & Provider</th>
              <th>Category</th>
              <th>Voucher Subsidy</th>
              <th>Registration Deadline</th>
              <th>Exam Schedule</th>
              <th>Students Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {certifications.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  No records available.
                </td>
              </tr>
            ) : (
              certifications.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>{c.provider}</div>
                  </td>
                  <td>{c.category}</td>
                  <td>
                    <Badge variant="primary">{c.voucherDiscount}</Badge>
                  </td>
                  <td>{c.deadline}</td>
                  <td>{c.examDate}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{c.enrolledCount || 0} Enrolled</span>
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
        title="Add Certification Voucher Program"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Certification Title</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter certification title"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Provider Organization</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Enter provider organization"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Domain Category</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter category"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Voucher Benefit</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.voucherDiscount}
              onChange={(e) => setFormData({ ...formData, voucherDiscount: e.target.value })}
              placeholder="Enter voucher benefit"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Last Date to Register</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Exam Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Syllabus</label>
            <textarea
              rows={3}
              required
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Certification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCertificationsPage;
