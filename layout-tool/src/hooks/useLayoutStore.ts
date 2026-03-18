import { create } from 'zustand';
import { gridToSlots, type Slot, type Edge } from '../utils/gridToSlots';
import { devices, defaultDevice, type DeviceConfig } from '../data/devices';

interface LayoutState {
  // Grid
  cols: number;
  rows: number;
  slots: Slot[];
  edges: Edge[];

  // Device
  device: DeviceConfig;

  // Actions
  setGrid: (cols: number, rows: number) => void;
  setEdgeConnected: (edgeId: string, connected: boolean) => void;
  setAllConnected: (connected: boolean) => void;
  setDevice: (deviceId: string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => {
  const initial = gridToSlots(2, 1);

  return {
    cols: 2,
    rows: 1,
    slots: initial.slots,
    edges: initial.edges,
    device: defaultDevice,

    setGrid: (cols, rows) => {
      const { slots, edges } = gridToSlots(cols, rows);
      set({ cols, rows, slots, edges });
    },

    setEdgeConnected: (edgeId, connected) =>
      set((state) => ({
        edges: state.edges.map((e) =>
          e.id === edgeId ? { ...e, connected } : e,
        ),
      })),

    setAllConnected: (connected) =>
      set((state) => ({
        edges: state.edges.map((e) => ({ ...e, connected })),
      })),

    setDevice: (deviceId) => {
      const device = devices.find((d) => d.id === deviceId);
      if (device) set({ device });
    },
  };
});
