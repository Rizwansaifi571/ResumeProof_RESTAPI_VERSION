import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const ApplySuccessPage = () => {
  const location = useLocation();
  const jobTitle = location.state?.jobTitle;

  if (!jobTitle) {
    return <Navigate to="/jobs" replace />;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-lg shadow-sm border border-slate-200 text-center max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
        <p className="text-slate-600 mb-8">
          Thank you for applying for the <strong>{jobTitle}</strong> position. We've received your application and will review it shortly.
        </p>
        <Link 
          to="/jobs"
          className="bg-blue-600 text-white py-3 px-6 rounded-md font-bold hover:bg-blue-700 transition-colors inline-block w-full"
        >
          Return to Jobs
        </Link>
      </div>
    </div>
  );
};
