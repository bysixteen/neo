/**
 * Amazon device configurations.
 * Electra dimensions confirmed. Others are placeholders pending device document.
 */

export interface DeviceConfig {
  id: string;
  name: string;
  codename: string;
  canvas: { width: number; height: number };
}

export const devices: DeviceConfig[] = [
  {
    id: 'electra',
    name: 'Echo Show 11"',
    codename: 'Electra',
    canvas: { width: 1440, height: 900 },
  },
  {
    id: 'hoya',
    name: '15" Display',
    codename: 'Hoya',
    canvas: { width: 1920, height: 1200 },   // placeholder
  },
  {
    id: 'madeline',
    name: 'Hub 8"',
    codename: 'Madeline',
    canvas: { width: 1024, height: 600 },     // placeholder
  },
];

export const defaultDevice = devices[0];
