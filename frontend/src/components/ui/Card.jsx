export default function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag
      className={`rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
