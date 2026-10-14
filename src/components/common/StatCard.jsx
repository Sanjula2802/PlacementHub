import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  color = 'primary',
  onClick
}) => {
  const colorMap = {
    primary: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    success: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    warning: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    info: { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
    purple: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' }
  };

  const theme = colorMap[color] || colorMap.primary;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
            {title}
          </p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: theme.bg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {trend && (
            <span
              style={{
                fontWeight: 600,
                color: trendType === 'up' ? 'var(--success)' : trendType === 'down' ? 'var(--danger)' : 'var(--text-muted)'
              }}
            >
              {trend}
            </span>
          )}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
