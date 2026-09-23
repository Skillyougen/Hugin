export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-surface-border bg-surface-card p-4 shadow-[0_8px_16px_-12px_rgba(16,24,38,.35)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
