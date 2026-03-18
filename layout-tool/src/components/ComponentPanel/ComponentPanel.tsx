import { useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import * as ContextMenu from '@radix-ui/react-context-menu';
import {
  computeLayout,
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

/** Get the resolved fixed height for a content tree (max of all button sizes within) */
function getContentHeight(node: FragmentNode): number {
  if (node.type === 'leaf') {
    if (node.componentType === 'button') {
      return COMPONENT_SIZES[node.componentSize ?? 'medium'];
    }
    return 0; // placeholder fills whatever space it gets
  }
  // For branches, both children share the same band height
  const a = getContentHeight(node.children![0]);
  const b = getContentHeight(node.children![1]);
  return Math.max(a, b);
}

/** Check if any node in the tree is a button */
function hasButton(node: FragmentNode): boolean {
  if (node.type === 'leaf') return node.componentType === 'button';
  return hasButton(node.children![0]) || hasButton(node.children![1]);
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
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
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

  // Buttons use fixed height at the bottom of the panel
  const isButtonContent = hasButton(contentRoot);
  const fixedH = isButtonContent ? getContentHeight(contentRoot) : fullContentH;
  const clampedH = Math.min(fixedH, fullContentH);

  // Content rect for layout computation (buttons get a fixed-height band)
  const contentRect: Rect = {
    x: 0,
    y: 0,
    w: fullContentW,
    h: clampedH,
  };

  const layout = useMemo(
    () => computeLayout(contentRoot, contentRect, componentConnectedGap, componentGap),
    [contentRoot, contentRect.w, contentRect.h, componentConnectedGap, componentGap],
  );

  // Buttons anchor to the bottom of the content area
  const offsetX = parentRect.x + contentPadding;
  const offsetY = isButtonContent
    ? parentRect.y + contentPadding + (fullContentH - clampedH)
    : parentRect.y + contentPadding;
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
