import { useRef, useMemo } from 'react';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { getSlotConnectedEdges } from '../../utils/gridToSlots';
import type { Edge } from '../../utils/gridToSlots';
import { calculateRadii, getPositionMode } from '../../utils/calculateRadii';
import { spacing } from '../../data/tokens';
import { FragmentSlot } from '../FragmentSlot/FragmentSlot';
import { ConnectivityToggle } from '../ConnectivityToggle/ConnectivityToggle';
import styles from './Canvas.module.css';

const GAP = spacing.connected; // 8px
const MIN_SLOT_PX = 108;
const VIEWPORT_WIDTH = 800;
const CANVAS_PADDING = 40;

interface DragState {
  type: 'col' | 'row';
  index: number;
  startClient: number;
  startA: number;
  startB: number;
}

/** Build prefix-sum left/top positions for each column/row at given scale */
function buildPositions(sizes: number[], scale: number, gap: number): number[] {
  const positions: number[] = [];
  let cursor = 0;
  for (let i = 0; i < sizes.length; i++) {
    positions.push(cursor);
    cursor += sizes[i] * scale + gap;
  }
  return positions;
}

/** Extract row and col from slot id format 'slot-{row}-{col}' */
function parseSlotId(slotId: string): { row: number; col: number } {
  const parts = slotId.split('-');
  return { row: parseInt(parts[1]), col: parseInt(parts[2]) };
}

function getEdgeTogglePosition(
  edge: Edge,
  colLefts: number[],
  rowTops: number[],
  colWidths: number[],
  rowHeights: number[],
  scale: number,
  gap: number,
): { left: number; top: number } {
  const { row, col } = parseSlotId(edge.slotA);
  if (edge.axis === 'horizontal') {
    return {
      left: colLefts[col] + colWidths[col] * scale + gap / 2,
      top: rowTops[row] + (rowHeights[row] * scale) / 2,
    };
  } else {
    return {
      left: colLefts[col] + (colWidths[col] * scale) / 2,
      top: rowTops[row] + rowHeights[row] * scale + gap / 2,
    };
  }
}

export function Canvas() {
  const {
    slots, cols, rows, edges, device,
    colWidths, rowHeights,
    setColWidth, setRowHeight, setEdgeConnected,
  } = useLayoutStore();

  const drag = useRef<DragState | null>(null);

  const scale = useMemo(() => {
    const maxWidth = VIEWPORT_WIDTH - CANVAS_PADDING * 2;
    return Math.min(1, maxWidth / device.canvas.width);
  }, [device.canvas.width]);

  const scaledDeviceW = device.canvas.width * scale;
  const scaledDeviceH = device.canvas.height * scale;
  const scaledHeaderH = device.chrome.headerHeight * scale;
  const scaledUtilityH = device.chrome.utilityBarHeight * scale;
  const scaledContentH = scaledDeviceH - scaledHeaderH - scaledUtilityH;

  const gap = GAP * scale;

  const colLefts = useMemo(
    () => buildPositions(colWidths, scale, gap),
    [colWidths, scale, gap],
  );
  const rowTops = useMemo(
    () => buildPositions(rowHeights, scale, gap),
    [rowHeights, scale, gap],
  );

  // Drag handlers — pointer capture keeps events on the divider element
  function handleDividerPointerDown(
    e: React.PointerEvent<HTMLDivElement>,
    type: 'col' | 'row',
    index: number,
  ) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      type,
      index,
      startClient: type === 'col' ? e.clientX : e.clientY,
      startA: type === 'col' ? colWidths[index] : rowHeights[index],
      startB: type === 'col' ? colWidths[index + 1] : rowHeights[index + 1],
    };
  }

  function handleDividerPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const { type, index, startClient, startA, startB } = drag.current;
    const clientDelta = type === 'col'
      ? e.clientX - startClient
      : e.clientY - startClient;
    const rawDelta = clientDelta / scale;
    const total = startA + startB;
    const rawNewA = startA + rawDelta;
    const snapped = Math.round(rawNewA / 12) * 12;
    const clampedA = Math.max(MIN_SLOT_PX, Math.min(total - MIN_SLOT_PX, snapped));
    const clampedB = total - clampedA;
    if (type === 'col') {
      setColWidth(index, clampedA);
      setColWidth(index + 1, clampedB);
    } else {
      setRowHeight(index, clampedA);
      setRowHeight(index + 1, clampedB);
    }
  }

  function handleDividerPointerUp() {
    drag.current = null;
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.deviceFrame}
        style={{ width: scaledDeviceW, height: scaledDeviceH }}
      >
        <div className={styles.deviceLabel}>
          {device.codename} — {device.canvas.width} × {device.canvas.height}
        </div>

        {/* EDL Header */}
        <div className={styles.chromeHeader} style={{ height: scaledHeaderH }}>
          <span className={styles.chromeLabel}>EDL Header</span>
        </div>

        {/* Content surface — fragments live here */}
        <div
          className={styles.contentSurface}
          style={{
            height: scaledContentH,
            backgroundSize: `${12 * scale}px ${12 * scale}px`,
          }}
        >
          {/* Fragment slots */}
          {slots.map((slot) => {
            const connectedEdges = getSlotConnectedEdges(slot.id, edges);
            const radii = calculateRadii(connectedEdges);
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
                positionMode={getPositionMode(connectedEdges)}
                left={colLefts[slot.col]}
                top={rowTops[slot.row]}
                width={colWidths[slot.col] * scale}
                height={rowHeights[slot.row] * scale}
              />
            );
          })}

          {/* Column dividers */}
          {Array.from({ length: cols - 1 }, (_, i) => (
            <div
              key={`div-col-${i}`}
              className={styles.colDivider}
              style={{
                left: colLefts[i] + colWidths[i] * scale,
                width: gap,
                top: 0,
                height: scaledContentH,
              }}
              onPointerDown={(e) => handleDividerPointerDown(e, 'col', i)}
              onPointerMove={handleDividerPointerMove}
              onPointerUp={handleDividerPointerUp}
            />
          ))}

          {/* Row dividers */}
          {Array.from({ length: rows - 1 }, (_, i) => (
            <div
              key={`div-row-${i}`}
              className={styles.rowDivider}
              style={{
                top: rowTops[i] + rowHeights[i] * scale,
                height: gap,
                left: 0,
                width: scaledDeviceW,
              }}
              onPointerDown={(e) => handleDividerPointerDown(e, 'row', i)}
              onPointerMove={handleDividerPointerMove}
              onPointerUp={handleDividerPointerUp}
            />
          ))}

          {/* Edge connectivity toggles */}
          {edges.map((edge) => {
            const pos = getEdgeTogglePosition(
              edge, colLefts, rowTops, colWidths, rowHeights, scale, gap,
            );
            return (
              <ConnectivityToggle
                key={edge.id}
                edge={edge}
                onToggle={(id) => setEdgeConnected(id, !edge.connected)}
                style={{ position: 'absolute', left: pos.left, top: pos.top }}
              />
            );
          })}
        </div>

        {/* Utility bar */}
        <div className={styles.chromeUtility} style={{ height: scaledUtilityH }}>
          <span className={styles.chromeLabel}>Utility</span>
        </div>
      </div>
    </div>
  );
}
