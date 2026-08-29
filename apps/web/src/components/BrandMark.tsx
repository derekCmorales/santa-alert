export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="36" height="36" rx="8" fill="#e41a2a" />
      <path
        d="M10 24V12h4.2c2.4 0 3.9 1.2 3.9 3 0 1.3-.7 2.3-1.9 2.8 1.5.4 2.4 1.5 2.4 3.2 0 2.2-1.6 3-4.1 3H10zm2.2-7.8h1.8c1.1 0 1.7-.5 1.7-1.4 0-.9-.6-1.3-1.7-1.3h-1.8v2.7zm0 5.8h2c1.2 0 1.9-.5 1.9-1.5 0-1-.7-1.5-1.9-1.5h-2v3zM20.2 24V12h5.8v1.9h-3.6v3.1h3.2v1.9h-3.2v3.2h3.7V24h-5.9z"
        fill="#ffffff"
      />
    </svg>
  );
}
