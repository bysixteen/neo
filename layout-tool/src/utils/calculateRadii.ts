import { semanticRadii } from '../data/tokens';

export interface ConnectedEdges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface CornerRadii {
  tl: number;
  tr: number;
  bl: number;
  br: number;
}

/**
 * Replaces the Position collection (11 modes).
 * Rule: if a corner touches a connected edge, it gets the docked radius (40px).
 * Otherwise it gets the free radius (80px).
 */
export function calculateRadii(connectedEdges: ConnectedEdges): CornerRadii {
  const FREE = semanticRadii.large;       // 80px
  const DOCK = semanticRadii.connected;   // 40px

  return {
    tl: (connectedEdges.top || connectedEdges.left) ? DOCK : FREE,
    tr: (connectedEdges.top || connectedEdges.right) ? DOCK : FREE,
    bl: (connectedEdges.bottom || connectedEdges.left) ? DOCK : FREE,
    br: (connectedEdges.bottom || connectedEdges.right) ? DOCK : FREE,
  };
}

/**
 * Derive the position mode name for reference/spec output.
 */
export function getPositionMode(edges: ConnectedEdges): string {
  const { top, right, bottom, left } = edges;
  if (!top && !right && !bottom && !left) return 'standalone';
  if (!top && right && !bottom && !left) return 'start';
  if (!top && right && !bottom && left) return 'middle-h';
  if (!top && !right && !bottom && left) return 'end';
  if (!top && !right && bottom && !left) return 'top';
  if (top && !right && bottom && !left) return 'middle-v';
  if (top && !right && !bottom && !left) return 'bottom';
  if (!top && right && bottom && !left) return 'top-start';
  if (!top && !right && bottom && left) return 'top-end';
  if (top && right && !bottom && !left) return 'bottom-start';
  if (top && !right && !bottom && left) return 'bottom-end';
  // Fully surrounded
  return 'middle';
}
