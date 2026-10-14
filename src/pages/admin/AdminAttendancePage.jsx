import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';

export const AdminAttendancePage = () => {
  const { studentsAttendance, updateStudentAttendanceRecord } = usePlacement();

  const [search, setSearch] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [formScores, setFormScores] = useState({
    aptitude: 0,
    technical: 0,
    softskills: 0,
    mock: 0
  });

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormScores({
      aptitude: rec.aptitude || 0,
      technical: rec.technical || 0,
      softskills: rec.softskills || 0,
      mock: rec.mock || 0
    });
  };

  const handleSaveAttendance = (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    updateStudentAttendanceRecord(editingRecord.id, 'aptitude', formScores.aptitude);
    updateStudentAttendanceRecord(editingRecord.id, 'technical', formScores.technical);
    updateStudentAttendanceRecord(editingRecord.id, 'softskills', formScores.softskills);
    updateStudentAttendanceRecord(editingRecord.id, 'mock', formScores.mock);

    setEditingRecord(null);
  };

  const filtered = studentsAttendance.filter(
    (s) =>
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.dept || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Records</h1>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by student name, roll number, or department..."
          style={{ maxWidth: 420 }}
        />
      </div>

      {/* Attendance Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student Name & ID</th>
              <th>Dept</th>
              <th>Overall %</th>
              <th>Aptitude</th>
              <th>Technical</th>
              <th>Soft Skills</th>
              <th>Mock Interviews</th>
              <th>Drive Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: 'center',
                    padding: '36px 16px',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem'
                  }}
                >
                  No records available.
                </td>
              </tr>
            ) : (
              filtered.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{rec.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.id}</div>
                  </td>
                  <td>{rec.dept}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, color: rec.overall >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                        {rec.overall}%
                      </span>
                    </div>
                  </td>
                  <td>{rec.aptitude}%</td>
                  <td>{rec.technical}%</td>
                  <td>{rec.softskills}%</td>
                  <td>{rec.mock}%</td>
                  <td>
                    <Badge variant={rec.status === 'Eligible' ? 'success' : 'danger'}>
                      {rec.status}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Edit3}
                      onClick={() => handleOpenEdit(rec)}
                    >
                      Adjust
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      {editingRecord && (
        <Modal
          isOpen={Boolean(editingRecord)}
          onClose={() => setEditingRecord(null)}
          title={`Adjust Attendance: ${editingRecord.name}`}
        >
          <form onSubmit={handleSaveAttendance}>
            <div className="form-group">
              <label className="form-label">Aptitude Training Attendance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={formScores.aptitude}
                onChange={(e) => setFormScores({ ...formScores, aptitude: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technical Training Attendance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={formScores.technical}
                onChange={(e) => setFormScores({ ...formScores, technical: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Soft Skills Attendance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={formScores.softskills}
                onChange={(e) => setFormScores({ ...formScores, softskills: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mock Interview Attendance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={formScores.mock}
                onChange={(e) => setFormScores({ ...formScores, mock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button variant="secondary" onClick={() => setEditingRecord(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Attendance
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminAttendancePage;
