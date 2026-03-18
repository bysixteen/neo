import { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { LeafLayout } from '../../utils/fragmentTree';
import type { LayoutControls } from '../../hooks/useLayoutStore';
import styles from './FragmentPanel.module.css';

interface Props {
  leaf: LeafLayout;
  controls: LayoutControls;
  onSplitH: () => void;
  onSplitV: () => void;
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

export function FragmentPanel({ leaf, controls, onSplitH, onSplitV, onMerge }: Props) {
  const { rect, edges, node } = leaf;
  const radii = computeRadii(edges, controls);
  const borderRadius = `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px`;

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
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
      onDoubleClick={handleDoubleClick}
    >
      {/* Label — always present, brighter on hover via CSS */}
      <span className={styles.label}>{node.label}</span>

      {/* Action pills — always in DOM, shown/hidden via CSS :hover */}
      <div className={styles.actions}>
        <button
          className={styles.pill}
          onClick={(e) => {
            e.stopPropagation();
            onSplitH();
          }}
        >
          Split Horizontal
        </button>
        <button
          className={styles.pill}
          onClick={(e) => {
            e.stopPropagation();
            onSplitV();
          }}
        >
          Split Vertical
        </button>
      </div>
    </motion.div>
  );
}
