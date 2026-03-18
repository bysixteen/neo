import { useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import * as ContextMenu from '@radix-ui/react-context-menu';
import {
  computeLayout,
  applyFixedHeights,
  COMPONENT_SIZES,
  type FragmentNode,
  type Rect,
  type LeafLayout,
  type ComponentSize,
} from '../../utils/fragmentTree';
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
  onSetSize: (innerNodeId: string, size: ComponentSize) => void;
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
  const tolerance = 2;
  const touchesLeft = leafRect.x <= contentRect.x + tolerance;
  const touchesTop = leafRect.y <= contentRect.y + tolerance;
  const touchesRight = leafRect.x + leafRect.w >= contentRect.x + contentRect.w - tolerance;
  const touchesBottom = leafRect.y + leafRect.h >= contentRect.y + contentRect.h - tolerance;

  const internalR = 12;

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
  onSetSize,
  currentSize,
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
  onSetSize: (size: ComponentSize) => void;
  currentSize?: ComponentSize;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const { rect, node } = leaf;
  const radii = computeContentRadii(rect, { x: 0, y: 0, w: contentRect.w, h: contentRect.h }, parentRadii, padding);

  useEffect(() => {
    if (!ref.current) return;
    const props = {
      left: offsetX + rect.x,
      top: offsetY + rect.y,
      width: rect.w,
      height: rect.h,
      borderRadius: `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px`,
    };

    if (isFirstRender.current) {
      gsap.set(ref.current, props);
      isFirstRender.current = false;
    } else {
      gsap.to(ref.current, { ...props, duration: 0.4, ease: 'power3.out' });
    }
    return () => {
      if (ref.current) gsap.killTweensOf(ref.current);
    };
  }, [offsetX, offsetY, rect.x, rect.y, rect.w, rect.h, radii.tl, radii.tr, radii.br, radii.bl]);

  const isButton = node.componentType === 'button';
  const typeClass = isButton ? styles.button : styles.placeholder;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          ref={ref}
          className={`${styles.componentLeaf} ${typeClass}`}
          style={{ position: 'absolute' }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onMerge();
          }}
        >
          <span className={styles.componentLabel}>
            {isButton ? 'Button' : 'Placeholder'}
          </span>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className={styles.contextMenu}>
          <ContextMenu.Item className={styles.contextMenuItem} onSelect={onSplitH}>
            Split Horizontal
          </ContextMenu.Item>
          <ContextMenu.Item className={styles.contextMenuItem} onSelect={onSplitV}>
            Split Vertical
          </ContextMenu.Item>

          {isButton && (
            <>
              <ContextMenu.Separator className={styles.contextMenuSeparator} />
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className={styles.contextMenuItem}>
                  Size
                  <span className={styles.contextMenuRight}>
                    {currentSize ?? 'medium'}
                  </span>
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className={styles.contextMenu}>
                    {(['small', 'medium', 'large'] as ComponentSize[]).map((size) => (
                      <ContextMenu.Item
                        key={size}
                        className={styles.contextMenuItem}
                        onSelect={() => onSetSize(size)}
                      >
                        <span style={{ textTransform: 'capitalize' }}>{size}</span>
                        <span className={styles.contextMenuRight}>
                          {COMPONENT_SIZES[size]}px
                        </span>
                      </ContextMenu.Item>
                    ))}
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
            </>
          )}

          <ContextMenu.Separator className={styles.contextMenuSeparator} />
          <ContextMenu.Item
            className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
            onSelect={onMerge}
          >
            Remove
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
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
  onSetSize,
}: Props) {
  const { contentPadding, componentGap, componentConnectedGap } = controls;

  const fullContentW = parentRect.w - contentPadding * 2;
  const fullContentH = parentRect.h - contentPadding * 2;

  const contentRect: Rect = { x: 0, y: 0, w: fullContentW, h: fullContentH };

  // Apply fixed button heights before layout computation
  const resolvedContent = useMemo(
    () => applyFixedHeights(contentRoot, fullContentH, componentConnectedGap),
    [contentRoot, fullContentH, componentConnectedGap],
  );

  const layout = useMemo(
    () => computeLayout(resolvedContent, contentRect, componentConnectedGap, componentGap),
    [resolvedContent, contentRect.w, contentRect.h, componentConnectedGap, componentGap],
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
          onSetSize={(size) => onSetSize(leaf.node.id, size)}
          currentSize={leaf.node.componentSize}
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
