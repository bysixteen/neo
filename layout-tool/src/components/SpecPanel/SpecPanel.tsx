import { useLayoutStore } from '../../hooks/useLayoutStore';
import { getSlotConnectedEdges } from '../../utils/gridToSlots';
import { calculateRadii, getPositionMode } from '../../utils/calculateRadii';
import { semanticRadii } from '../../data/tokens';
import styles from './SpecPanel.module.css';

function radiiTokenName(value: number): string {
  if (value === semanticRadii.large) return 'radii/large';
  if (value === semanticRadii.connected) return 'radii/connected';
  return `${value}px`;
}

export function SpecPanel() {
  const { slots, edges, colWidths, rowHeights, device } = useLayoutStore();

  const connectedCount = edges.filter((e) => e.connected).length;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Spec</h3>
        <span className={styles.meta}>
          {device.codename} — {device.canvas.width}×{device.canvas.height}
        </span>
      </div>

      <div className={styles.groupSpec}>
        <div className={styles.row}>
          <span className={styles.prop}>Connected edges</span>
          <span className={styles.values}>{connectedCount}/{edges.length}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.prop}>Chrome</span>
          <span className={styles.values}>
            {device.chrome.headerHeight}px header · {device.chrome.utilityBarHeight}px utility
          </span>
        </div>
      </div>

      <div className={styles.slots}>
        {slots.map((slot) => {
          const connectedEdges = getSlotConnectedEdges(slot.id, edges);
          const radii = calculateRadii(connectedEdges);
          const mode = getPositionMode(connectedEdges);
          const w = colWidths[slot.col] ?? 0;
          const h = rowHeights[slot.row] ?? 0;

          return (
            <div key={slot.id} className={styles.slotSpec}>
              <div className={styles.slotHeader}>
                <span className={styles.slotLabel}>{slot.label}</span>
                <span className={styles.slotMode}>{mode}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.prop}>Size</span>
                <span className={styles.values}>{w} × {h}px</span>
              </div>

              <div className={styles.row}>
                <span className={styles.prop}>Radii TL/TR/BR/BL</span>
                <span className={styles.values}>
                  {radii.tl}/{radii.tr}/{radii.br}/{radii.bl}
                </span>
                <span className={styles.tokens}>
                  {radiiTokenName(radii.tl)} · {radiiTokenName(radii.br)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
