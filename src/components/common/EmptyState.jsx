import React from 'react';
import { FolderSearch } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records available.',
  description = '',
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-color)',
        margin: '16px 0'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12
        }}
      >
        <Icon size={24} />
      </div>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
        {title}
      </h4>
      {description ? (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: actionLabel ? 16 : 0 }}>
          {description}
        </p>
      ) : null}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} style={{ marginTop: 12 }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
