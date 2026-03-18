/**
 * Device configurations for the layout tool.
 */

export interface DeviceChrome {
  headerHeight: number;      // header height (px)
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
  canvas: { width: number; height: number };
  chrome: DeviceChrome;
  contentMargins: ContentMargins;
}

export const devices: DeviceConfig[] = [
  {
    id: 'display-11',
    name: '11" Display (1440x900)',
    canvas: { width: 1440, height: 900 },
    chrome: { headerHeight: 48, headerMarginTop: 24, headerMarginBottom: 24 },
    contentMargins: { left: 48, right: 48, bottom: 48 },
  },
  {
    id: 'display-15',
    name: '15" Display (1920x1200)',
    canvas: { width: 1920, height: 1200 },
    chrome: { headerHeight: 48, headerMarginTop: 24, headerMarginBottom: 24 },
    contentMargins: { left: 48, right: 48, bottom: 48 },
  },
  {
    id: 'display-8',
    name: '8" Display (1024x600)',
    canvas: { width: 1024, height: 600 },
    chrome: { headerHeight: 48, headerMarginTop: 24, headerMarginBottom: 24 },
    contentMargins: { left: 36, right: 36, bottom: 36 },
  },
];

export const defaultDevice = devices[0];
