import { useState } from 'react';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import styles from './GridSelector.module.css';

const MAX_COLS = 4;
const MAX_ROWS = 4;

export function GridSelector() {
  const { cols, rows, setGrid } = useLayoutStore();
  const [hoverCol, setHoverCol] = useState(-1);
  const [hoverRow, setHoverRow] = useState(-1);

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>
        {hoverCol >= 0 ? `${hoverCol + 1} × ${hoverRow + 1}` : `${cols} × ${rows}`}
      </span>
      <div
        className={styles.grid}
        onMouseLeave={() => { setHoverCol(-1); setHoverRow(-1); }}
      >
        {Array.from({ length: MAX_ROWS }, (_, r) =>
          Array.from({ length: MAX_COLS }, (_, c) => {
            const isHighlighted = c <= hoverCol && r <= hoverRow;
            const isActive = c < cols && r < rows && hoverCol < 0;

            return (
              <button
                key={`${r}-${c}`}
                className={`${styles.cell} ${isHighlighted ? styles.highlighted : ''} ${isActive ? styles.active : ''}`}
                onMouseEnter={() => { setHoverCol(c); setHoverRow(r); }}
                onClick={() => setGrid(c + 1, r + 1)}
                aria-label={`${c + 1} columns by ${r + 1} rows`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
