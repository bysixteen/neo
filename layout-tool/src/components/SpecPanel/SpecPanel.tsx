import { useMemo } from 'react';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { computeLayout, leafCount, type Rect } from '../../utils/fragmentTree';
import styles from './SpecPanel.module.css';

export function SpecPanel() {
  const { tree, device, controls } = useLayoutStore();

  const { chrome, contentMargins } = device;
  const headerZoneH = chrome.headerMarginTop + chrome.headerHeight + chrome.headerMarginBottom;
  const contentSurfaceH = device.canvas.height - headerZoneH;
  const contentW = device.canvas.width - contentMargins.left - contentMargins.right;
  const contentH = contentSurfaceH - contentMargins.bottom;
  const contentRect: Rect = { x: contentMargins.left, y: 0, w: contentW, h: contentH };

  const layout = useMemo(
    () => computeLayout(tree, contentRect, controls.connectedMargin, controls.margin),
    [tree, contentW, contentH, contentMargins.left, controls.connectedMargin, controls.margin],
  );

  const count = leafCount(tree);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Spec</h3>
        <span className={styles.meta}>
          {device.codename} — {device.canvas.width}x{device.canvas.height}
        </span>
      </div>

      <div className={styles.groupSpec}>
        <div className={styles.row}>
          <span className={styles.prop}>Fragments</span>
          <span className={styles.values}>{count}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.prop}>Header</span>
          <span className={styles.values}>
            {chrome.headerHeight}px ({chrome.headerMarginTop}/{chrome.headerMarginBottom} margin)
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.prop}>Content</span>
          <span className={styles.values}>{contentW} x {contentH}px</span>
        </div>
        <div className={styles.row}>
          <span className={styles.prop}>Margins</span>
          <span className={styles.values}>
            {contentMargins.left}/{contentMargins.right}/{contentMargins.bottom}
          </span>
        </div>
      </div>

      <div className={styles.slots}>
        {layout.leaves.map((leaf) => {
          const { node, rect, edges } = leaf;
          const w = Math.round(rect.w);
          const h = Math.round(rect.h);

          const edgeList: string[] = [];
          if (edges.top) edgeList.push('T');
          if (edges.right) edgeList.push('R');
          if (edges.bottom) edgeList.push('B');
          if (edges.left) edgeList.push('L');

          return (
            <div key={node.id} className={styles.slotSpec}>
              <div className={styles.slotHeader}>
                <span className={styles.slotLabel}>{node.label}</span>
                <span className={styles.slotMode}>
                  {edgeList.length > 0 ? edgeList.join('') : 'standalone'}
                </span>
              </div>

              <div className={styles.row}>
                <span className={styles.prop}>Size</span>
                <span className={styles.values}>{w} x {h}px</span>
              </div>

              <div className={styles.row}>
                <span className={styles.prop}>Connected</span>
                <span className={styles.values}>
                  {edgeList.length > 0 ? edgeList.join(', ') : 'none'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
