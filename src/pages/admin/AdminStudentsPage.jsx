import React, { useState, useMemo } from 'react';
import { Eye, GraduationCap, User } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export const AdminStudentsPage = () => {
  const { students } = usePlacement();

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Dropdown options matching required specifications strictly
  const branchOptions = [
    { label: 'All Branches', value: 'all' },
    { label: 'CSE', value: 'CSE' },
    { label: 'CSE-AI/ML', value: 'CSE-AI/ML' },
    { label: 'CSE-DS', value: 'CSE-DS' },
    { label: 'ECE', value: 'ECE' },
    { label: 'EEE', value: 'EEE' },
    { label: 'MECH', value: 'MECH' },
    { label: 'AERO', value: 'AERO' }
  ];

  const sectionOptions = [
    { label: 'All Sections', value: 'all' },
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' },
    { label: 'E', value: 'E' },
    { label: 'F', value: 'F' },
    { label: 'G', value: 'G' }
  ];

  const yearOptions = [
    { label: 'All Years', value: 'all' },
    { label: '3rd Year', value: '3rd Year' },
    { label: '4th Year', value: '4th Year' }
  ];

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const name = s.name || s.fullName || '';
      const id = s.id || s.studentId || '';
      const branch = s.department || '';
      const section = s.section || '';
      const year = s.year || '';

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        id.toLowerCase().includes(search.toLowerCase());

      const matchesBranch = branchFilter === 'all' || branch === branchFilter;
      const matchesSection = sectionFilter === 'all' || section === sectionFilter;
      const matchesYear = yearFilter === 'all' || year === yearFilter;

      return matchesSearch && matchesBranch && matchesSection && matchesYear;
    });
  }, [students, search, branchFilter, sectionFilter, yearFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Directory</h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by student name or ID..."
          style={{ maxWidth: 320 }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <FilterDropdown
            label="Branch"
            value={branchFilter}
            onChange={setBranchFilter}
            options={branchOptions}
          />
          <FilterDropdown
            label="Section"
            value={sectionFilter}
            onChange={setSectionFilter}
            options={sectionOptions}
          />
          <FilterDropdown
            label="Year"
            value={yearFilter}
            onChange={setYearFilter}
            options={yearOptions}
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Branch</th>
              <th>Section</th>
              <th>Year</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
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
              filteredStudents.map((s) => (
                <tr key={s.id || s.studentId}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {s.name || s.fullName}
                    </div>
                  </td>
                  <td>{s.id || s.studentId}</td>
                  <td>{s.department}</td>
                  <td>{s.section || '-'}</td>
                  <td>{s.year}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedStudent(s)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title="Student Information"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}
              >
                <User size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {selectedStudent.name || selectedStudent.fullName}
                </h3>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  ID: {selectedStudent.id || selectedStudent.studentId}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: '0.875rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Branch</span>
                <strong>{selectedStudent.department || '-'}</strong>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Section</span>
                <strong>{selectedStudent.section || '-'}</strong>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Year</span>
                <strong>{selectedStudent.year || '-'}</strong>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Email</span>
                <strong>{selectedStudent.email || '-'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminStudentsPage;
