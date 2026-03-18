import { useRef } from 'react';
import type { BranchLayout } from '../../utils/fragmentTree';
import styles from './SplitDivider.module.css';

interface Props {
  branch: BranchLayout;
  connectedGap: number;
  unconnectedGap: number;
  snapGrid: number; // 0 = no snap, otherwise snap to this interval
  onRatioChange: (ratio: number) => void;
  onToggleConnected: () => void;
}

interface DragState {
  startClient: number;
  startRatio: number;
  totalSize: number;
  rectOrigin: number; // absolute origin (x or y) of the branch rect
}

/** Snap a pixel position to the nearest grid line */
function snapToGrid(px: number, grid: number): number {
  if (grid <= 0) return px;
  return Math.round(px / grid) * grid;
}

export function SplitDivider({
  branch,
  connectedGap,
  unconnectedGap,
  snapGrid,
  onRatioChange,
  onToggleConnected,
}: Props) {
  const { node, rect } = branch;
  const axis = node.splitAxis!;
  const ratio = node.splitRatio ?? 0.5;
  const connected = node.connected ?? true;
  const gap = connected ? connectedGap : unconnectedGap;

  const drag = useRef<DragState | null>(null);

  const isHorizontal = axis === 'horizontal';
  const totalSize = isHorizontal ? rect.w : rect.h;
  const usableSize = totalSize - gap;
  const firstSize = usableSize * ratio;

  // Divider (drag zone) — the gap area between panels
  const dividerStyle: React.CSSProperties = isHorizontal
    ? {
        position: 'absolute',
        left: rect.x + firstSize,
        top: rect.y,
        width: gap,
        height: rect.h,
        cursor: 'col-resize',
      }
    : {
        position: 'absolute',
        left: rect.x,
        top: rect.y + firstSize,
        width: rect.w,
        height: gap,
        cursor: 'row-resize',
      };

  // Toggle button — positioned OUTSIDE the drag zone
  const toggleStyle: React.CSSProperties = isHorizontal
    ? {
        position: 'absolute',
        left: rect.x + firstSize - 24,
        top: rect.y + rect.h / 2 - 10,
        zIndex: 4,
      }
    : {
        position: 'absolute',
        left: rect.x + rect.w / 2 - 10,
        top: rect.y + firstSize - 24,
        zIndex: 4,
      };

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startClient: isHorizontal ? e.clientX : e.clientY,
      startRatio: ratio,
      totalSize: usableSize,
      rectOrigin: isHorizontal ? rect.x : rect.y,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const delta = isHorizontal
      ? e.clientX - drag.current.startClient
      : e.clientY - drag.current.startClient;

    let newFirstSize = drag.current.startRatio * drag.current.totalSize + delta;

    // Snap the divider position to the grid
    if (snapGrid > 0) {
      const absolutePos = drag.current.rectOrigin + newFirstSize;
      const snapped = snapToGrid(absolutePos, snapGrid);
      newFirstSize = snapped - drag.current.rectOrigin;
    }

    const newRatio = newFirstSize / drag.current.totalSize;
    onRatioChange(newRatio);
  }

  function handlePointerUp() {
    drag.current = null;
  }

  return (
    <>
      {/* Drag handle */}
      <div
        className={`${styles.divider} ${isHorizontal ? styles.horizontal : styles.vertical} ${connected ? styles.connected : styles.disconnected}`}
        style={dividerStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Toggle button — separate element, outside drag zone */}
      <button
        className={`${styles.toggle} ${isHorizontal ? styles.toggleH : styles.toggleV}`}
        style={toggleStyle}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleConnected();
        }}
        title={connected ? 'Disconnect' : 'Connect'}
      >
        <span className={styles.toggleIcon}>{connected ? '\u2212' : '+'}</span>
      </button>
    </>
  );
}
