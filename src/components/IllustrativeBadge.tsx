import type { CSSProperties } from 'react';

// Marks content that is an illustrative example rather than a real fact or review.
// Same shape on every site; it takes its colour from the surrounding text.
const style: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 8px',
  borderRadius: 999,
  border: '1px solid currentColor',
  fontSize: 10,
  lineHeight: 1.4,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
};

export default function IllustrativeBadge({ label = 'Illustrative example', className }: { label?: string; className?: string }) {
  return (
    <span style={style} className={className} data-illustrative="true">
      {label}
    </span>
  );
}
