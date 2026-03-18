import { useMemo, useCallback } from 'react';
import { useLayoutStore, GRID_FINE, GRID_MID, GRID_COARSE, SNAP_GRID } from '../../hooks/useLayoutStore';
import { computeLayout, type Rect } from '../../utils/fragmentTree';
import { FragmentPanel, computeRadii } from '../FragmentPanel/FragmentPanel';
import { SplitDivider } from '../SplitDivider/SplitDivider';
import { ComponentPanel } from '../ComponentPanel/ComponentPanel';
import { GridOverlay } from '../GridOverlay/GridOverlay';
import styles from './Canvas.module.css';

export function Canvas() {
  const {
    tree, device, controls,
    showFineGrid, showCoarseGrid, snapEnabled,
    split, merge, updateSplitRatio, toggleConnected,
    addContent, splitContent, mergeContent,
    updateContentSplitRatio, toggleContentConnected, setContentSize, removeContent,
  } = useLayoutStore();

  const deviceW = device.canvas.width;
  const deviceH = device.canvas.height;

  const { chrome, contentMargins } = device;
  const headerZoneH = chrome.headerMarginTop + chrome.headerHeight + chrome.headerMarginBottom;

  const contentX = contentMargins.left;
  const contentY = 0;
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

  const handleSplit = useCallback((nodeId: string, axis: 'horizontal' | 'vertical') => {
    split(nodeId, axis);
  }, [split]);

  const handleMerge = useCallback((nodeId: string) => {
    merge(nodeId);
  }, [merge]);

  const snapGridSize = snapEnabled ? SNAP_GRID : 0;

  return (
    <div
      className={styles.deviceFrame}
      style={{ width: deviceW, height: deviceH }}
    >
      {/* Grid overlays — layered, each at its own opacity */}
      {showFineGrid && (
        <>
          <GridOverlay width={deviceW} height={deviceH} gridSize={GRID_FINE} opacity={0.04} />
          <GridOverlay width={deviceW} height={deviceH} gridSize={GRID_MID} opacity={0.08} />
        </>
      )}
      {showCoarseGrid && (
        <GridOverlay width={deviceW} height={deviceH} gridSize={GRID_COARSE} opacity={0.12} />
      )}

      {/* Header zone */}
      <div className={styles.headerZone} style={{ height: headerZoneH }}>
        <div className={styles.headerMargin} style={{ height: chrome.headerMarginTop }} />
        <div className={styles.chromeHeader} style={{ height: chrome.headerHeight }}>
          <span className={styles.chromeLabel}>Header</span>
        </div>
        <div className={styles.headerMargin} style={{ height: chrome.headerMarginBottom }} />
      </div>

      {/* Content surface */}
      <div
        className={styles.contentSurface}
        style={{ height: contentSurfaceH }}
      >
        {layout.leaves.map((leaf) => {
          const hasContent = !!leaf.node.content;
          return (
            <FragmentPanel
              key={leaf.node.id}
              leaf={leaf}
              controls={controls}
              onSplitH={() => handleSplit(leaf.node.id, 'horizontal')}
              onSplitV={() => handleSplit(leaf.node.id, 'vertical')}
              onMerge={() => handleMerge(leaf.node.id)}
              onAddContent={(type) => addContent(leaf.node.id, type)}
              onRemoveContent={() => removeContent(leaf.node.id)}
              hasContent={hasContent}
            />
          );
        })}

        {/* Component panels rendered inside leaf panels that have content */}
        {layout.leaves
          .filter((leaf) => leaf.node.content)
          .map((leaf) => {
            const radii = computeRadii(leaf.edges, controls);
            return (
              <ComponentPanel
                key={`content-${leaf.node.id}`}
                contentRoot={leaf.node.content!}
                parentRect={leaf.rect}
                parentRadii={radii}
                controls={controls}
                snapEnabled={snapEnabled}
                onSplitContent={(innerNodeId, axis) => splitContent(leaf.node.id, innerNodeId, axis)}
                onMergeContent={(innerNodeId) => mergeContent(leaf.node.id, innerNodeId)}
                onUpdateContentRatio={(branchId, ratio) => updateContentSplitRatio(leaf.node.id, branchId, ratio)}
                onToggleContentConnected={(branchId) => toggleContentConnected(leaf.node.id, branchId)}
                onSetSize={(innerNodeId, size) => setContentSize(leaf.node.id, innerNodeId, size)}
              />
            );
          })}

        {layout.branches.map((branch) => (
          <SplitDivider
            key={`div-${branch.node.id}`}
            branch={branch}
            connectedGap={connectedGap}
            unconnectedGap={unconnectedGap}
            snapGrid={snapGridSize}
            onRatioChange={(ratio) => updateSplitRatio(branch.node.id, ratio)}
            onToggleConnected={() => toggleConnected(branch.node.id)}
          />
        ))}
      </div>
    </div>
  );
}
