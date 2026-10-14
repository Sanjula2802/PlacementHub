import React from 'react';
import { Award, Calendar, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export const CertificationsPage = () => {
  const { certifications, registerCertification } = usePlacement();

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Registered': return 'primary';
      default: return 'warning';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Industry Certifications & Global Badges</h1>
        </div>
      </div>

      {certifications.length === 0 ? (
        <EmptyState title="No records available." />
      ) : (
        <div className="grid-2">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {cert.provider}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                      {cert.name}
                    </h3>
                  </div>
                  <Badge variant={getStatusVariant(cert.status)}>{cert.status}</Badge>
                </div>

                {cert.voucherDiscount && (
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 12
                    }}
                  >
                    <Tag size={14} />
                    <span>{cert.voucherDiscount}</span>
                  </div>
                )}

                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
                  {cert.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={14} /> Exam Date: <strong>{cert.examDate}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    Registration Deadline: <strong>{cert.deadline}</strong>
                  </span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.78125rem', color: 'var(--text-light)' }}>
                  {cert.enrolledCount ? `${cert.enrolledCount} Students Enrolled` : null}
                </span>

                {cert.status === 'Completed' ? (
                  <Button variant="success" size="sm" disabled icon={CheckCircle2}>
                    Verified by College
                  </Button>
                ) : (
                  <Button
                    variant={cert.status === 'Registered' ? 'outline-danger' : 'primary'}
                    size="sm"
                    onClick={() => registerCertification(cert.id)}
                  >
                    {cert.status === 'Registered' ? 'Cancel Voucher' : 'Register for Certification'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificationsPage;
