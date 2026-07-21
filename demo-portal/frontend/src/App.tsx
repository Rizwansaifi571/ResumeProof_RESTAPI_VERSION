import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { ApplySuccessPage } from './pages/ApplySuccessPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white shadow-md py-4 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold tracking-tight">KRMU Placement Portal</Link>
          <nav className="text-sm font-medium text-slate-300 flex items-center space-x-6">
            <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
            <Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow bg-slate-50">
        <Routes>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/success" element={<ApplySuccessPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </main>

      <footer className="bg-slate-900 py-6 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} KRMU Placement Cell. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
