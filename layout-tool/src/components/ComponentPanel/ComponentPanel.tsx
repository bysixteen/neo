import { useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { computeLayout, type FragmentNode, type Rect, type LeafLayout } from '../../utils/fragmentTree';
import type { LayoutControls } from '../../hooks/useLayoutStore';
import { SNAP_GRID } from '../../hooks/useLayoutStore';
import { ContentDivider } from '../ContentDivider/ContentDivider';
import styles from './ComponentPanel.module.css';

interface Props {
  contentRoot: FragmentNode;
  parentRect: Rect;
  parentRadii: { tl: number; tr: number; br: number; bl: number };
  controls: LayoutControls;
  snapEnabled: boolean;
  onSplitContent: (innerNodeId: string, axis: 'horizontal' | 'vertical') => void;
  onMergeContent: (innerNodeId: string) => void;
  onUpdateContentRatio: (innerBranchId: string, ratio: number) => void;
  onToggleContentConnected: (innerBranchId: string) => void;
}

/**
 * Compute dependent radii for a content leaf based on which parent corners it touches.
 * Formula: Inner Radius = Outer Radius - Padding
 */
function computeContentRadii(
  leafRect: Rect,
  contentRect: Rect,
  parentRadii: { tl: number; tr: number; br: number; bl: number },
  padding: number,
): { tl: number; tr: number; br: number; bl: number } {
  const tolerance = 2; // pixel tolerance for edge detection
  const touchesLeft = leafRect.x <= contentRect.x + tolerance;
  const touchesTop = leafRect.y <= contentRect.y + tolerance;
  const touchesRight = leafRect.x + leafRect.w >= contentRect.x + contentRect.w - tolerance;
  const touchesBottom = leafRect.y + leafRect.h >= contentRect.y + contentRect.h - tolerance;

  const internalR = 12; // small default for internal corners

  return {
    tl: touchesTop && touchesLeft ? Math.max(0, parentRadii.tl - padding) : internalR,
    tr: touchesTop && touchesRight ? Math.max(0, parentRadii.tr - padding) : internalR,
    br: touchesBottom && touchesRight ? Math.max(0, parentRadii.br - padding) : internalR,
    bl: touchesBottom && touchesLeft ? Math.max(0, parentRadii.bl - padding) : internalR,
  };
}

function ComponentLeaf({
  leaf,
  contentRect,
  parentRadii,
  padding,
  offsetX,
  offsetY,
  onSplitH,
  onSplitV,
  onMerge,
}: {
  leaf: LeafLayout;
  contentRect: Rect;
  parentRadii: { tl: number; tr: number; br: number; bl: number };
  padding: number;
  offsetX: number;
  offsetY: number;
  onSplitH: () => void;
  onSplitV: () => void;
  onMerge: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { rect, node } = leaf;
  const radii = computeContentRadii(rect, { x: 0, y: 0, w: contentRect.w, h: contentRect.h }, parentRadii, padding);

  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      borderRadius: `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px`,
      duration: 0.4,
      ease: 'power3.out',
    });
    return () => {
      if (ref.current) gsap.killTweensOf(ref.current);
    };
  }, [radii.tl, radii.tr, radii.br, radii.bl]);

  const isButton = node.componentType === 'button';
  const typeClass = isButton ? styles.button : styles.placeholder;

  return (
    <div
      ref={ref}
      className={`${styles.componentLeaf} ${typeClass}`}
      style={{
        left: offsetX + rect.x,
        top: offsetY + rect.y,
        width: rect.w,
        height: rect.h,
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onMerge();
      }}
    >
      <span className={styles.componentLabel}>
        {isButton ? 'Button' : 'Placeholder'}
      </span>

      <div className={styles.componentActions}>
        <button
          className={styles.componentPill}
          onClick={(e) => { e.stopPropagation(); onSplitH(); }}
        >
          Split H
        </button>
        <button
          className={styles.componentPill}
          onClick={(e) => { e.stopPropagation(); onSplitV(); }}
        >
          Split V
        </button>
      </div>
    </div>
  );
}

export function ComponentPanel({
  contentRoot,
  parentRect,
  parentRadii,
  controls,
  snapEnabled,
  onSplitContent,
  onMergeContent,
  onUpdateContentRatio,
  onToggleContentConnected,
}: Props) {
  const { contentPadding, componentGap, componentConnectedGap } = controls;

  // Content area inset from parent
  const contentRect: Rect = {
    x: 0,
    y: 0,
    w: parentRect.w - contentPadding * 2,
    h: parentRect.h - contentPadding * 2,
  };

  const layout = useMemo(
    () => computeLayout(contentRoot, contentRect, componentConnectedGap, componentGap),
    [contentRoot, contentRect.w, contentRect.h, componentConnectedGap, componentGap],
  );

  const offsetX = parentRect.x + contentPadding;
  const offsetY = parentRect.y + contentPadding;
  const snapGridSize = snapEnabled ? SNAP_GRID : 0;

  return (
    <>
      {layout.leaves.map((leaf) => (
        <ComponentLeaf
          key={leaf.node.id}
          leaf={leaf}
          contentRect={contentRect}
          parentRadii={parentRadii}
          padding={contentPadding}
          offsetX={offsetX}
          offsetY={offsetY}
          onSplitH={() => onSplitContent(leaf.node.id, 'horizontal')}
          onSplitV={() => onSplitContent(leaf.node.id, 'vertical')}
          onMerge={() => onMergeContent(leaf.node.id)}
        />
      ))}

      {layout.branches.map((branch) => (
        <ContentDivider
          key={`cdiv-${branch.node.id}`}
          branch={branch}
          connectedGap={componentConnectedGap}
          unconnectedGap={componentGap}
          snapGrid={snapGridSize}
          offsetX={offsetX}
          offsetY={offsetY}
          onRatioChange={(ratio) => onUpdateContentRatio(branch.node.id, ratio)}
          onToggleConnected={() => onToggleContentConnected(branch.node.id)}
        />
      ))}
    </>
  );
}
