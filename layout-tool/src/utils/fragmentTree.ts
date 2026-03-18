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

export type ComponentType = 'button' | 'placeholder';

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

  // Content — leaf-only: nested fragment tree of components
  content?: FragmentNode;
  componentType?: ComponentType; // set when this node IS a component
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
          { id: genId(), type: 'leaf', componentType: node.componentType },
          { id: genId(), type: 'leaf', componentType: node.componentType },
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

// ----- Content Tree Operations -----

/** Create a component leaf node */
export function createComponent(type: ComponentType): FragmentNode {
  return { id: genId(), type: 'leaf', componentType: type };
}

/** Walk the main tree to find a leaf, then apply a transform to its content */
function mapLeafContent(
  root: FragmentNode,
  leafId: string,
  fn: (content: FragmentNode | undefined) => FragmentNode | undefined,
): FragmentNode {
  function walk(node: FragmentNode): FragmentNode {
    if (node.id === leafId && node.type === 'leaf') {
      return { ...node, content: fn(node.content) };
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

/** Add a component to a leaf panel.
 *  Buttons are placed at the bottom (split V: placeholder top, button bottom).
 *  Placeholders fill the whole content area.
 */
export function addContent(
  root: FragmentNode,
  leafId: string,
  componentType: ComponentType,
): FragmentNode {
  return mapLeafContent(root, leafId, () => {
    if (componentType === 'button') {
      // Button at bottom: vertical split with placeholder above
      return {
        id: genId(),
        type: 'branch',
        splitAxis: 'vertical',
        splitRatio: 0.7,
        connected: true,
        children: [
          { id: genId(), type: 'leaf', componentType: 'placeholder' },
          { id: genId(), type: 'leaf', componentType: 'button' },
        ],
      };
    }
    return createComponent(componentType);
  });
}

/** Split a node within the content tree of a leaf */
export function splitContentNode(
  root: FragmentNode,
  leafId: string,
  innerNodeId: string,
  axis: 'horizontal' | 'vertical',
): FragmentNode {
  return mapLeafContent(root, leafId, (content) => {
    if (!content) return content;
    return splitNode(content, innerNodeId, axis);
  });
}

/** Merge a node within the content tree of a leaf */
export function mergeContentNode(
  root: FragmentNode,
  leafId: string,
  innerNodeId: string,
): FragmentNode {
  return mapLeafContent(root, leafId, (content) => {
    if (!content) return content;
    const merged = mergeNode(content, innerNodeId);
    // If the entire content tree collapsed to a leaf with no componentType, remove content
    if (merged.type === 'leaf' && !merged.componentType) return undefined;
    return merged;
  });
}

/** Update split ratio within the content tree */
export function setContentSplitRatio(
  root: FragmentNode,
  leafId: string,
  innerBranchId: string,
  ratio: number,
): FragmentNode {
  return mapLeafContent(root, leafId, (content) => {
    if (!content) return content;
    return setSplitRatio(content, innerBranchId, ratio);
  });
}

/** Toggle connected state within the content tree */
export function setContentConnected(
  root: FragmentNode,
  leafId: string,
  innerBranchId: string,
  connected: boolean,
): FragmentNode {
  return mapLeafContent(root, leafId, (content) => {
    if (!content) return content;
    return setConnected(content, innerBranchId, connected);
  });
}

/** Remove all content from a leaf */
export function removeContent(
  root: FragmentNode,
  leafId: string,
): FragmentNode {
  return mapLeafContent(root, leafId, () => undefined);
}
