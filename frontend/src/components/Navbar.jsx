export default function Navbar({ title, subtitle }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-700 leading-none">{user.name || 'Student'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{user.email || ''}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary-700">
            {(user.name || 'S').charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
