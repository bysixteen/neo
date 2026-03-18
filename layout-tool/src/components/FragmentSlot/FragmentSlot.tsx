import { motion } from 'framer-motion';
import type { Slot } from '../../utils/gridToSlots';
import type { CornerRadii } from '../../utils/calculateRadii';
import styles from './FragmentSlot.module.css';

interface Props {
  slot: Slot;
  radii: CornerRadii;
  positionMode: string;
  selected?: boolean;
  onClick?: () => void;
}

export function FragmentSlot({ slot, radii, positionMode, selected, onClick }: Props) {
  return (
    <motion.div
      className={`${styles.slot} ${selected ? styles.selected : ''}`}
      style={{
        borderRadius: `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px`,
      }}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
    >
      <div className={styles.inner}>
        <span className={styles.label}>{slot.label}</span>
        <span className={styles.mode}>{positionMode}</span>
      </div>
    </motion.div>
  );
}
