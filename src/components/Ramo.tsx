export function Ramo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" stroke="currentColor"
         strokeWidth="1" strokeLinecap="round" aria-hidden>
      <path d="M4 22 C30 8 62 34 116 16" />
      <path d="M26 15 q-6 -10 2 -12 q6 4 -2 12z" />
      <path d="M48 24 q-4 10 4 12 q6 -4 -4 -12z" />
      <path d="M72 24 q-6 -9 2 -12 q6 4 -2 12z" />
      <path d="M94 17 q-3 10 5 11 q5 -5 -5 -11z" />
      <circle cx="116" cy="16" r="2" />
    </svg>
  )
}