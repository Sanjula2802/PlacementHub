import React, { useState } from 'react';
import { Briefcase, PlusCircle, Edit2, Trash2, MapPin, DollarSign, Users } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';

export const AdminJobsPage = () => {
  const { jobs, addJob, editJob, deleteJob } = usePlacement();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-Time',
    experience: '',
    deadline: '',
    description: '',
    skills: [],
    openings: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      salary: '',
      type: 'Full-Time',
      experience: '',
      deadline: '',
      description: '',
      skills: [],
      openings: ''
    });
    setEditingJob(null);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      salary: job.salary || '',
      type: job.type || 'Full-Time',
      experience: job.experience || '',
      deadline: job.deadline || '',
      description: job.description || '',
      skills: job.skills || [],
      openings: job.openings || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingJob) {
      editJob(editingJob.id, formData);
    } else {
      addJob(formData);
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const filteredJobs = jobs.filter(
    (j) =>
      (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.company || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Job Postings</h1>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          Add New Job Listing
        </Button>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by job title or company..."
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Jobs Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Job Title & Company</th>
              <th>Location</th>
              <th>Compensation</th>
              <th>Applicants</th>
              <th>Deadline</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  No jobs available.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{job.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>{job.company}</div>
                  </td>
                  <td>{job.location}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{job.salary}</span>
                  </td>
                  <td>
                    <Badge variant="info">{job.applicantsCount || 0} Applicants</Badge>
                  </td>
                  <td>{job.deadline}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => handleOpenEdit(job)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => deleteJob(job.id)}
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
        title={editingJob ? 'Edit Job Opening' : 'Add New Job Opening'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter job title"
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
              <label className="form-label">Package / Salary Range</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="Enter salary range"
              />
            </div>

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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Vacancies / Openings</label>
              <input
                type="number"
                required
                className="form-input"
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                placeholder="Enter vacancies"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline</label>
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
            <label className="form-label">Job Description</label>
            <textarea
              rows={3}
              required
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter job description"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingJob ? 'Update Job' : 'Publish Job'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminJobsPage;
