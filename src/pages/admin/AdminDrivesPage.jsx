import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  Edit2,
  Trash2,
  Users
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';

export const AdminDrivesPage = () => {
  const { drives, addDrive, editDrive, deleteDrive } = usePlacement();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [viewingRegisteredDrive, setViewingRegisteredDrive] = useState(null);

  // Form state - starts empty
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    package: '',
    packageValue: '',
    tier: 'Tier 1',
    location: '',
    eligibility: '',
    minCgpa: '',
    allowedBranches: [],
    driveDate: '',
    deadline: '',
    venue: '',
    selectionProcess: '',
    description: '',
    skillsRequired: [],
    vacancies: ''
  });

  const resetForm = () => {
    setFormData({
      company: '',
      role: '',
      package: '',
      packageValue: '',
      tier: 'Tier 1',
      location: '',
      eligibility: '',
      minCgpa: '',
      allowedBranches: [],
      driveDate: '',
      deadline: '',
      venue: '',
      selectionProcess: '',
      description: '',
      skillsRequired: [],
      vacancies: ''
    });
    setEditingDrive(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (drive) => {
    setEditingDrive(drive);
    setFormData({
      company: drive.company || '',
      role: drive.role || '',
      package: drive.package || '',
      packageValue: drive.packageValue || '',
      tier: drive.tier || 'Tier 1',
      location: drive.location || '',
      eligibility: drive.eligibility || '',
      minCgpa: drive.minCgpa ?? '',
      allowedBranches: drive.allowedBranches || [],
      driveDate: drive.driveDate || '',
      deadline: drive.deadline || '',
      venue: drive.venue || '',
      selectionProcess: drive.selectionProcess || '',
      description: drive.description || '',
      skillsRequired: drive.skillsRequired || [],
      vacancies: drive.vacancies || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDrive) {
      editDrive(editingDrive.id, formData);
    } else {
      addDrive(formData);
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const filteredDrives = drives.filter(
    (d) =>
      (d.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Placement Drives</h1>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={handleOpenAdd}>
          Add New Placement Drive
        </Button>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search placement drives..."
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Drives Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Company & Role</th>
              <th>Tier / Package</th>
              <th>Min CGPA</th>
              <th>Drive Date</th>
              <th>Deadline</th>
              <th>Registered Candidates</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrives.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: 'center',
                    padding: '36px 16px',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem'
                  }}
                >
                  No placement drives available.
                </td>
              </tr>
            ) : (
              filteredDrives.map((drv) => (
                <tr key={drv.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{drv.company}</div>
                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>{drv.role}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{drv.package}</div>
                    <Badge variant="warning">{drv.tier}</Badge>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{drv.minCgpa} CGPA</span>
                  </td>
                  <td>{drv.driveDate}</td>
                  <td>{drv.deadline}</td>
                  <td>
                    <button
                      onClick={() => setViewingRegisteredDrive(drv)}
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: 'var(--primary)',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Users size={12} /> {drv.registeredStudents?.length || 0} Students
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => handleOpenEdit(drv)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => deleteDrive(drv.id)}
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

      {/* Add / Edit Drive Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingDrive ? 'Edit Placement Drive' : 'Create New Placement Drive'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Role</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Enter job role"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Package (CTC in LPA)</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                placeholder="Enter package"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tier Category</label>
              <select
                className="form-select"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
              >
                <option value="Super Dream">Super Dream</option>
                <option value="Dream">Dream</option>
                <option value="Tier 1">Tier 1</option>
                <option value="Core">Core</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Min CGPA Threshold</label>
              <input
                type="number"
                step="0.1"
                required
                className="form-input"
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })}
                placeholder="Enter minimum CGPA"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Location</label>
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
              <label className="form-label">Drive Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.driveDate}
                onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deadline Date</label>
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
            <label className="form-label">Eligibility Criteria</label>
            <input
              type="text"
              className="form-input"
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              placeholder="Enter eligibility criteria"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Job Scope</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingDrive ? 'Update Drive' : 'Publish Drive'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Registered Students Modal */}
      {viewingRegisteredDrive && (
        <Modal
          isOpen={Boolean(viewingRegisteredDrive)}
          onClose={() => setViewingRegisteredDrive(null)}
          title={`Registered Candidates: ${viewingRegisteredDrive.company}`}
        >
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Email</th>
                  <th>CGPA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!viewingRegisteredDrive.registeredStudents ||
                viewingRegisteredDrive.registeredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: 'center',
                        padding: '24px 16px',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem'
                      }}
                    >
                      No records available.
                    </td>
                  </tr>
                ) : (
                  viewingRegisteredDrive.registeredStudents.map((s, idx) => (
                    <tr key={s.id || idx}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.id}</td>
                      <td>{s.email}</td>
                      <td>{s.cgpa}</td>
                      <td>
                        <Badge variant="success">{s.status || 'Registered'}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDrivesPage;
