import styles from './GridOverlay.module.css';

interface Props {
  width: number;
  height: number;
  gridSize: number;
  color?: string;
  opacity?: number;
}

/**
 * SVG line grid overlay. Renders horizontal and vertical lines
 * at the given interval across the full canvas.
 */
export function GridOverlay({
  width,
  height,
  gridSize,
  color = '#07BDFF',
  opacity = 0.04,
}: Props) {
  const cols = Math.floor(width / gridSize);
  const rows = Math.floor(height / gridSize);

  return (
    <svg
      className={styles.overlay}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Vertical lines */}
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={i * gridSize}
          y1={0}
          x2={i * gridSize}
          y2={height}
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth={1}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={i * gridSize}
          x2={width}
          y2={i * gridSize}
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
