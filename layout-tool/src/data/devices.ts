/**
 * Amazon device configurations.
 * Specs from Figma node 39-326.
 */

export interface DeviceChrome {
  headerHeight: number;      // EDL header height (px)
  headerMarginTop: number;   // space above header
  headerMarginBottom: number; // space below header
}

export interface ContentMargins {
  left: number;
  right: number;
  bottom: number;
}

export interface DeviceConfig {
  id: string;
  name: string;
  codename: string;
  canvas: { width: number; height: number };
  chrome: DeviceChrome;
  contentMargins: ContentMargins;
}

export const devices: DeviceConfig[] = [
  {
    id: 'electra',
    name: 'Echo Show 11"',
    codename: 'Electra',
    canvas: { width: 1440, height: 900 },
    chrome: { headerHeight: 48, headerMarginTop: 24, headerMarginBottom: 24 },
    contentMargins: { left: 48, right: 48, bottom: 48 },
  },
  {
    id: 'hoya',
    name: '15" Display',
    codename: 'Hoya',
    canvas: { width: 1920, height: 1200 },
    chrome: { headerHeight: 48, headerMarginTop: 24, headerMarginBottom: 24 },
    contentMargins: { left: 48, right: 48, bottom: 48 },
  },
  {
    id: 'madeline',
    name: 'Hub 8"',
    codename: 'Madeline',
    canvas: { width: 1024, height: 600 },
    chrome: { headerHeight: 48, headerMarginTop: 24, headerMarginBottom: 24 },
    contentMargins: { left: 36, right: 36, bottom: 36 },
  },
];

export const defaultDevice = devices[0];
