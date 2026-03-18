import { useMemo, useCallback } from 'react';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { computeLayout, type Rect } from '../../utils/fragmentTree';
import { FragmentPanel } from '../FragmentPanel/FragmentPanel';
import { SplitDivider } from '../SplitDivider/SplitDivider';
import styles from './Canvas.module.css';

const VIEWPORT_WIDTH = 800;
const CANVAS_PADDING = 40;

export function Canvas() {
  const { tree, device, controls, split, merge, updateSplitRatio, toggleConnected } = useLayoutStore();

  const scale = useMemo(() => {
    const maxWidth = VIEWPORT_WIDTH - CANVAS_PADDING * 2;
    return Math.min(1, maxWidth / device.canvas.width);
  }, [device.canvas.width]);

  const scaledDeviceW = device.canvas.width * scale;
  const scaledDeviceH = device.canvas.height * scale;
  const scaledHeaderH = device.chrome.headerHeight * scale;
  const scaledUtilityH = device.chrome.utilityBarHeight * scale;
  const scaledContentH = scaledDeviceH - scaledHeaderH - scaledUtilityH;

  const connectedGap = controls.connectedMargin * scale;
  const unconnectedGap = controls.margin * scale;

  const contentRect: Rect = { x: 0, y: 0, w: scaledDeviceW, h: scaledContentH };

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
    <div className={styles.wrapper}>
      <div
        className={styles.deviceFrame}
        style={{ width: scaledDeviceW, height: scaledDeviceH }}
      >
        <div className={styles.deviceLabel}>
          {device.codename} — {device.canvas.width} x {device.canvas.height}
        </div>

        {/* EDL Header */}
        <div className={styles.chromeHeader} style={{ height: scaledHeaderH }}>
          <span className={styles.chromeLabel}>EDL Header</span>
        </div>

        {/* Content surface */}
        <div
          className={styles.contentSurface}
          style={{
            height: scaledContentH,
            backgroundSize: `${12 * scale}px ${12 * scale}px`,
          }}
        >
          {/* Leaf panels */}
          {layout.leaves.map((leaf) => (
            <FragmentPanel
              key={leaf.node.id}
              leaf={leaf}
              controls={controls}
              scale={scale}
              onSplit={() => handleSplit(leaf.node.id, leaf.rect)}
              onMerge={() => handleMerge(leaf.node.id)}
            />
          ))}

          {/* Split dividers (drag to resize) */}
          {layout.branches.map((branch) => (
            <SplitDivider
              key={`div-${branch.node.id}`}
              branch={branch}
              scale={scale}
              connectedGap={connectedGap}
              unconnectedGap={unconnectedGap}
              onRatioChange={(ratio) => updateSplitRatio(branch.node.id, ratio)}
              onToggleConnected={() => toggleConnected(branch.node.id)}
            />
          ))}
        </div>

        {/* Utility bar */}
        <div className={styles.chromeUtility} style={{ height: scaledUtilityH }}>
          <span className={styles.chromeLabel}>Utility</span>
        </div>
      </div>
    </div>
  );
}
