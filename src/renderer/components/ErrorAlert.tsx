import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

export default function ErrorAlert() {
  const { error, setError } = useStore();

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 left-20 z-50 fade-in">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
        <p className="flex-1">{error}</p>
        <button
          onClick={() => setError(null)}
          className="ml-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
