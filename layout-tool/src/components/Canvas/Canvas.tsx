import { useMemo, useCallback } from 'react';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { computeLayout, type Rect } from '../../utils/fragmentTree';
import { FragmentPanel } from '../FragmentPanel/FragmentPanel';
import { SplitDivider } from '../SplitDivider/SplitDivider';
import styles from './Canvas.module.css';

export function Canvas() {
  const { tree, device, controls, split, merge, updateSplitRatio, toggleConnected } = useLayoutStore();

  // 1:1 pixel — no scaling
  const deviceW = device.canvas.width;
  const deviceH = device.canvas.height;

  const { chrome, contentMargins } = device;
  // Header zone: marginTop + header + marginBottom
  const headerZoneH = chrome.headerMarginTop + chrome.headerHeight + chrome.headerMarginBottom;

  // Content area: inset by margins
  const contentX = contentMargins.left;
  const contentY = 0; // relative to content surface
  const contentW = deviceW - contentMargins.left - contentMargins.right;
  const contentSurfaceH = deviceH - headerZoneH;
  const contentH = contentSurfaceH - contentMargins.bottom;

  const connectedGap = controls.connectedMargin;
  const unconnectedGap = controls.margin;

  const contentRect: Rect = { x: contentX, y: contentY, w: contentW, h: contentH };

  const layout = useMemo(
    () => computeLayout(tree, contentRect, connectedGap, unconnectedGap),
    [tree, contentRect.x, contentRect.y, contentRect.w, contentRect.h, connectedGap, unconnectedGap],
  );

  const handleSplit = useCallback((nodeId: string, rect: Rect) => {
    const axis = rect.w >= rect.h ? 'horizontal' : 'vertical';
    split(nodeId, axis);
  }, [split]);

  const handleMerge = useCallback((nodeId: string) => {
    merge(nodeId);
  }, [merge]);

  return (
    <div
      className={styles.deviceFrame}
      style={{ width: deviceW, height: deviceH }}
    >
      {/* Header zone: margin-top + header + margin-bottom */}
      <div className={styles.headerZone} style={{ height: headerZoneH }}>
        <div className={styles.headerMargin} style={{ height: chrome.headerMarginTop }} />
        <div className={styles.chromeHeader} style={{ height: chrome.headerHeight }}>
          <span className={styles.chromeLabel}>EDL Header</span>
        </div>
        <div className={styles.headerMargin} style={{ height: chrome.headerMarginBottom }} />
      </div>

      {/* Content surface — fragments sit within margins */}
      <div
        className={styles.contentSurface}
        style={{ height: contentSurfaceH }}
      >
        {/* Leaf panels */}
        {layout.leaves.map((leaf) => (
          <FragmentPanel
            key={leaf.node.id}
            leaf={leaf}
            controls={controls}
            onSplit={() => handleSplit(leaf.node.id, leaf.rect)}
            onMerge={() => handleMerge(leaf.node.id)}
          />
        ))}

        {/* Split dividers */}
        {layout.branches.map((branch) => (
          <SplitDivider
            key={`div-${branch.node.id}`}
            branch={branch}
            connectedGap={connectedGap}
            unconnectedGap={unconnectedGap}
            onRatioChange={(ratio) => updateSplitRatio(branch.node.id, ratio)}
            onToggleConnected={() => toggleConnected(branch.node.id)}
          />
        ))}
      </div>
    </div>
  );
}
