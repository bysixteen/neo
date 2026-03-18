import { GridSelector } from './components/GridSelector/GridSelector';
import { DeviceSelector } from './components/DeviceSelector/DeviceSelector';
import { Canvas } from './components/Canvas/Canvas';
import { SpecPanel } from './components/SpecPanel/SpecPanel';
import { useLayoutStore } from './hooks/useLayoutStore';
import './App.css';

function App() {
  const { edges, setAllConnected } = useLayoutStore();
  const allConnected = edges.length > 0 && edges.every((e) => e.connected);

  return (
    <div className="app">
      <header className="toolbar">
        <div className="toolbar-section">
          <GridSelector />
        </div>
        <div className="toolbar-section">
          <DeviceSelector />
        </div>
        <div className="toolbar-section toolbar-actions">
          <button
            className={`action-btn ${allConnected ? 'active' : ''}`}
            onClick={() => setAllConnected(!allConnected)}
          >
            {allConnected ? 'Disconnect All' : 'Connect All'}
          </button>
        </div>
      </header>

      <main className="workspace">
        <Canvas />
        <SpecPanel />
      </main>
    </div>
  );
}

export default App;
