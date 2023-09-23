import React from 'react';

export type TriangleSolidArrowProps = React.SVGProps<SVGSVGElement>
export function TriangleSolidArrow(props: TriangleSolidArrowProps) {
  const { style, ...reset } = props;
  const defaultStyle: React.CSSProperties = {
    cursor: 'pointer',
    height: '1em',
    width: '1em',
    userSelect: 'none',
    display: 'flex',
    ...style,
  };
  return (
    <svg
      viewBox="0 0 30 30"
      fill="var(--w-rjv-arrow-color, currentColor)"
      height="1em"
      width="1em"
      style={defaultStyle}
      {...reset}
    >
      <path d="M14.1758636,22.5690012 C14.3620957,22.8394807 14.6694712,23.001033 14.9978636,23.001033 C15.326256,23.001033 15.6336315,22.8394807 15.8198636,22.5690012 L24.8198636,9.56900125 C25.0322035,9.2633716 25.0570548,8.86504616 24.8843497,8.5353938 C24.7116447,8.20574144 24.3700159,7.99941506 23.9978636,8 L5.9978636,8 C5.62665,8.00153457 5.28670307,8.20817107 5.11443241,8.53699428 C4.94216175,8.86581748 4.96580065,9.26293681 5.1758636,9.56900125 L14.1758636,22.5690012 Z" />
    </svg>
  );
}

TriangleSolidArrow.displayName = 'JVR.TriangleSolidArrow';
