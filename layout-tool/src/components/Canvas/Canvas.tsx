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
  const headerH = device.chrome.headerHeight;
  const utilityH = device.chrome.utilityBarHeight;
  const contentH = deviceH - headerH - utilityH;

  const connectedGap = controls.connectedMargin;
  const unconnectedGap = controls.margin;

  const contentRect: Rect = { x: 0, y: 0, w: deviceW, h: contentH };

  const layout = useMemo(
    () => computeLayout(tree, contentRect, connectedGap, unconnectedGap),
    [tree, contentRect.w, contentRect.h, connectedGap, unconnectedGap],
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
      {/* EDL Header */}
      <div className={styles.chromeHeader} style={{ height: headerH }}>
        <span className={styles.chromeLabel}>EDL Header</span>
      </div>

      {/* Content surface */}
      <div
        className={styles.contentSurface}
        style={{ height: contentH }}
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

      {/* Utility bar */}
      <div className={styles.chromeUtility} style={{ height: utilityH }}>
        <span className={styles.chromeLabel}>Utility</span>
      </div>
    </div>
  );
}
