import { useState } from 'react';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { DeviceSelector } from '../DeviceSelector/DeviceSelector';
import styles from './ControlsPanel.module.css';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step = 4, onChange }: SliderRowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <div className={styles.sliderRow}>
        <input
          className={styles.slider}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className={styles.rowValue}>{value}</span>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button className={styles.sectionToggle} onClick={() => setOpen(!open)}>
        <span className={styles.chevron}>{open ? '\u25BE' : '\u25B8'}</span>
        <span className={styles.sectionTitle}>{title}</span>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

export function ControlsPanel() {
  const { controls, setControl } = useLayoutStore();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Controls</span>
      </div>

      <div className={styles.body}>
        <Section title="Radii" defaultOpen>
          <SliderRow
            label="Outer Radius"
            value={controls.outerRadius}
            min={0}
            max={120}
            onChange={(v) => setControl('outerRadius', v)}
          />
          <SliderRow
            label="Inner Radius"
            value={controls.innerRadius}
            min={0}
            max={80}
            onChange={(v) => setControl('innerRadius', v)}
          />
          <SliderRow
            label="Connected Radius"
            value={controls.connectedRadius}
            min={0}
            max={80}
            onChange={(v) => setControl('connectedRadius', v)}
          />
        </Section>

        <Section title="Margins" defaultOpen>
          <SliderRow
            label="Margin"
            value={controls.margin}
            min={0}
            max={48}
            onChange={(v) => setControl('margin', v)}
          />
          <SliderRow
            label="Connected Margin"
            value={controls.connectedMargin}
            min={0}
            max={24}
            onChange={(v) => setControl('connectedMargin', v)}
          />
        </Section>

        <Section title="Device">
          <div className={styles.deviceRow}>
            <DeviceSelector />
          </div>
        </Section>
      </div>
    </div>
  );
}
