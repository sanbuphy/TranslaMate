import { useStore } from '../store/useStore';
import { Languages, History, Settings, Moon, Sun, Files } from 'lucide-react';

export default function Sidebar() {
  const { currentView, setCurrentView, darkMode, toggleDarkMode } = useStore();

  const menuItems = [
    { id: 'translate', icon: Languages, label: 'Translate' },
    { id: 'batch', icon: Files, label: 'Batch' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <aside className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-600">TM</h1>
      </div>

      <nav className="flex-1 space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
                ${isActive
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              title={item.label}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </nav>

      <button
        onClick={toggleDarkMode}
        className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        title={darkMode ? 'Light Mode' : 'Dark Mode'}
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </aside>
  );
}
