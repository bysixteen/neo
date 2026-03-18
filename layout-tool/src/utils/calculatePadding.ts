import { spacing } from '../data/tokens';

/**
 * Calculate the gap value for a Fragment Group based on connectivity.
 * Replaces the per-side padding model — gap is uniform across the group.
 */
export function calculateGap(connected: boolean): number {
  return connected ? spacing.connected : spacing.unconnected;
}

/**
 * Token name for a gap value.
 */
export function gapTokenName(connected: boolean): string {
  return connected ? 'spacing/connected' : 'spacing/unconnected';
}
