import React, { useState } from 'react';
import { Megaphone, PlusCircle, Trash2, Calendar, User } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

export const AdminAnnouncementsPage = () => {
  const { announcements, addAnnouncement, deleteAnnouncement } = usePlacement();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Placement Guideline',
    priority: 'Normal',
    content: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    addAnnouncement(formData);
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      category: 'Placement Guideline',
      priority: 'Normal',
      content: ''
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Announcements & Broadcasts</h1>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={() => setIsAddModalOpen(true)}>
          New Announcement
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {announcements.length === 0 ? (
          <EmptyState title="No records available." />
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Badge variant={ann.priority === 'High' ? 'danger' : 'primary'}>{ann.priority} Priority</Badge>
                    <Badge variant="neutral">{ann.category}</Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{ann.date}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {ann.title}
                  </h3>
                </div>

                <Button
                  variant="outline-danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => deleteAnnouncement(ann.id)}
                >
                  Delete Notice
                </Button>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: 12 }}>
                {ann.content}
              </p>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
                Issued by: <strong>{ann.author}</strong>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Publish Official Notice"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Notice Headline</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter notice headline"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Placement Guideline">Placement Guideline</option>
                <option value="Company Visit">Company Visit</option>
                <option value="Certifications">Certifications</option>
                <option value="Campus Protocol">Campus Protocol</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="High">High</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Text</label>
            <textarea
              rows={4}
              required
              className="form-textarea"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter announcement text"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnnouncementsPage;
