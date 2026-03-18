import { useLayoutStore } from './hooks/useLayoutStore';
import { Canvas } from './components/Canvas/Canvas';
import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
import { SpecPanel } from './components/SpecPanel/SpecPanel';
import './App.css';

function App() {
  const resetTree = useLayoutStore((s) => s.resetTree);
  const showFineGrid = useLayoutStore((s) => s.showFineGrid);
  const showCoarseGrid = useLayoutStore((s) => s.showCoarseGrid);
  const toggleFineGrid = useLayoutStore((s) => s.toggleFineGrid);
  const toggleCoarseGrid = useLayoutStore((s) => s.toggleCoarseGrid);
  const snapEnabled = useLayoutStore((s) => s.snapEnabled);
  const toggleSnap = useLayoutStore((s) => s.toggleSnap);

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
            className={`toolbarBtn ${showFineGrid ? 'active' : ''}`}
            onClick={toggleFineGrid}
            title={showFineGrid ? '6/12px Grid On' : '6/12px Grid Off'}
          >
            <span className="material-symbols-outlined toolbarIcon">grid_on</span>
            <span className="toolbarLabel">6px</span>
          </button>

          <button
            className={`toolbarBtn ${showCoarseGrid ? 'active' : ''}`}
            onClick={toggleCoarseGrid}
            title={showCoarseGrid ? '36px Grid On' : '36px Grid Off'}
          >
            <span className="material-symbols-outlined toolbarIcon">grid_4x4</span>
            <span className="toolbarLabel">36px</span>
          </button>

          <button
            className={`toolbarBtn ${snapEnabled ? 'active' : ''}`}
            onClick={toggleSnap}
            title={snapEnabled ? 'Snap On (12px)' : 'Snap Off'}
          >
            <span className="material-symbols-outlined toolbarIcon">magnet</span>
            <span className="toolbarLabel">Snap</span>
          </button>

          <button className="toolbarBtn" onClick={resetTree} title="Reset">
            <span className="material-symbols-outlined toolbarIcon">restart_alt</span>
            <span className="toolbarLabel">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
