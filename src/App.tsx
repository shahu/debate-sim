import { DebateDashboard } from './components/DebateDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            CPDL Debate Simulator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Canadian Parliamentary Debate Practice
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DebateDashboard />
      </main>
    </div>
  );
}

export default App;
