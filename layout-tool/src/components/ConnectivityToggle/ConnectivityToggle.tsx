import { motion } from 'framer-motion';
import type { Edge } from '../../utils/gridToSlots';
import styles from './ConnectivityToggle.module.css';

interface Props {
  edge: Edge;
  onToggle: (edgeId: string) => void;
  /** Position in px within the canvas */
  style: React.CSSProperties;
}

export function ConnectivityToggle({ edge, onToggle, style }: Props) {
  return (
    <motion.button
      className={`${styles.toggle} ${styles[edge.axis]} ${edge.connected ? styles.connected : ''}`}
      style={style}
      onClick={() => onToggle(edge.id)}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`${edge.connected ? 'Disconnect' : 'Connect'} ${edge.slotA} and ${edge.slotB}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        {edge.connected ? (
          // Link icon when connected
          <>
            <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </>
        ) : (
          // Plus icon when disconnected
          <>
            <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
      </svg>
    </motion.button>
  );
}
