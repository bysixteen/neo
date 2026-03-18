import { useLayoutStore, type LayoutControls } from '../../hooks/useLayoutStore';
import styles from './ControlsPanel.module.css';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step = 4, unit = 'px', onChange }: SliderRowProps) {
  return (
    <div className={styles.row}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={styles.value}>{value}{unit}</span>
    </div>
  );
}

export function ControlsPanel() {
  const { controls, setControl, resetTree } = useLayoutStore();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Controls</h3>
        <button className={styles.reset} onClick={resetTree} title="Reset to single panel">
          Reset
        </button>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Radius</span>
        <SliderRow
          label="Outer"
          value={controls.outerRadius}
          min={0}
          max={120}
          onChange={(v) => setControl('outerRadius', v)}
        />
        <SliderRow
          label="Inner"
          value={controls.innerRadius}
          min={0}
          max={80}
          onChange={(v) => setControl('innerRadius', v)}
        />
        <SliderRow
          label="Connected"
          value={controls.connectedRadius}
          min={0}
          max={80}
          onChange={(v) => setControl('connectedRadius', v)}
        />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Gap</span>
        <SliderRow
          label="Margin"
          value={controls.margin}
          min={0}
          max={48}
          onChange={(v) => setControl('margin', v)}
        />
        <SliderRow
          label="Connected"
          value={controls.connectedMargin}
          min={0}
          max={24}
          onChange={(v) => setControl('connectedMargin', v)}
        />
      </div>
    </div>
  );
}
