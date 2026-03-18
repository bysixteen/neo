import { useLayoutStore } from './hooks/useLayoutStore';
import { Canvas } from './components/Canvas/Canvas';
import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
import { SpecPanel } from './components/SpecPanel/SpecPanel';
import './App.css';

function GridIcon6() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="4" y1="0" x2="4" y2="16" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1" />
      <line x1="12" y1="0" x2="12" y2="16" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function GridIcon36() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

function SnapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

function App() {
  const resetTree = useLayoutStore((s) => s.resetTree);
  const grid = useLayoutStore((s) => s.grid);
  const cycleGrid = useLayoutStore((s) => s.cycleGrid);
  const snapEnabled = useLayoutStore((s) => s.snapEnabled);
  const toggleSnap = useLayoutStore((s) => s.toggleSnap);

  const gridLabel = grid === 'off' ? 'Grid Off' : grid === 'fine' ? '6px Grid' : '36px Grid';

  return (
    <div className="app">
      {/* Title */}
      <div className="topBar">
        <span className="title">Neo</span>
      </div>

      {/* Canvas — 1:1 pixel, scrollable */}
      <div className="canvasArea">
        <Canvas />
      </div>

      {/* Floating controls overlay — right side */}
      <ControlsPanel />

      {/* Floating spec overlay — left side */}
      <SpecPanel />

      {/* Bottom toolbar */}
      <div className="bottomBar">
        <span className="hint">Double-click to merge &middot; Drag dividers to resize</span>

        <div className="toolbarActions">
          <button
            className={`toolbarBtn ${grid !== 'off' ? 'active' : ''}`}
            onClick={cycleGrid}
            title={gridLabel}
          >
            {grid === 'coarse' ? <GridIcon36 /> : <GridIcon6 />}
            <span className="toolbarLabel">{gridLabel}</span>
          </button>

          <button
            className={`toolbarBtn ${snapEnabled ? 'active' : ''}`}
            onClick={toggleSnap}
            title={snapEnabled ? 'Snap On' : 'Snap Off'}
          >
            <SnapIcon />
            <span className="toolbarLabel">{snapEnabled ? 'Snap On' : 'Snap Off'}</span>
          </button>

          <button className="toolbarBtn" onClick={resetTree} title="Reset">
            <span className="toolbarLabel">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
