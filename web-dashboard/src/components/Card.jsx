import React from 'react'

/**
 * Card Component
 * Base card for consistent styling across the application
 */
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`
        bg-white rounded-lg border border-neutral-200 shadow-sm
        hover:shadow-md transition-shadow duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card Header Component
 */
export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 border-b border-neutral-200 ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Body Component
 */
export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Footer Component
 */
export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * Metric Card Component
 * For displaying KPIs with icon, label, and value
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'positive',
  color = 'primary',
  className = '',
}) {
  const colorClasses = {
    primary: 'bg-gradient-primary',
    secondary: 'bg-gradient-secondary',
    accent: 'bg-gradient-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  }

  const changeColors = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-neutral-600',
  }

  return (
    <div className={`${colorClasses[color]} text-white rounded-lg p-6 shadow-lg ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white text-opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium mt-2 ${changeColors[changeType]}`}>
              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'} {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <Icon size={24} className="text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Status Badge Component
 */
export function StatusBadge({ status, label }) {
  const statusClasses = {
    healthy: 'bg-success bg-opacity-10 text-success border-success border-opacity-30',
    degraded: 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-30',
    critical: 'bg-error bg-opacity-10 text-error border-error border-opacity-30',
    inactive: 'bg-neutral-100 text-neutral-600 border-neutral-300',
  }

  const statusDots = {
    healthy: 'bg-success',
    degraded: 'bg-warning',
    critical: 'bg-error',
    inactive: 'bg-neutral-400',
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses[status]}`}>
      <span className={`w-2 h-2 rounded-full ${statusDots[status]}`}></span>
      {label}
    </span>
  )
}
