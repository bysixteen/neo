import { useLayoutStore } from '../../hooks/useLayoutStore';
import styles from './GridSelector.module.css';

interface Variant {
  id: string;
  label: string;
  cols: number;
  rows: number;
  // SVG slot rects [x, y, w, h] in a 36×24 viewBox
  rects: [number, number, number, number][];
}

const VARIANTS: Variant[] = [
  {
    id: 'single',
    label: 'Single',
    cols: 1,
    rows: 1,
    rects: [[0, 0, 36, 24]],
  },
  {
    id: 'pair-h',
    label: 'Pair H',
    cols: 2,
    rows: 1,
    rects: [[0, 0, 17, 24], [19, 0, 17, 24]],
  },
  {
    id: 'pair-v',
    label: 'Pair V',
    cols: 1,
    rows: 2,
    rects: [[0, 0, 36, 11], [0, 13, 36, 11]],
  },
  {
    id: 'trio-h',
    label: 'Trio H',
    cols: 3,
    rows: 1,
    rects: [[0, 0, 11, 24], [13, 0, 10, 24], [25, 0, 11, 24]],
  },
  {
    id: 'trio-v',
    label: 'Trio V',
    cols: 1,
    rows: 3,
    rects: [[0, 0, 36, 7], [0, 9, 36, 6], [0, 17, 36, 7]],
  },
  {
    id: 'grid-2x2',
    label: '2×2',
    cols: 2,
    rows: 2,
    rects: [[0, 0, 17, 11], [19, 0, 17, 11], [0, 13, 17, 11], [19, 13, 17, 11]],
  },
];

export function GridSelector() {
  const { cols, rows, setGrid } = useLayoutStore();

  const activeId = VARIANTS.find((v) => v.cols === cols && v.rows === rows)?.id;

  return (
    <div className={styles.wrapper}>
      {VARIANTS.map((v) => (
        <button
          key={v.id}
          className={`${styles.variant} ${v.id === activeId ? styles.active : ''}`}
          onClick={() => setGrid(v.cols, v.rows)}
          title={v.label}
          aria-label={v.label}
          aria-pressed={v.id === activeId}
        >
          <svg
            className={styles.icon}
            viewBox="0 0 36 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {v.rects.map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="currentColor" />
            ))}
          </svg>
          <span className={styles.label}>{v.label}</span>
        </button>
      ))}
    </div>
  );
}
