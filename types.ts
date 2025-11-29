export interface PlateData {
  truck: string;
  mooc: string;
}

export interface ScanResult {
  truck: string | null;
  mooc: string | null;
  raw: string;
}

export enum AppMode {
  DRIVER = 'DRIVER',
  STAFF = 'STAFF'
}

export interface OCRResponse {
  text: string;
  error?: string;
}