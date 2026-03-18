import { useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { LeafLayout } from '../../utils/fragmentTree';
import type { ComponentType } from '../../utils/fragmentTree';
import type { LayoutControls } from '../../hooks/useLayoutStore';
import styles from './FragmentPanel.module.css';

interface Props {
  leaf: LeafLayout;
  controls: LayoutControls;
  onSplitH: () => void;
  onSplitV: () => void;
  onMerge: () => void;
  onAddContent: (componentType: ComponentType) => void;
  onRemoveContent: () => void;
  hasContent: boolean;
}

export function computeRadii(
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

export function FragmentPanel({
  leaf,
  controls,
  onSplitH,
  onSplitV,
  onMerge,
  onAddContent,
  onRemoveContent,
  hasContent,
}: Props) {
  const { rect, edges, node } = leaf;
  const radii = computeRadii(edges, controls);
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const prevRect = useRef({ x: rect.x, y: rect.y, w: rect.w, h: rect.h });

  useEffect(() => {
    if (!panelRef.current) return;
    const props = {
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      borderRadius: `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px`,
    };

    // Detect small vs large changes to decide animation duration
    const dx = Math.abs(rect.x - prevRect.current.x) + Math.abs(rect.y - prevRect.current.y);
    const dw = Math.abs(rect.w - prevRect.current.w) + Math.abs(rect.h - prevRect.current.h);
    const isSmallChange = dx + dw < 50;
    prevRect.current = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };

    if (isFirstRender.current) {
      gsap.set(panelRef.current, props);
      isFirstRender.current = false;
    } else {
      gsap.to(panelRef.current, {
        ...props,
        duration: isSmallChange ? 0.05 : 0.4,
        ease: isSmallChange ? 'none' : 'power3.out',
        overwrite: true,
      });
    }
    return () => {
      if (panelRef.current) gsap.killTweensOf(panelRef.current);
    };
  }, [rect.x, rect.y, rect.w, rect.h, radii.tl, radii.tr, radii.br, radii.bl]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMerge();
  }, [onMerge]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          ref={panelRef}
          className={styles.panel}
          style={{ position: 'absolute' }}
          onDoubleClick={handleDoubleClick}
        >
          <span className={styles.label}>{node.label}</span>
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

          <ContextMenu.Separator className={styles.contextMenuSeparator} />

          {!hasContent ? (
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className={styles.contextMenuItem}>
                Add Component
                <span className={styles.contextMenuRight}>{'\u25B8'}</span>
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent className={styles.contextMenu}>
                  <ContextMenu.Item
                    className={styles.contextMenuItem}
                    onSelect={() => onAddContent('button')}
                  >
                    Button
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    className={styles.contextMenuItem}
                    onSelect={() => onAddContent('placeholder')}
                  >
                    Placeholder
                  </ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>
          ) : (
            <ContextMenu.Item
              className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
              onSelect={onRemoveContent}
            >
              Remove Content
            </ContextMenu.Item>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
