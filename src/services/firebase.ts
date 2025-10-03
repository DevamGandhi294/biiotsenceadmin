import { collection, getDocs, query, where, orderBy, limit, Timestamp, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Company, User, Machine, SensorHistory, DeviceData } from '../types';

export const getCompanies = async (): Promise<Company[]> => {
  const companiesCol = collection(db, 'companies');
  const companiesSnapshot = await getDocs(companiesCol);
  return companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
};

// Permanently delete a user by id from the 'users' collection
export const deleteUserById = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};

export const getUsersByCompany = async (companyCode: string): Promise<User[]> => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('companyCode', '==', companyCode));
  const usersSnapshot = await getDocs(q);
  return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const getMachines = async (): Promise<Machine[]> => {
  const machinesCol = collection(db, 'machines');
  const machinesSnapshot = await getDocs(machinesCol);
  return machinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Machine));
};

export const getSensorHistory = async (
  machineId?: string,
  options?: {
    from?: Date;
    to?: Date;
    limitCount?: number;
  }
): Promise<SensorHistory[]> => {
  const sensorCol = collection(db, 'machines', machineId || 'TES002', 'sensorHistory');

  const constraints: any[] = [];
  // Order by timestamp for range queries
  constraints.push(orderBy('timestamp', 'desc'));

  if (options?.from) {
    constraints.push(where('timestamp', '>=', Timestamp.fromDate(options.from)));
  }
  if (options?.to) {
    constraints.push(where('timestamp', '<=', Timestamp.fromDate(options.to)));
  }
  constraints.push(limit(options?.limitCount ?? 100));

  const q = query(sensorCol, ...constraints);
  const sensorSnapshot = await getDocs(q);
  return sensorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SensorHistory));
};

export const getDeviceData = async (): Promise<DeviceData[]> => {
  const deviceCol = collection(db, 'deviceData');
  const deviceSnapshot = await getDocs(deviceCol);
  return deviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeviceData));
};

// Update a user document by id
export const updateUser = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updates as any);
};

// Move a verified user back to pending_users and remove from users
export const moveUserToPending = async (user: User): Promise<void> => {
  const pendingCol = collection(db, 'pending_users');
  // Prepare payload for pending_users
  const payload: any = {
    companyCode: (user as any).companyCode,
    createdAt: (user as any).createdAt || Timestamp.now(),
    department: (user as any).department,
    email: (user as any).email,
    fullName: (user as any).fullName,
    mobileNo: (user as any).mobileNo,
    status: 'pending_verification',
    userType: (user as any).userType || 'user',
  };
  await addDoc(pendingCol, payload);
  // Delete from users collection
  if ((user as any).id) {
    const userRef = doc(db, 'users', (user as any).id);
    await deleteDoc(userRef);
  }
};
