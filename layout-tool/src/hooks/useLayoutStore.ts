import { create } from 'zustand';
import { gridToSlots, type Slot, type Edge } from '../utils/gridToSlots';
import { devices, defaultDevice, type DeviceConfig } from '../data/devices';
import { spacing } from '../data/tokens';

const GAP = spacing.connected; // 8px fixed gap — variable gaps deferred to later sprint
const MIN_SLOT_PX = 108;

function computeEqualSizes(count: number, totalPx: number): number[] {
  if (count === 1) return [totalPx];
  const available = totalPx - (count - 1) * GAP;
  const size = Math.floor(available / count);
  const sizes = Array(count).fill(size);
  sizes[count - 1] = available - size * (count - 1); // last takes any remainder
  return sizes;
}

interface LayoutState {
  // Grid
  cols: number;
  rows: number;
  slots: Slot[];
  edges: Edge[];

  // Slot dimensions in unscaled device pixels
  colWidths: number[];
  rowHeights: number[];

  // Device
  device: DeviceConfig;

  // Actions
  setGrid: (cols: number, rows: number) => void;
  setEdgeConnected: (edgeId: string, connected: boolean) => void;
  setColWidth: (index: number, width: number) => void;
  setRowHeight: (index: number, height: number) => void;
  setDevice: (deviceId: string) => void;
}

export const useLayoutStore = create<LayoutState>((set, get) => {
  const initial = gridToSlots(2, 1);
  const device = defaultDevice;
  const contentW = device.canvas.width;
  const contentH = device.canvas.height - device.chrome.headerHeight - device.chrome.utilityBarHeight;

  return {
    cols: 2,
    rows: 1,
    slots: initial.slots,
    edges: initial.edges,
    colWidths: computeEqualSizes(2, contentW),
    rowHeights: computeEqualSizes(1, contentH),
    device,

    setGrid: (cols, rows) => {
      const { device } = get();
      const { slots, edges } = gridToSlots(cols, rows);
      const contentW = device.canvas.width;
      const contentH = device.canvas.height - device.chrome.headerHeight - device.chrome.utilityBarHeight;
      set({
        cols,
        rows,
        slots,
        edges,
        colWidths: computeEqualSizes(cols, contentW),
        rowHeights: computeEqualSizes(rows, contentH),
      });
    },

    setEdgeConnected: (edgeId, connected) =>
      set((state) => ({
        edges: state.edges.map((e) =>
          e.id === edgeId ? { ...e, connected } : e,
        ),
      })),

    setColWidth: (index, width) =>
      set((state) => {
        const next = [...state.colWidths];
        next[index] = Math.max(MIN_SLOT_PX, width);
        return { colWidths: next };
      }),

    setRowHeight: (index, height) =>
      set((state) => {
        const next = [...state.rowHeights];
        next[index] = Math.max(MIN_SLOT_PX, height);
        return { rowHeights: next };
      }),

    setDevice: (deviceId) => {
      const device = devices.find((d) => d.id === deviceId);
      if (!device) return;
      const { cols, rows } = get();
      const contentW = device.canvas.width;
      const contentH = device.canvas.height - device.chrome.headerHeight - device.chrome.utilityBarHeight;
      set({
        device,
        colWidths: computeEqualSizes(cols, contentW),
        rowHeights: computeEqualSizes(rows, contentH),
      });
    },
  };
});
