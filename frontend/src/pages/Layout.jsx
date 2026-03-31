import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

/**
 * Layout wraps all authenticated pages.
 * Sidebar is fixed; content scrolls freely in the main area.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      {/* Offset content by sidebar width (w-60 = 240px) */}
      <main className="flex-1 ml-60 min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
