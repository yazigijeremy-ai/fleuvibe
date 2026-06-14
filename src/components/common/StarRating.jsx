import { useState } from 'react';

/**
 * @param {{ value: number, onChange?: (v: number) => void, readonly?: boolean }} props
 */
export function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            fontSize:   readonly ? '0.85rem' : '1.3rem',
            cursor:     readonly ? 'default' : 'pointer',
            color:      s <= (hover || value) ? '#f59e0b' : '#2a4a40',
            transition: 'color 0.15s',
          }}
        >★</span>
      ))}
    </div>
  );
}
