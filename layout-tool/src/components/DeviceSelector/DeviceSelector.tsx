import { useLayoutStore } from '../../hooks/useLayoutStore';
import { devices } from '../../data/devices';
import styles from './DeviceSelector.module.css';

export function DeviceSelector() {
  const { device, setDevice } = useLayoutStore();

  return (
    <div className={styles.wrapper}>
      {devices.map((d) => (
        <button
          key={d.id}
          className={`${styles.device} ${d.id === device.id ? styles.active : ''}`}
          onClick={() => setDevice(d.id)}
        >
          <span className={styles.codename}>{d.codename}</span>
          <span className={styles.size}>{d.canvas.width}x{d.canvas.height}</span>
        </button>
      ))}
    </div>
  );
}
