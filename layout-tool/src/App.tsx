import { GridSelector } from './components/GridSelector/GridSelector';
import { DeviceSelector } from './components/DeviceSelector/DeviceSelector';
import { Canvas } from './components/Canvas/Canvas';
import { SpecPanel } from './components/SpecPanel/SpecPanel';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="toolbar">
        <div className="toolbar-section">
          <GridSelector />
        </div>
        <div className="toolbar-section">
          <DeviceSelector />
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
