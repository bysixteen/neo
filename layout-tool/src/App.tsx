import { useLayoutStore } from './hooks/useLayoutStore';
import { Canvas } from './components/Canvas/Canvas';
import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
import { SpecPanel } from './components/SpecPanel/SpecPanel';
import './App.css';

function App() {
  const resetTree = useLayoutStore((s) => s.resetTree);

  return (
    <div className="app">
      {/* Title */}
      <div className="topBar">
        <span className="title">Fragment Layout Tool</span>
      </div>

      {/* Canvas — 1:1 pixel, scrollable */}
      <div className="canvasArea">
        <Canvas />
      </div>

      {/* Floating controls overlay — right side */}
      <ControlsPanel />

      {/* Floating spec overlay — left side */}
      <SpecPanel />

      {/* Bottom hint bar */}
      <div className="bottomBar">
        <span className="hint">Click to split &middot; Double-click to merge &middot; Drag dividers to resize</span>
      </div>

      <button className="resetBtn" onClick={resetTree}>Reset</button>
    </div>
  );
}

export default App;
