import React, { createContext, useContext, useState, useEffect } from 'react';
import { DepartmentType } from '../types';

export type UserRole = 'CITIZEN' | 'ADMIN' | 'OFFICER';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  department?: DepartmentType;
  title: string;
  ward?: string;
  phone: string;
  email: string;
  badgeNumber?: string;
}

export const PRESET_PROFILES: Record<string, UserProfile> = {
  citizen: {
    id: 'usr-cit-1',
    name: 'Priya Sharma',
    role: 'CITIZEN',
    title: 'Resident Citizen',
    ward: 'Ward 08 - Shivajinagar & FC Road',
    phone: '+91 98201 55667',
    email: 'priya.sharma@example.com'
  },
  admin: {
    id: 'usr-adm-1',
    name: 'Dr. Amitabh Sen, IAS',
    role: 'ADMIN',
    title: 'Municipal Commissioner & Administrator (PMC)',
    phone: '+91 98200 00001',
    email: 'commissioner@punecorporation.org',
    badgeNumber: 'PMC-IAS-01'
  },
  roads_officer: {
    id: 'usr-off-roads',
    name: 'Eng. Suresh Patil',
    role: 'OFFICER',
    department: 'Roads & Infrastructure',
    title: 'Senior Executive Engineer (Roads Pune)',
    ward: 'Ward 12 - Kothrud',
    phone: '+91 98200 11223',
    email: 'suresh.patil@punecorporation.org',
    badgeNumber: 'PMC-RD-884'
  },
  water_officer: {
    id: 'usr-off-water',
    name: 'Vinod Joshi',
    role: 'OFFICER',
    department: 'Water Supply & Sewerage',
    title: 'Chief Water Works Inspector (PMC)',
    ward: 'Ward 03 - Viman Nagar',
    phone: '+91 98333 44556',
    email: 'vinod.joshi@punecorporation.org',
    badgeNumber: 'PMC-WTR-042'
  },
  sanitation_officer: {
    id: 'usr-off-waste',
    name: 'Mohd. Tariq',
    role: 'OFFICER',
    department: 'Solid Waste & Sanitation',
    title: 'Sanitary Superintendent (PMC)',
    ward: 'Ward 15 - Hadapsar',
    phone: '+91 98211 99001',
    email: 'tariq.swm@punecorporation.org',
    badgeNumber: 'PMC-SWM-14'
  },
  electricity_officer: {
    id: 'usr-off-elec',
    name: 'K. R. Nair',
    role: 'OFFICER',
    department: 'Electricity & Power',
    title: 'Junior Electrical Engineer (MSEDCL/PMC)',
    ward: 'Ward 09 - Aundh & Baner',
    phone: '+91 98400 66778',
    email: 'kr.nair@punecorporation.org',
    badgeNumber: 'PMC-ELEC-09'
  }
};

interface RoleContextType {
  currentProfile: UserProfile;
  activeKey: string;
  switchProfile: (key: string) => void;
  isCitizen: boolean;
  isAdmin: boolean;
  isOfficer: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeKey, setActiveKey] = useState<string>(() => {
    return localStorage.getItem('civicpulse_active_role') || 'citizen';
  });

  const [currentProfile, setCurrentProfile] = useState<UserProfile>(
    PRESET_PROFILES[activeKey] || PRESET_PROFILES.citizen
  );

  const switchProfile = (key: string) => {
    if (PRESET_PROFILES[key]) {
      setActiveKey(key);
      setCurrentProfile(PRESET_PROFILES[key]);
      localStorage.setItem('civicpulse_active_role', key);
    }
  };

  useEffect(() => {
    setCurrentProfile(PRESET_PROFILES[activeKey] || PRESET_PROFILES.citizen);
  }, [activeKey]);

  return (
    <RoleContext.Provider
      value={{
        currentProfile,
        activeKey,
        switchProfile,
        isCitizen: currentProfile.role === 'CITIZEN',
        isAdmin: currentProfile.role === 'ADMIN',
        isOfficer: currentProfile.role === 'OFFICER'
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
