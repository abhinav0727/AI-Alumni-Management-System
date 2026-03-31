/**
 * Card – a white rounded container with optional accent colour.
 *
 * Props:
 *   title    – label above the value
 *   value    – main large number/text
 *   subtitle – small description below value
 *   accent   – Tailwind border-l colour class (default: border-primary-500)
 *   icon     – optional JSX icon element
 */
export default function Card({ title, value, subtitle, accent = 'border-primary-500', icon }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${accent} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-800">{value ?? '—'}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
