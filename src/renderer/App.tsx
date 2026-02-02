import { useEffect } from 'react';
import { useStore } from './store/useStore';
import TranslateView from './components/TranslateView';
import BatchView from './components/BatchView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import Sidebar from './components/Sidebar';
import ErrorAlert from './components/ErrorAlert';

function App() {
  const { currentView, loadConfig, loadHistory, darkMode } = useStore();

  useEffect(() => {
    loadConfig();
    loadHistory();
  }, [loadConfig, loadHistory]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ErrorAlert />
        <div className="h-full overflow-y-auto">
          {currentView === 'translate' && <TranslateView />}
          {currentView === 'batch' && <BatchView />}
          {currentView === 'history' && <HistoryView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

export default App;
