import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { LeafLayout } from '../../utils/fragmentTree';
import type { LayoutControls } from '../../hooks/useLayoutStore';
import styles from './FragmentPanel.module.css';

interface Props {
  leaf: LeafLayout;
  controls: LayoutControls;
  scale: number;
  onSplit: () => void;
  onMerge: () => void;
}

function computeRadii(
  edges: { top: boolean; right: boolean; bottom: boolean; left: boolean },
  controls: LayoutControls,
  scale: number,
) {
  const outer = controls.outerRadius * scale;
  const connected = controls.connectedRadius * scale;
  const inner = controls.innerRadius * scale;

  function corner(edgeA: boolean, edgeB: boolean): number {
    if (edgeA && edgeB) return connected;
    if (edgeA || edgeB) return inner;
    return outer;
  }

  return {
    tl: corner(edges.top, edges.left),
    tr: corner(edges.top, edges.right),
    br: corner(edges.bottom, edges.right),
    bl: corner(edges.bottom, edges.left),
  };
}

const CLICK_DELAY = 250; // ms to wait before treating as single click

export function FragmentPanel({ leaf, controls, scale, onSplit, onMerge }: Props) {
  const [hovered, setHovered] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { rect, edges, node } = leaf;
  const radii = computeRadii(edges, controls, scale);
  const borderRadius = `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px`;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Delay single click to distinguish from double click
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      onSplit();
    }, CLICK_DELAY);
  }, [onSplit]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Cancel pending single click
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    onMerge();
  }, [onMerge]);

  return (
    <motion.div
      className={styles.panel}
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
      }}
      animate={{ borderRadius }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.inner}>
        <span className={styles.label}>{node.label}</span>
        <span className={styles.size}>
          {Math.round(rect.w / scale)} x {Math.round(rect.h / scale)}
        </span>
      </div>

      {hovered && (
        <div className={styles.actions}>
          <span className={styles.hint}>Click to split / Double-click to merge</span>
        </div>
      )}
    </motion.div>
  );
}
