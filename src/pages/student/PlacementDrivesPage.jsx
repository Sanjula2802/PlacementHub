import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export const PlacementDrivesPage = () => {
  const { drives, registerForDrive, studentProfile } = usePlacement();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter options
  const companyOptions = useMemo(() => {
    const unique = Array.from(new Set(drives.map((d) => d.company)));
    return [{ label: 'All Companies', value: 'all' }, ...unique.map((c) => ({ label: c, value: c }))];
  }, [drives]);

  const eligibilityOptions = [
    { label: 'All Eligibility Criteria', value: 'all' },
    { label: 'Eligible for Me', value: 'eligible' },
    { label: 'Super Dream (> 20 LPA)', value: 'super-dream' },
    { label: 'Registered Only', value: 'registered' }
  ];

  const filteredDrives = useMemo(() => {
    return drives.filter((drv) => {
      const company = drv.company || '';
      const role = drv.role || '';
      const skills = drv.skillsRequired || [];

      const matchesSearch =
        company.toLowerCase().includes(search.toLowerCase()) ||
        role.toLowerCase().includes(search.toLowerCase()) ||
        skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchesCompany = companyFilter === 'all' || company === companyFilter;

      let matchesEligibility = true;
      if (eligibilityFilter === 'eligible') {
        matchesEligibility = (studentProfile.cgpa || 0) >= (drv.minCgpa || 0);
      } else if (eligibilityFilter === 'super-dream') {
        matchesEligibility = (drv.packageValue || 0) >= 20;
      } else if (eligibilityFilter === 'registered') {
        matchesEligibility = Boolean(drv.isRegistered);
      }

      return matchesSearch && matchesCompany && matchesEligibility;
    });
  }, [drives, search, companyFilter, eligibilityFilter, studentProfile.cgpa]);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Placement Drives</h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#e2e8f0',
              padding: '3px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: viewMode === 'grid' ? 'var(--text-main)' : 'var(--text-muted)'
              }}
            >
              <LayoutGrid size={15} /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: viewMode === 'table' ? 'var(--text-main)' : 'var(--text-muted)'
              }}
            >
              <TableIcon size={15} /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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
          placeholder="Search placement drives..."
          style={{ maxWidth: 360 }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <FilterDropdown
            label="Company"
            value={companyFilter}
            onChange={setCompanyFilter}
            options={companyOptions}
          />
          <FilterDropdown
            label="Filter"
            value={eligibilityFilter}
            onChange={setEligibilityFilter}
            options={eligibilityOptions}
          />
        </div>
      </div>

      {/* Drives Content */}
      {viewMode === 'grid' ? (
        filteredDrives.length === 0 ? (
          <EmptyState title="No placement drives available." description="" />
        ) : (
          <div className="grid-3">
            {filteredDrives.map((drv) => {
              const isEligible = (studentProfile.cgpa || 0) >= (drv.minCgpa || 0);

              return (
                <div
                  key={drv.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                          {drv.company}
                        </span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                          {drv.role}
                        </h3>
                      </div>
                      <Badge variant={(drv.packageValue || 0) >= 20 ? 'warning' : 'primary'}>{drv.tier}</Badge>
                    </div>

                    {/* Highlights */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        <Award size={16} color="var(--primary)" />
                        <span>{drv.package}</span>
                      </div>
                      <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                        Location: {drv.location}
                      </div>
                    </div>

                    {/* Eligibility */}
                    <div style={{ marginBottom: 12, fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>Eligibility:</div>
                      <div style={{ color: 'var(--text-muted)' }}>{drv.eligibility}</div>
                      <div style={{ marginTop: 4 }}>
                        <Badge variant={isEligible ? 'success' : 'danger'}>
                          {isEligible ? 'Eligible for You' : `Ineligible (Requires min ${drv.minCgpa} CGPA)`}
                        </Badge>
                      </div>
                    </div>

                    {/* Deadline */}
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> Drive: {drv.driveDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> Deadline: {drv.deadline}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/drives/${drv.id}`)}
                        style={{ flex: 1 }}
                      >
                        Details
                      </Button>
                      <Button
                        variant={drv.isRegistered ? 'success' : 'primary'}
                        size="sm"
                        disabled={!isEligible && !drv.isRegistered}
                        onClick={() => registerForDrive(drv.id)}
                        style={{ flex: 1.4 }}
                        icon={drv.isRegistered ? CheckCircle2 : undefined}
                      >
                        {drv.isRegistered ? 'Registered' : 'Register'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Table View */
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Company & Role</th>
                <th>Package (CTC)</th>
                <th>Eligibility Criteria</th>
                <th>Drive Date</th>
                <th>Deadline</th>
                <th>My Status</th>
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
                filteredDrives.map((drv) => {
                  const isEligible = (studentProfile.cgpa || 0) >= (drv.minCgpa || 0);
                  return (
                    <tr key={drv.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{drv.company}</div>
                        <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>{drv.role}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{drv.package}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{drv.tier}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem' }}>{drv.eligibility}</div>
                        <Badge variant={isEligible ? 'success' : 'danger'}>
                          {isEligible ? 'Eligible' : 'Ineligible'}
                        </Badge>
                      </td>
                      <td>{drv.driveDate}</td>
                      <td>{drv.deadline}</td>
                      <td>
                        <Badge variant={drv.isRegistered ? 'success' : 'neutral'}>
                          {drv.isRegistered ? 'Registered' : 'Not Registered'}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/drives/${drv.id}`)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PlacementDrivesPage;
