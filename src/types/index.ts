export interface Company {
  id: string;
  address: string;
  companyCode: string;
  companyName: string;
  createdAt: any;
  email: string;
  gstNo: string;
  mobileNo: string;
  userType: string;
}

export interface User {
  id: string;
  companyCode: string;
  companyId: string;
  createdAt: any;
  department: string;
  email: string;
  fullName: string;
  mobileNo: string;
  userType: string;
}

export interface Machine {
  id: string;
  address: string;
  category: string;
  commissioningDate: number;
  company: string;
  createdAt: any;
  equipmentDescription: string;
  isActive: boolean;
  location: string;
  manufacturerModel: string;
  name: string;
}

export interface SensorHistory {
  id: string;
  alarm: string;
  free_heap: number;
  image_url: string | null;
  machineId: string;
  machine_id: string;
  rms_vibration: number;
  temperature: number;
  timestamp: any;
  vibration_velocity: number;
  wifi_rssi: number;
}

export interface DeviceData {
  id: string;
  action: string;
  company: string;
  deviceId: string;
  scannedAt: any;
  serialNumber: string;
}