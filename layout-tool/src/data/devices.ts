/**
 * Amazon device configurations.
 * Electra dimensions confirmed. Others are placeholders pending device document.
 * Chrome heights are placeholders — measure from Figma node 39-326 to confirm.
 */

export interface DeviceChrome {
  headerHeight: number;    // EDL header + status bar (px at device resolution)
  utilityBarHeight: number; // utility bar (px at device resolution)
}

export interface DeviceConfig {
  id: string;
  name: string;
  codename: string;
  canvas: { width: number; height: number };
  chrome: DeviceChrome;
}

export const devices: DeviceConfig[] = [
  {
    id: 'electra',
    name: 'Echo Show 11"',
    codename: 'Electra',
    canvas: { width: 1440, height: 900 },
    chrome: { headerHeight: 72, utilityBarHeight: 60 }, // placeholder — verify against Figma node 39-326
  },
  {
    id: 'hoya',
    name: '15" Display',
    codename: 'Hoya',
    canvas: { width: 1920, height: 1200 }, // placeholder
    chrome: { headerHeight: 72, utilityBarHeight: 60 }, // placeholder
  },
  {
    id: 'madeline',
    name: 'Hub 8"',
    codename: 'Madeline',
    canvas: { width: 1024, height: 600 }, // placeholder
    chrome: { headerHeight: 60, utilityBarHeight: 48 }, // placeholder
  },
];

export const defaultDevice = devices[0];
