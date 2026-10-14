import React, { useState } from 'react';
import { GraduationCap, PlusCircle, Edit2, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';

export const AdminTrainingPage = () => {
  const { training, addTraining, editTraining, deleteTraining } = usePlacement();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    trainer: '',
    trainerRole: 'Instructor',
    date: '',
    time: '',
    venue: '',
    mode: 'Offline',
    topic: '',
    status: 'Upcoming',
    attendanceMandatory: true,
    totalRegistered: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      trainer: '',
      trainerRole: 'Instructor',
      date: '',
      time: '',
      venue: '',
      mode: 'Offline',
      topic: '',
      status: 'Upcoming',
      attendanceMandatory: true,
      totalRegistered: ''
    });
    setEditingSession(null);
  };

  const handleOpenEdit = (t) => {
    setEditingSession(t);
    setFormData({
      name: t.name || '',
      trainer: t.trainer || '',
      trainerRole: t.trainerRole || 'Instructor',
      date: t.date || '',
      time: t.time || '',
      venue: t.venue || '',
      mode: t.mode || 'Offline',
      topic: t.topic || '',
      status: t.status || 'Upcoming',
      attendanceMandatory: t.attendanceMandatory ?? true,
      totalRegistered: t.totalRegistered || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSession) {
      editTraining(editingSession.id, formData);
    } else {
      addTraining(formData);
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const filtered = training.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.trainer || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Training Classes & Bootcamps</h1>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          Schedule Training Class
        </Button>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by topic or instructor..."
          style={{ maxWidth: 400 }}
        />
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Training Module</th>
              <th>Instructor</th>
              <th>Date & Time</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Mandatory</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  No training classes available.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>{t.topic}</div>
                  </td>
                  <td>{t.trainer}</td>
                  <td>
                    <div>{t.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.time}</div>
                  </td>
                  <td>{t.venue}</td>
                  <td>
                    <Badge variant={t.status === 'Upcoming' ? 'info' : 'neutral'}>{t.status}</Badge>
                  </td>
                  <td>
                    <Badge variant={t.attendanceMandatory ? 'danger' : 'neutral'}>
                      {t.attendanceMandatory ? 'Mandatory' : 'Optional'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => handleOpenEdit(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => deleteTraining(t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingSession ? 'Edit Training Session' : 'Schedule Training Session'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Module / Workshop Title</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter module title"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Instructor Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.trainer}
                onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                placeholder="Enter instructor name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Venue / Hall</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Enter venue"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Date</label>
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
            <label className="form-label">Topics Covered</label>
            <textarea
              rows={3}
              required
              className="form-textarea"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Enter topics covered"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingSession ? 'Update Session' : 'Schedule Session'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTrainingPage;
