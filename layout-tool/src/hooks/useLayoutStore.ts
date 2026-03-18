import { create } from 'zustand';
import {
  type FragmentNode,
  type ComponentType,
  createRoot,
  splitNode,
  mergeNode,
  setConnected,
  setSplitRatio,
  addContent,
  splitContentNode,
  mergeContentNode,
  setContentSplitRatio,
  setContentConnected,
  removeContent,
} from '../utils/fragmentTree';
import { devices, defaultDevice, type DeviceConfig } from '../data/devices';
import { semanticRadii, spacing } from '../data/tokens';

export interface LayoutControls {
  outerRadius: number;
  innerRadius: number;
  connectedRadius: number;
  margin: number;          // unconnected gap
  connectedMargin: number; // connected gap
  contentPadding: number;  // inset from panel edge to content area
  componentGap: number;    // gap between split components (unconnected)
  componentConnectedGap: number; // gap between connected components
}

/** Grid layer sizes (px) and their opacities */
export const GRID_FINE = 4;
export const GRID_MID = 12;
export const GRID_COARSE = 36;

/** Snap grid — dividers snap to 12px */
export const SNAP_GRID = 12;

interface LayoutState {
  tree: FragmentNode;
  device: DeviceConfig;
  controls: LayoutControls;
  showFineGrid: boolean;
  showCoarseGrid: boolean;
  snapEnabled: boolean;

  // Tree mutations
  split: (nodeId: string, axis: 'horizontal' | 'vertical') => void;
  merge: (nodeId: string) => void;
  toggleConnected: (branchId: string) => void;
  updateSplitRatio: (branchId: string, ratio: number) => void;
  resetTree: () => void;

  // Content (components inside panels)
  addContent: (leafId: string, componentType: ComponentType) => void;
  splitContent: (leafId: string, innerNodeId: string, axis: 'horizontal' | 'vertical') => void;
  mergeContent: (leafId: string, innerNodeId: string) => void;
  updateContentSplitRatio: (leafId: string, innerBranchId: string, ratio: number) => void;
  toggleContentConnected: (leafId: string, innerBranchId: string) => void;
  removeContent: (leafId: string) => void;

  // Controls
  setControl: <K extends keyof LayoutControls>(key: K, value: number) => void;

  // Grid
  toggleFineGrid: () => void;
  toggleCoarseGrid: () => void;
  toggleSnap: () => void;

  // Device
  setDevice: (deviceId: string) => void;
}

function findLeaf(node: FragmentNode, leafId: string): FragmentNode | undefined {
  if (node.id === leafId && node.type === 'leaf') return node;
  if (node.type === 'branch') {
    return findLeaf(node.children![0], leafId) ?? findLeaf(node.children![1], leafId);
  }
  return undefined;
}

function findBranchConnected(node: FragmentNode, branchId: string): boolean | undefined {
  if (node.id === branchId) return node.connected;
  if (node.type === 'branch') {
    return findBranchConnected(node.children![0], branchId)
      ?? findBranchConnected(node.children![1], branchId);
  }
  return undefined;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  tree: createRoot(),
  device: defaultDevice,
  controls: {
    outerRadius: semanticRadii.large,        // 80
    innerRadius: semanticRadii.connected,     // 40
    connectedRadius: semanticRadii.connected, // 40
    margin: spacing.unconnected,              // 16
    connectedMargin: spacing.connected,       // 8
    contentPadding: 16,                       // default inset
    componentGap: 8,                          // unconnected component gap
    componentConnectedGap: 4,                 // connected component gap
  },
  showFineGrid: false,
  showCoarseGrid: false,
  snapEnabled: true,

  split: (nodeId, axis) =>
    set((s) => ({ tree: splitNode(s.tree, nodeId, axis) })),

  merge: (nodeId) =>
    set((s) => ({ tree: mergeNode(s.tree, nodeId) })),

  toggleConnected: (branchId) =>
    set((s) => {
      const current = findBranchConnected(s.tree, branchId) ?? true;
      return { tree: setConnected(s.tree, branchId, !current) };
    }),

  updateSplitRatio: (branchId, ratio) =>
    set((s) => ({ tree: setSplitRatio(s.tree, branchId, ratio) })),

  // Content actions
  addContent: (leafId, componentType) =>
    set((s) => ({ tree: addContent(s.tree, leafId, componentType) })),

  splitContent: (leafId, innerNodeId, axis) =>
    set((s) => ({ tree: splitContentNode(s.tree, leafId, innerNodeId, axis) })),

  mergeContent: (leafId, innerNodeId) =>
    set((s) => ({ tree: mergeContentNode(s.tree, leafId, innerNodeId) })),

  updateContentSplitRatio: (leafId, innerBranchId, ratio) =>
    set((s) => ({ tree: setContentSplitRatio(s.tree, leafId, innerBranchId, ratio) })),

  toggleContentConnected: (leafId, innerBranchId) =>
    set((s) => {
      const leaf = findLeaf(s.tree, leafId);
      if (!leaf?.content) return s;
      const current = findBranchConnected(leaf.content, innerBranchId) ?? true;
      return { tree: setContentConnected(s.tree, leafId, innerBranchId, !current) };
    }),

  removeContent: (leafId) =>
    set((s) => ({ tree: removeContent(s.tree, leafId) })),

  resetTree: () => set({ tree: createRoot() }),

  setControl: (key, value) =>
    set((s) => ({ controls: { ...s.controls, [key]: value } })),

  toggleFineGrid: () =>
    set((s) => ({ showFineGrid: !s.showFineGrid })),

  toggleCoarseGrid: () =>
    set((s) => ({ showCoarseGrid: !s.showCoarseGrid })),

  toggleSnap: () =>
    set((s) => ({ snapEnabled: !s.snapEnabled })),

  setDevice: (deviceId) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;
    set({ device });
  },
}));
