import React, { useState } from 'react';
import { Sparkles, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';

export const AdminInternshipsPage = () => {
  const { internships, addInternship, editInternship, deleteInternship } = usePlacement();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    duration: '',
    location: '',
    stipend: '',
    deadline: '',
    description: '',
    ppoOffered: '',
    skills: []
  });

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      duration: '',
      location: '',
      stipend: '',
      deadline: '',
      description: '',
      ppoOffered: '',
      skills: []
    });
    setEditingInternship(null);
  };

  const handleOpenEdit = (item) => {
    setEditingInternship(item);
    setFormData({
      title: item.title || '',
      company: item.company || '',
      duration: item.duration || '',
      location: item.location || '',
      stipend: item.stipend || '',
      deadline: item.deadline || '',
      description: item.description || '',
      ppoOffered: item.ppoOffered || '',
      skills: item.skills || []
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingInternship) {
      editInternship(editingInternship.id, formData);
    } else {
      addInternship(formData);
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const filteredInternships = internships.filter(
    (i) =>
      (i.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.company || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Internship & PPO Listings</h1>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          Add Internship Posting
        </Button>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title or company..."
          style={{ maxWidth: 400 }}
        />
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Internship Title & Company</th>
              <th>Duration</th>
              <th>Stipend</th>
              <th>Location</th>
              <th>PPO Opportunity</th>
              <th>Applicants</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInternships.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  No internships available.
                </td>
              </tr>
            ) : (
              filteredInternships.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>{item.company}</div>
                  </td>
                  <td>{item.duration}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.stipend}</span>
                  </td>
                  <td>{item.location}</td>
                  <td>
                    <Badge variant={item.ppoOffered ? 'success' : 'info'}>{item.ppoOffered ? 'PPO Included' : 'Standard'}</Badge>
                  </td>
                  <td>
                    <Badge variant="info">{item.applicantsCount || 0} Applicants</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => handleOpenEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => deleteInternship(item.id)}
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
        title={editingInternship ? 'Edit Internship Posting' : 'Add New Internship'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Role Title</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter role title"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Monthly Stipend</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                placeholder="Enter monthly stipend"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Enter duration"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Scope Description</label>
            <textarea
              rows={3}
              required
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter scope description"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingInternship ? 'Update Internship' : 'Publish Internship'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInternshipsPage;
