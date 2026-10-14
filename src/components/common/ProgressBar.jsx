import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  height = 8,
  customColor,
  colorThreshold = true
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  let fillColor = customColor;
  if (!fillColor && colorThreshold) {
    if (percentage >= 75) fillColor = 'var(--success)';
    else if (percentage >= 60) fillColor = 'var(--warning)';
    else fillColor = 'var(--danger)';
  } else if (!fillColor) {
    fillColor = 'var(--primary)';
  }

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
          {label && <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{label}</span>}
          {showPercentage && (
            <span style={{ fontWeight: 600, color: fillColor }}>{percentage}%</span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          backgroundColor: '#e2e8f0',
          borderRadius: 999,
          height: `${height}px`,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: fillColor,
            height: '100%',
            borderRadius: 999,
            transition: 'width 0.4s ease-in-out'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
