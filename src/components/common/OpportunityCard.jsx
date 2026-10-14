import React from 'react';
import { Calendar, MapPin, Briefcase, Award, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

export const OpportunityCard = ({
  title,
  company,
  packageOrStipend,
  location,
  deadline,
  eligibility,
  duration,
  skills = [],
  statusBadge,
  statusVariant = 'primary',
  isActionDone = false,
  actionLabel = 'Apply Now',
  doneLabel = 'Applied',
  onAction,
  onViewDetails,
  type = 'drive' // 'drive' | 'job' | 'internship'
}) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
    >
      <div>
        {/* Header: Company & Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 }}>
          <div>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {company}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2, lineHeight: 1.3 }}>
              {title}
            </h3>
          </div>
          {statusBadge && <Badge variant={statusVariant}>{statusBadge}</Badge>}
        </div>

        {/* Highlights: Package / Stipend & Location */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 14,
            padding: '10px 12px',
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {packageOrStipend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
              <Award size={15} color="var(--primary)" />
              <span>{packageOrStipend}</span>
            </div>
          )}
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
          {duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <Clock size={14} />
              <span>{duration}</span>
            </div>
          )}
        </div>

        {/* Eligibility or details */}
        {eligibility && (
          <div style={{ marginBottom: 12, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Eligibility: </span>
            {eligibility}
          </div>
        )}

        {/* Skills Tags */}
        {skills && skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  backgroundColor: '#f1f5f9',
                  color: 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500
                }}
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', alignSelf: 'center' }}>
                +{skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          {deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Calendar size={13} />
              <span>Deadline: <strong style={{ color: '#0f172a' }}>{deadline}</strong></span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewDetails}
              style={{ flex: 1 }}
            >
              Details
            </Button>
          )}
          {onAction && (
            <Button
              variant={isActionDone ? 'success' : 'primary'}
              size="sm"
              onClick={onAction}
              style={{ flex: 1.5 }}
              icon={isActionDone ? CheckCircle2 : ArrowRight}
              iconPosition={isActionDone ? 'left' : 'right'}
            >
              {isActionDone ? doneLabel : actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
