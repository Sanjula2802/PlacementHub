import React from 'react';
import { Filter } from 'lucide-react';

export const FilterDropdown = ({
  label,
  value,
  onChange,
  options = [],
  icon: Icon = Filter,
  style = {}
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...style }}>
      {label && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {label}:
        </span>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <Icon
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
        )}
        <select
          className="form-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            paddingLeft: Icon ? 30 : 12,
            paddingRight: 28,
            height: 40,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterDropdown;
