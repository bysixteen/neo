import { useRef, useState } from 'react';
import type { BranchLayout } from '../../utils/fragmentTree';
import styles from './ContentDivider.module.css';

interface Props {
  branch: BranchLayout;
  connectedGap: number;
  unconnectedGap: number;
  snapGrid: number;
  offsetX: number;
  offsetY: number;
  onRatioChange: (ratio: number) => void;
  onToggleConnected: () => void;
}

interface DragState {
  startClient: number;
  startRatio: number;
  totalSize: number;
  rectOrigin: number;
}

function snapToGrid(px: number, grid: number): number {
  if (grid <= 0) return px;
  return Math.round(px / grid) * grid;
}

export function ContentDivider({
  branch,
  connectedGap,
  unconnectedGap,
  snapGrid,
  offsetX,
  offsetY,
  onRatioChange,
  onToggleConnected,
}: Props) {
  const { node, rect } = branch;
  const axis = node.splitAxis!;
  const ratio = node.splitRatio ?? 0.5;
  const connected = node.connected ?? true;
  const gap = connected ? connectedGap : unconnectedGap;

  const drag = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isHorizontal = axis === 'horizontal';
  const totalSize = isHorizontal ? rect.w : rect.h;
  const usableSize = totalSize - gap;
  const firstSize = usableSize * ratio;

  const dividerStyle: React.CSSProperties = isHorizontal
    ? {
        position: 'absolute',
        left: offsetX + rect.x + firstSize,
        top: offsetY + rect.y,
        width: gap,
        height: rect.h,
        cursor: 'col-resize',
      }
    : {
        position: 'absolute',
        left: offsetX + rect.x,
        top: offsetY + rect.y + firstSize,
        width: rect.w,
        height: gap,
        cursor: 'row-resize',
      };

  const toggleOffset = gap + 4;
  const toggleStyle: React.CSSProperties = isHorizontal
    ? {
        position: 'absolute',
        left: offsetX + rect.x + firstSize - toggleOffset - 16,
        top: offsetY + rect.y + rect.h / 2 - 8,
      }
    : {
        position: 'absolute',
        left: offsetX + rect.x + rect.w / 2 - 8,
        top: offsetY + rect.y + firstSize - toggleOffset - 16,
      };

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
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
    setIsDragging(false);
  }

  const toggleClasses = [
    styles.toggle,
    isHovered && !isDragging ? styles.visible : '',
    isDragging ? styles.dragging : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div
        className={`${styles.divider} ${isHorizontal ? styles.horizontal : styles.vertical}`}
        style={dividerStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <button
        className={toggleClasses}
        style={toggleStyle}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleConnected();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={connected ? 'Disconnect' : 'Connect'}
      >
        <span className={styles.toggleIcon}>{connected ? '\u2212' : '+'}</span>
      </button>
    </>
  );
}
