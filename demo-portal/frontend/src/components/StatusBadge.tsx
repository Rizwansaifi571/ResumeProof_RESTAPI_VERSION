export const StatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-slate-100 text-slate-800 border-slate-200';
  let label = status;

  if (status === 'received') {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
    label = 'Received';
  } else if (status === 'processing') {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Processing (AI)';
  } else if (status === 'verified') {
    color = 'bg-green-50 text-green-700 border-green-200';
    label = 'Verified & Passed';
  } else if (status === 'failed') {
    color = 'bg-red-50 text-red-700 border-red-200';
    label = 'Verification Failed';
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${color}`}>
      {label}
    </span>
  );
};
