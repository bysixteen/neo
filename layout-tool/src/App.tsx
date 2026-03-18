import { DeviceSelector } from './components/DeviceSelector/DeviceSelector';
import { Canvas } from './components/Canvas/Canvas';
import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
import { SpecPanel } from './components/SpecPanel/SpecPanel';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="toolbar">
        <div className="toolbar-section">
          <DeviceSelector />
        </div>
        <div className="toolbar-section toolbar-hint">
          Click panel to split / Double-click to merge
        </div>
      </header>

      <main className="workspace">
        <ControlsPanel />
        <Canvas />
        <SpecPanel />
      </main>
    </div>
  );
}

export default App;
