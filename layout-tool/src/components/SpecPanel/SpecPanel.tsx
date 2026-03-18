import { useLayoutStore } from '../../hooks/useLayoutStore';
import { getSlotConnectedEdges } from '../../utils/gridToSlots';
import { calculateRadii, getPositionMode } from '../../utils/calculateRadii';
import { calculateGap, gapTokenName } from '../../utils/calculatePadding';
import { semanticRadii } from '../../data/tokens';
import styles from './SpecPanel.module.css';

function radiiTokenName(value: number): string {
  if (value === semanticRadii.large) return 'radii/large';
  if (value === semanticRadii.connected) return 'radii/connected';
  return `${value}px`;
}

export function SpecPanel() {
  const { slots, cols, rows, edges, device } = useLayoutStore();

  const anyConnected = edges.some((e) => e.connected);
  const connectedCount = edges.filter((e) => e.connected).length;
  const gap = calculateGap(anyConnected);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Spec</h3>
        <span className={styles.meta}>
          {cols}×{rows} on {device.codename} ({device.canvas.width}×{device.canvas.height})
        </span>
      </div>

      <div className={styles.groupSpec}>
        <div className={styles.row}>
          <span className={styles.prop}>Group gap</span>
          <span className={styles.values}>{gap}px</span>
          <span className={styles.tokens}>{gapTokenName(anyConnected)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.prop}>Connected edges</span>
          <span className={styles.values}>
            {connectedCount}/{edges.length}
          </span>
        </div>
      </div>

      <div className={styles.slots}>
        {slots.map((slot) => {
          const connectedEdges = getSlotConnectedEdges(slot.id, edges);
          const radii = calculateRadii(connectedEdges);
          const mode = getPositionMode(connectedEdges);

          return (
            <div key={slot.id} className={styles.slotSpec}>
              <div className={styles.slotHeader}>
                <span className={styles.slotLabel}>{slot.label}</span>
                <span className={styles.slotMode}>{mode}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.prop}>Radii (TL/TR/BR/BL)</span>
                <span className={styles.values}>
                  {radii.tl}/{radii.tr}/{radii.br}/{radii.bl}
                </span>
                <span className={styles.tokens}>
                  {radiiTokenName(radii.tl)}, {radiiTokenName(radii.tr)}, {radiiTokenName(radii.br)}, {radiiTokenName(radii.bl)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
