import React from 'react';
import { ExternalLink, Building2, MapPin } from 'lucide-react';
import Badge from './Badge';

export const CompanyCard = ({ company }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              backgroundColor: company.logoColor || '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}
          >
            {company.initials || company.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{company.name}</h4>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{company.industry}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          <MapPin size={14} />
          <span>{company.location}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Badge variant="primary">{company.tier}</Badge>
          <Badge variant="neutral">{company.studentsHired} Hired</Badge>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {company.drivesConducted} Drives Conducted
        </span>
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}
          >
            Careers <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
