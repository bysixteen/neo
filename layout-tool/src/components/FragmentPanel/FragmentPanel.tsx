import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { LeafLayout } from '../../utils/fragmentTree';
import type { LayoutControls } from '../../hooks/useLayoutStore';
import styles from './FragmentPanel.module.css';

interface Props {
  leaf: LeafLayout;
  controls: LayoutControls;
  onSplit: () => void;
  onMerge: () => void;
}

function computeRadii(
  edges: { top: boolean; right: boolean; bottom: boolean; left: boolean },
  controls: LayoutControls,
) {
  const { outerRadius, connectedRadius, innerRadius } = controls;

  function corner(edgeA: boolean, edgeB: boolean): number {
    if (edgeA && edgeB) return connectedRadius;
    if (edgeA || edgeB) return innerRadius;
    return outerRadius;
  }

  return {
    tl: corner(edges.top, edges.left),
    tr: corner(edges.top, edges.right),
    br: corner(edges.bottom, edges.right),
    bl: corner(edges.bottom, edges.left),
  };
}

const CLICK_DELAY = 250;

export function FragmentPanel({ leaf, controls, onSplit, onMerge }: Props) {
  const [hovered, setHovered] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { rect, edges, node } = leaf;
  const radii = computeRadii(edges, controls);
  const borderRadius = `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px`;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      onSplit();
    }, CLICK_DELAY);
  }, [onSplit]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
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
      {/* Subtle label — only visible on hover */}
      <span className={`${styles.label} ${hovered ? styles.labelVisible : ''}`}>
        {node.label}
      </span>

      {/* Hover action pills — top right, like Shape Playground */}
      {hovered && (
        <div className={styles.actions}>
          <button
            className={styles.pill}
            onClick={(e) => {
              e.stopPropagation();
              onSplit();
              if (clickTimer.current) {
                clearTimeout(clickTimer.current);
                clickTimer.current = null;
              }
            }}
          >
            Split Connected
          </button>
        </div>
      )}
    </motion.div>
  );
}
