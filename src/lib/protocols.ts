export interface WasteProtocol {
  color: string;
  bin: string;
  co2: number;
  instruction: string;
  hazardous: boolean;
}

export const PROTOCOLS: Record<string, WasteProtocol> = {
  Syringe: { color: 'hazard', bin: 'Red Sharps Bin', co2: 0.5, instruction: 'Dispose in puncture-proof sharps box immediately.', hazardous: true },
  Gauze: { color: 'warning', bin: 'Yellow Clinical Bin', co2: 0.2, instruction: 'Place in yellow biohazard bag and seal.', hazardous: true },
  Gloves: { color: 'warning', bin: 'Yellow Clinical Bin', co2: 0.1, instruction: 'Standard infectious waste procedure.', hazardous: true },
  Mask: { color: 'safe', bin: 'Blue Recycling Bin', co2: -0.1, instruction: 'Remove straps and place in recyclables.', hazardous: false },
  Paper: { color: 'safe', bin: 'Blue Recycling Bin', co2: -0.3, instruction: 'Clean paper packaging only.', hazardous: false },
  default: { color: 'muted', bin: 'General Waste', co2: 0, instruction: 'General non-clinical disposal.', hazardous: false },
};

export interface ScanEntry {
  type: string;
  confidence: number;
  timestamp: number;
  isMock?: boolean;
}

export const MOCK_ENTRIES: ScanEntry[] = [
  { type: 'Syringe', confidence: 99.12, timestamp: Date.now() - 300000, isMock: true },
  { type: 'Gauze', confidence: 97.45, timestamp: Date.now() - 900000, isMock: true },
  { type: 'Gloves', confidence: 98.76, timestamp: Date.now() - 1500000, isMock: true },
  { type: 'Mask', confidence: 98.20, timestamp: Date.now() - 2100000, isMock: true },
  { type: 'Syringe', confidence: 96.88, timestamp: Date.now() - 3300000, isMock: true },
  { type: 'Paper', confidence: 99.89, timestamp: Date.now() - 4200000, isMock: true },
  { type: 'Gauze', confidence: 95.34, timestamp: Date.now() - 5400000, isMock: true },
  { type: 'Gloves', confidence: 97.62, timestamp: Date.now() - 6600000, isMock: true },
  { type: 'Syringe', confidence: 99.45, timestamp: Date.now() - 7800000, isMock: true },
  { type: 'Mask', confidence: 96.71, timestamp: Date.now() - 9000000, isMock: true },
  { type: 'Paper', confidence: 98.12, timestamp: Date.now() - 10800000, isMock: true },
  { type: 'Gauze', confidence: 97.89, timestamp: Date.now() - 12600000, isMock: true },
];

export type UserRole = 'audit_manager' | 'hospital_staff' | 'common';

export interface AppUser {
  email: string;
  role: UserRole;
}
