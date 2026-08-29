interface IconProps {
  size?: number;
}

export function IconSled({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M1 11h14M3 11l2-5h6l2 5M5 6l1-2h4l1 2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBear({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="10" r="4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function IconTrain({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="4" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 10v2M8 10v2M12 10v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="5" cy="8" r="0.8" fill="currentColor" />
      <circle cx="9" cy="8" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function IconElves({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="5.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="10.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2 13c0-2 1.5-3.5 3.5-3.5S9 11 9 13M7 13c0-2 1.5-3.5 3.5-3.5S14 11 14 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
