import { useMemo } from 'react';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { getSlotConnectedEdges } from '../../utils/gridToSlots';
import type { Edge } from '../../utils/gridToSlots';
import { calculateRadii, getPositionMode } from '../../utils/calculateRadii';
import { calculateGap } from '../../utils/calculatePadding';
import { FragmentSlot } from '../FragmentSlot/FragmentSlot';
import { ConnectivityToggle } from '../ConnectivityToggle/ConnectivityToggle';
import styles from './Canvas.module.css';

const CANVAS_PADDING = 40;

function getEdgePosition(
  edge: Edge,
  slotW: number,
  slotH: number,
  gap: number,
): { left: number; top: number } {
  // slotA id format: 'slot-{row}-{col}'
  const parts = edge.slotA.split('-');
  const row = parseInt(parts[1]);
  const col = parseInt(parts[2]);

  if (edge.axis === 'horizontal') {
    return {
      left: (col + 1) * (slotW + gap) - gap / 2,
      top: row * (slotH + gap) + slotH / 2,
    };
  } else {
    return {
      left: col * (slotW + gap) + slotW / 2,
      top: (row + 1) * (slotH + gap) - gap / 2,
    };
  }
}

export function Canvas() {
  const { slots, cols, rows, edges, device, setEdgeConnected } = useLayoutStore();

  const viewportWidth = 800;

  const scale = useMemo(() => {
    const maxWidth = viewportWidth - CANVAS_PADDING * 2;
    return Math.min(1, maxWidth / device.canvas.width);
  }, [device.canvas.width]);

  const scaledW = device.canvas.width * scale;
  const scaledH = device.canvas.height * scale;

  const anyConnected = edges.some((e) => e.connected);
  const gap = calculateGap(anyConnected) * scale;

  const slotW = (scaledW - (cols - 1) * gap) / cols;
  const slotH = (scaledH - (rows - 1) * gap) / rows;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.deviceFrame}
        style={{ width: scaledW, height: scaledH }}
      >
        <div className={styles.deviceLabel}>
          {device.codename} — {device.canvas.width} × {device.canvas.height}
        </div>

        <div
          className={styles.canvas}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: `${gap}px`,
            width: '100%',
            height: '100%',
          }}
        >
          {slots.map((slot) => {
            const connectedEdges = getSlotConnectedEdges(slot.id, edges);
            const radii = calculateRadii(connectedEdges);
            const mode = getPositionMode(connectedEdges);

            const scaledRadii = {
              tl: radii.tl * scale,
              tr: radii.tr * scale,
              bl: radii.bl * scale,
              br: radii.br * scale,
            };

            return (
              <FragmentSlot
                key={slot.id}
                slot={slot}
                radii={scaledRadii}
                positionMode={mode}
              />
            );
          })}

          {/* Edge connectivity toggles — absolutely positioned over the grid gaps */}
          <div className={styles.edgeOverlay}>
            {edges.map((edge) => {
              const pos = getEdgePosition(edge, slotW, slotH, gap);
              return (
                <ConnectivityToggle
                  key={edge.id}
                  edge={edge}
                  onToggle={(id) => setEdgeConnected(id, !edge.connected)}
                  style={{ left: pos.left, top: pos.top }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
