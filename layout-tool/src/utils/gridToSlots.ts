/**
 * Convert a cols x rows grid selection into slots and edges.
 * Slots are indexed left-to-right, top-to-bottom.
 * Edges represent adjacency between slots (horizontal or vertical).
 */

export interface Slot {
  id: string;
  col: number;
  row: number;
  label: string;
}

export interface Edge {
  id: string;
  slotA: string;
  slotB: string;
  axis: 'horizontal' | 'vertical';
  connected: boolean;
}

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function gridToSlots(cols: number, rows: number): { slots: Slot[]; edges: Edge[] } {
  const slots: Slot[] = [];
  const edges: Edge[] = [];

  // Create slots
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      slots.push({
        id: `slot-${row}-${col}`,
        col,
        row,
        label: index < LABELS.length ? LABELS[index] : `S${index}`,
      });
    }
  }

  // Create horizontal edges (between columns in same row)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - 1; col++) {
      edges.push({
        id: `edge-h-${row}-${col}`,
        slotA: `slot-${row}-${col}`,
        slotB: `slot-${row}-${col + 1}`,
        axis: 'horizontal',
        connected: false,
      });
    }
  }

  // Create vertical edges (between rows in same column)
  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols; col++) {
      edges.push({
        id: `edge-v-${row}-${col}`,
        slotA: `slot-${row}-${col}`,
        slotB: `slot-${row + 1}-${col}`,
        axis: 'vertical',
        connected: false,
      });
    }
  }

  return { slots, edges };
}

/**
 * Derive connected edges for a given slot based on the edge states.
 */
export function getSlotConnectedEdges(
  slotId: string,
  edges: Edge[],
): { top: boolean; right: boolean; bottom: boolean; left: boolean } {
  const result = { top: false, right: false, bottom: false, left: false };

  for (const edge of edges) {
    if (!edge.connected) continue;

    if (edge.axis === 'horizontal') {
      if (edge.slotA === slotId) result.right = true;
      if (edge.slotB === slotId) result.left = true;
    } else {
      if (edge.slotA === slotId) result.bottom = true;
      if (edge.slotB === slotId) result.top = true;
    }
  }

  return result;
}
