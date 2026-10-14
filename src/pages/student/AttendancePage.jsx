import React from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export const AttendancePage = () => {
  const { attendanceSummary, studentProfile } = usePlacement();
  const overall = attendanceSummary.overallPercentage || 0;
  const isEligible = overall >= attendanceSummary.minimumRequired;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Placement Training Attendance</h1>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div
        className="card"
        style={{
          padding: '28px',
          marginBottom: 24,
          backgroundColor: '#ffffff',
          borderLeft: `6px solid ${isEligible ? 'var(--success)' : 'var(--primary)'}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Visual Circular Gauge */}
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-main)',
                border: `6px solid ${isEligible ? 'var(--success)' : 'var(--border-color)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {overall}%
              </span>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                OVERALL
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <CheckCircle2 size={20} color={isEligible ? 'var(--success)' : 'var(--text-muted)'} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {attendanceSummary.status || 'No records available.'}
                </h3>
              </div>
              {studentProfile.id && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Student ID: {studentProfile.id}
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Minimum Required
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {attendanceSummary.minimumRequired}%
            </div>
          </div>
        </div>
      </div>

      {/* Module-wise Breakdown Cards */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>
          Module Performance Breakdown
        </h3>

        {!attendanceSummary.categories || attendanceSummary.categories.length === 0 ? (
          <EmptyState title="No records available." description="" />
        ) : (
          <div className="grid-2">
            {attendanceSummary.categories.map((cat) => (
              <div
                key={cat.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{cat.name}</h4>
                      {cat.faculty && <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Lead: {cat.faculty}</span>}
                    </div>
                    <Badge variant={cat.percentage >= 75 ? 'success' : 'danger'}>
                      {cat.status}
                    </Badge>
                  </div>

                  <div style={{ margin: '14px 0' }}>
                    <ProgressBar
                      value={cat.percentage}
                      label={`Attended ${cat.attended} of ${cat.total} Sessions`}
                      showPercentage={true}
                      height={9}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: 10,
                    fontSize: '0.78125rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span>Sessions Attended: <strong>{cat.attended}</strong></span>
                  <span>Absent: <strong>{cat.total - cat.attended}</strong></span>
                  <span>Total Scheduled: <strong>{cat.total}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions Attendance Log Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <CalendarCheck size={18} color="var(--primary)" />
            Recent Session Log
          </h3>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Session Topic</th>
                <th>Training Category</th>
                <th>Date & Time</th>
                <th>Instructor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!attendanceSummary.recentSessions || attendanceSummary.recentSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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
                attendanceSummary.recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td style={{ fontWeight: 600 }}>{session.topic}</td>
                    <td>
                      <Badge variant="neutral">{session.category}</Badge>
                    </td>
                    <td>
                      <div>{session.date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{session.time}</div>
                    </td>
                    <td>{session.faculty}</td>
                    <td>
                      <Badge variant={session.status === 'Present' ? 'success' : 'danger'}>
                        {session.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
