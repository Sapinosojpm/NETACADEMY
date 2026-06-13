import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function SwitchIcon({ size = 48, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer switch box */}
      <rect x="4" y="14" width="40" height="20" rx="3" fill="currentColor" fillOpacity="0.1" />
      {/* Double arrows top (left to right, right to left) */}
      <path d="M12 20h10M22 20l-3-3M12 20l3 3" />
      <path d="M36 20H26M26 20l3-3M36 20l-3 3" />
      {/* Double arrows bottom */}
      <path d="M26 28h10M26 28l3-3M36 28l-3 3" />
      <path d="M22 28H12M22 28l-3-3M12 28l3 3" />
      {/* Vertical port indicators */}
      <rect x="8" y="23" width="2" height="2" fill="currentColor" />
      <rect x="38" y="23" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

export function HubIcon({ size = 48, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer hub box */}
      <rect x="4" y="14" width="40" height="20" rx="3" fill="currentColor" fillOpacity="0.1" />
      {/* Single shared bus arrow going everywhere */}
      <path d="M12 24h24" />
      <path d="M24 16v16" />
      {/* Arrows pointing outward at ends */}
      <path d="M12 24l3-3M12 24l3 3" />
      <path d="M36 24l-3-3M36 24l-3 3" />
      <path d="M24 16l-3 3M24 16l3 3" />
      <path d="M24 32l-3-3M24 32l3 3" />
    </svg>
  );
}

export function BridgeIcon({ size = 48, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Two segments connected by an arch bridge */}
      {/* Left segment node */}
      <circle cx="10" cy="28" r="4" fill="currentColor" fillOpacity="0.1" />
      {/* Right segment node */}
      <circle cx="38" cy="28" r="4" fill="currentColor" fillOpacity="0.1" />
      {/* Bridge structure */}
      <path d="M10 28h8c4-12 12-12 16 0h4" />
      <path d="M16 28h16" />
      {/* Divider in the middle representing filtering */}
      <path d="M24 20v10" strokeDasharray="3 2" />
    </svg>
  );
}

export function RouterIcon({ size = 48, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      {...props}
    >
      {/* Cylindrical router disk */}
      <ellipse cx="24" cy="24" rx="20" ry="10" fill="currentColor" fillOpacity="0.1" />
      {/* Arrows in 4 directions */}
      <path d="M16 24h16M24 18v12" strokeLinecap="round" strokeLinejoin="round" />
      {/* Arrowheads pointing out and in */}
      <path d="M16 24l3-3M32 24l-3 3M24 18l-3 3M24 30l3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PCIcon({ size = 48, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Monitor screen */}
      <rect x="6" y="8" width="36" height="24" rx="3" fill="currentColor" fillOpacity="0.05" />
      {/* Screen inner details */}
      <path d="M10 12h28v16H10z" fill="currentColor" fillOpacity="0.1" />
      {/* Stand */}
      <path d="M20 32l-3 8h14l-3-8" />
      {/* Base */}
      <path d="M14 40h20" />
    </svg>
  );
}

export function CollisionIcon({ size = 48, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Explosion/Lightning shape */}
      <path
        d="M24 4 L28 16 L40 12 L30 24 L42 32 L26 30 L28 44 L18 30 L6 34 L16 22 L4 16 L18 16 Z"
        fill="currentColor"
        fillOpacity="0.2"
        className="animate-pulse"
      />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  );
}
