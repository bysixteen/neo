/**
 * Recursive fragment tree — Shape Playground model.
 *
 * A FragmentNode is either a leaf (renderable panel) or a branch
 * (split into two children along an axis). Click-to-split creates
 * branches; double-click-to-merge collapses them.
 */

let nextId = 1;
export function genId(): string {
  return `frag-${nextId++}`;
}

export interface FragmentNode {
  id: string;
  type: 'leaf' | 'branch';

  // Branch properties
  splitAxis?: 'horizontal' | 'vertical'; // H = side-by-side, V = stacked
  children?: [FragmentNode, FragmentNode];
  splitRatio?: number; // 0–1, first child gets this fraction
  connected?: boolean; // gap type between children

  // Leaf properties
  label?: string;
}

// ----- Labels -----

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Walk tree and assign sequential labels to leaves */
export function relabelTree(node: FragmentNode): FragmentNode {
  let idx = 0;
  function walk(n: FragmentNode): FragmentNode {
    if (n.type === 'leaf') {
      return { ...n, label: idx < LABELS.length ? LABELS[idx++] : `S${idx++}` };
    }
    return {
      ...n,
      children: [walk(n.children![0]), walk(n.children![1])],
    };
  }
  return walk(node);
}

// ----- Factory -----

export function createLeaf(label?: string): FragmentNode {
  return { id: genId(), type: 'leaf', label: label ?? 'A' };
}

export function createRoot(): FragmentNode {
  return relabelTree(createLeaf());
}

// ----- Operations -----

/** Split a leaf into two children. Direction based on aspect ratio if not specified. */
export function splitNode(
  root: FragmentNode,
  targetId: string,
  axis?: 'horizontal' | 'vertical',
): FragmentNode {
  function walk(node: FragmentNode): FragmentNode {
    if (node.id === targetId && node.type === 'leaf') {
      return {
        id: node.id,
        type: 'branch',
        splitAxis: axis ?? 'horizontal',
        splitRatio: 0.5,
        connected: true,
        children: [
          { id: genId(), type: 'leaf' },
          { id: genId(), type: 'leaf' },
        ],
      };
    }
    if (node.type === 'branch') {
      return {
        ...node,
        children: [walk(node.children![0]), walk(node.children![1])],
      };
    }
    return node;
  }
  return relabelTree(walk(root));
}

/** Merge a branch back to a single leaf (double-click on a child). */
export function mergeNode(root: FragmentNode, targetId: string): FragmentNode {
  function walk(node: FragmentNode): FragmentNode {
    if (node.type === 'branch') {
      // If either child matches, collapse this branch
      if (
        node.children![0].id === targetId ||
        node.children![1].id === targetId
      ) {
        return { id: node.id, type: 'leaf' };
      }
      return {
        ...node,
        children: [walk(node.children![0]), walk(node.children![1])],
      };
    }
    return node;
  }
  return relabelTree(walk(root));
}

/** Toggle connectivity on a branch node */
export function setConnected(
  root: FragmentNode,
  branchId: string,
  connected: boolean,
): FragmentNode {
  function walk(node: FragmentNode): FragmentNode {
    if (node.id === branchId && node.type === 'branch') {
      return { ...node, connected };
    }
    if (node.type === 'branch') {
      return {
        ...node,
        children: [walk(node.children![0]), walk(node.children![1])],
      };
    }
    return node;
  }
  return walk(root);
}

/** Update split ratio on a branch node */
export function setSplitRatio(
  root: FragmentNode,
  branchId: string,
  ratio: number,
): FragmentNode {
  function walk(node: FragmentNode): FragmentNode {
    if (node.id === branchId && node.type === 'branch') {
      return { ...node, splitRatio: Math.max(0.15, Math.min(0.85, ratio)) };
    }
    if (node.type === 'branch') {
      return {
        ...node,
        children: [walk(node.children![0]), walk(node.children![1])],
      };
    }
    return node;
  }
  return walk(root);
}

// ----- Queries -----

/** Collect all leaf nodes */
export function getLeaves(node: FragmentNode): FragmentNode[] {
  if (node.type === 'leaf') return [node];
  return [
    ...getLeaves(node.children![0]),
    ...getLeaves(node.children![1]),
  ];
}

/** Count leaves */
export function leafCount(node: FragmentNode): number {
  return getLeaves(node).length;
}

/** Bounds for layout calculation */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LeafLayout {
  node: FragmentNode;
  rect: Rect;
  edges: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}

export interface BranchLayout {
  node: FragmentNode;
  rect: Rect;
}

/**
 * Compute absolute positions and sizes for each leaf in the tree.
 * Also tracks which edges of each leaf are "connected" (adjacent to a connected sibling).
 *
 * outerEdges tracks which edges of the current subtree are the outer boundary
 * of the content surface (not a connected internal split).
 */
export function computeLayout(
  node: FragmentNode,
  rect: Rect,
  connectedGap: number,
  unconnectedGap: number,
  parentEdges?: { top: boolean; right: boolean; bottom: boolean; left: boolean },
): { leaves: LeafLayout[]; branches: BranchLayout[] } {
  const edges = parentEdges ?? { top: false, right: false, bottom: false, left: false };

  if (node.type === 'leaf') {
    return {
      leaves: [{ node, rect, edges }],
      branches: [],
    };
  }

  const axis = node.splitAxis!;
  const ratio = node.splitRatio ?? 0.5;
  const connected = node.connected ?? true;
  const gap = connected ? connectedGap : unconnectedGap;

  let rectA: Rect;
  let rectB: Rect;
  let edgesA: typeof edges;
  let edgesB: typeof edges;

  if (axis === 'horizontal') {
    // Split left/right
    const aWidth = (rect.w - gap) * ratio;
    const bWidth = rect.w - gap - aWidth;
    rectA = { x: rect.x, y: rect.y, w: aWidth, h: rect.h };
    rectB = { x: rect.x + aWidth + gap, y: rect.y, w: bWidth, h: rect.h };
    edgesA = { ...edges, right: connected };
    edgesB = { ...edges, left: connected };
  } else {
    // Split top/bottom
    const aHeight = (rect.h - gap) * ratio;
    const bHeight = rect.h - gap - aHeight;
    rectA = { x: rect.x, y: rect.y, w: rect.w, h: aHeight };
    rectB = { x: rect.x, y: rect.y + aHeight + gap, w: rect.w, h: bHeight };
    edgesA = { ...edges, bottom: connected };
    edgesB = { ...edges, top: connected };
  }

  const layoutA = computeLayout(node.children![0], rectA, connectedGap, unconnectedGap, edgesA);
  const layoutB = computeLayout(node.children![1], rectB, connectedGap, unconnectedGap, edgesB);

  return {
    leaves: [...layoutA.leaves, ...layoutB.leaves],
    branches: [
      { node, rect },
      ...layoutA.branches,
      ...layoutB.branches,
    ],
  };
}
