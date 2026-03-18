import type { Edge } from '../../utils/gridToSlots';
import styles from './ConnectivityToggle.module.css';

interface Props {
  edge: Edge;
  onToggle: (edgeId: string) => void;
  style: React.CSSProperties;
}

export function ConnectivityToggle({ edge, onToggle, style }: Props) {
  return (
    <button
      className={`${styles.toggle} ${styles[edge.axis]} ${edge.connected ? styles.connected : ''}`}
      style={style}
      onClick={() => onToggle(edge.id)}
      aria-label={`${edge.connected ? 'Disconnect' : 'Connect'} ${edge.slotA} and ${edge.slotB}`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        {!edge.connected && (
          <path d="M6 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
