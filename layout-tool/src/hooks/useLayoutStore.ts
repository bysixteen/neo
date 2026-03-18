import { create } from 'zustand';
import {
  type FragmentNode,
  createRoot,
  splitNode,
  mergeNode,
  setConnected,
  setSplitRatio,
} from '../utils/fragmentTree';
import { devices, defaultDevice, type DeviceConfig } from '../data/devices';
import { semanticRadii, spacing } from '../data/tokens';

export interface LayoutControls {
  outerRadius: number;
  innerRadius: number;
  connectedRadius: number;
  margin: number;          // unconnected gap
  connectedMargin: number; // connected gap
}

/** Grid layer sizes (px) and their opacities */
export const GRID_FINE = 6;
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

  // Controls
  setControl: <K extends keyof LayoutControls>(key: K, value: number) => void;

  // Grid
  toggleFineGrid: () => void;
  toggleCoarseGrid: () => void;
  toggleSnap: () => void;

  // Device
  setDevice: (deviceId: string) => void;
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
