/**
 * @param {{ children: React.ReactNode, onClick?: () => void, ariaLabel?: string, disabled?: boolean, variant?: 'primary'|'secondary'|'ghost', style?: React.CSSProperties, className?: string }} props
 */
export function Button({ children, onClick, ariaLabel, disabled, variant = 'primary', style, className }) {
  const base = {
    cursor:  disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ ...base, ...style }}
      className={className}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); onClick?.(); } }}
    >
      {children}
    </button>
  );
}
