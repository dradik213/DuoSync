import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount, SharedHub, UserGender, getPronounInfo, PronounInfo } from '../types/auth';
import { UserColorTheme, getUserColorTheme } from '../utils/calendarUtils';
import { 
  createHubInFirestore, 
  findHubByInviteCode, 
  joinHubInFirestore, 
  subscribeToHub,
  updateHubInFirestore,
  saveUserToFirestore,
  db
} from '../utils/firebaseService';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserAccount | null;
  currentHub: SharedHub | null;
  partnerUser: UserAccount | null;
  userPronouns: PronounInfo;
  partnerPronouns: PronounInfo;
  coupleViewLabel: string;
  partner1Label: string;
  partner2Label: string;
  partner1Initial: string;
  partner2Initial: string;
  partner1DisplayName: string;
  partner2DisplayName: string;
  user1Theme: UserColorTheme;
  user2Theme: UserColorTheme;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginAsAdmin: () => Promise<{ success: boolean; error?: string }>;
  register: (params: {
    name: string;
    email: string;
    gender: UserGender;
    customPronoun?: string;
    avatarColor?: string;
    hubChoice: 'create' | 'join';
    inviteCode?: string;
    hubName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  joinHubWithCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserAccount>) => void;
  updateHubName: (name: string) => void;
  addPartnerToHub: (partnerData: { name: string; email: string; gender: UserGender }) => void;
  clearAllHubData: () => void;
  hubs: SharedHub[];
  switchHub: (hubId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'duosync_users';
const HUBS_STORAGE_KEY = 'duosync_hubs';
const CURRENT_USER_KEY = 'duosync_current_user_id';

// Default Admin Test Account for testing without having to create an account each time
export const DEFAULT_ADMIN_USER: UserAccount = {
  id: 'usr-admin-001',
  name: 'Admin Tester',
  email: 'admin@duosync.app',
  gender: 'female',
  avatarColor: 'bg-blue-600',
  hubId: 'hub-admin-default',
  role: 'owner',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEFAULT_PARTNER_USER: UserAccount = {
  id: 'usr-admin-partner-002',
  name: 'Alex',
  email: 'alex@duosync.app',
  gender: 'male',
  avatarColor: 'bg-purple-600',
  hubId: 'hub-admin-default',
  role: 'partner',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEFAULT_ADMIN_HUB: SharedHub = {
  id: 'hub-admin-default',
  name: 'Admin Shared Hub',
  inviteCode: 'ADMIN-SYNC',
  members: [DEFAULT_ADMIN_USER, DEFAULT_PARTNER_USER],
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = [...parsed];
          if (!list.some((u: UserAccount) => u.email.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase())) {
            list.push(DEFAULT_ADMIN_USER);
          }
          if (!list.some((u: UserAccount) => u.email.toLowerCase() === DEFAULT_PARTNER_USER.email.toLowerCase())) {
            list.push(DEFAULT_PARTNER_USER);
          }
          return list;
        }
      }
    } catch (e) {}
    return [DEFAULT_ADMIN_USER, DEFAULT_PARTNER_USER];
  });

  const [hubs, setHubs] = useState<SharedHub[]>(() => {
    try {
      const saved = localStorage.getItem(HUBS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = [...parsed];
          if (!list.some((h: SharedHub) => h.id === DEFAULT_ADMIN_HUB.id)) {
            list.push(DEFAULT_ADMIN_HUB);
          }
          return list;
        }
      }
    } catch (e) {}
    return [DEFAULT_ADMIN_HUB];
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const id = localStorage.getItem(CURRENT_USER_KEY);
      return id || DEFAULT_ADMIN_USER.id;
    } catch (e) {
      return DEFAULT_ADMIN_USER.id;
    }
  });

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(HUBS_STORAGE_KEY, JSON.stringify(hubs));
    } catch (e) {}
  }, [hubs]);

  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(CURRENT_USER_KEY, currentUserId);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {}
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const currentHub = hubs.find((h) => h.id === currentUser?.hubId) || null;
  
  // The partner is the other user in the same hub
  const partnerUser = (currentHub?.members.find((m) => m.id !== currentUser?.id) || null)
    ? users.find((u) => u.id === currentHub?.members.find((m) => m.id !== currentUser?.id)?.id) || null
    : null;

  const userPronouns = currentUser 
    ? getPronounInfo(currentUser.gender, currentUser.customPronoun)
    : getPronounInfo('female');

  const partnerPronouns = partnerUser
    ? getPronounInfo(partnerUser.gender, partnerUser.customPronoun)
    : getPronounInfo('female');

  // Dynamic Couple View reference: e.g. "Her / Her", "Her / His", "His / His", "Their / Her"
  let coupleViewLabel = 'Couple View';
  if (currentUser && partnerUser) {
    coupleViewLabel = `${userPronouns.shortLabel} / ${partnerPronouns.shortLabel}`;
  } else if (currentUser) {
    coupleViewLabel = `${userPronouns.shortLabel} & Partner`;
  }

  // Label for User 1 & Partner 2
  // When both users have the same gender (e.g. both Her), distinguish by name: "Her (Sarah)" & "Her (Emma)"
  const isSamePronoun = currentUser && partnerUser && userPronouns.shortLabel === partnerPronouns.shortLabel;
  const partner1Label = currentUser 
    ? (isSamePronoun ? `${userPronouns.shortLabel} (${currentUser.name})` : userPronouns.possessive)
    : 'Hers';
  const partner2Label = partnerUser 
    ? (isSamePronoun ? `${partnerPronouns.shortLabel} (${partnerUser.name})` : partnerPronouns.possessive)
    : 'Partner';

  const partner1Initial = currentUser?.name?.trim() 
    ? currentUser.name.trim().charAt(0).toUpperCase() 
    : 'U';
  const partner2Initial = partnerUser?.name?.trim() 
    ? partnerUser.name.trim().charAt(0).toUpperCase() 
    : 'P';
  const partner1DisplayName = currentUser?.name || partner1Label;
  const partner2DisplayName = partnerUser?.name || partner2Label;

  // Dynamic color theme referencing color specified in user's profile
  // User 1 is currentUser (on left side of slider)
  const user1Theme = getUserColorTheme(
    currentUser?.avatarColor,
    currentUser?.gender === 'male' ? 'blue' : 'purple'
  );

  // User 2 is partnerUser (on right side of slider)
  const user2Theme = getUserColorTheme(
    partnerUser?.avatarColor,
    user1Theme.name === 'Blue' ? 'purple' : 'blue'
  );

  // Real-time synchronization for active couple hub across devices
  useEffect(() => {
    if (!currentHub?.id || currentHub.id === 'hub-admin-default') return;
    const unsub = subscribeToHub(currentHub.id, (remoteHub) => {
      setHubs((prev) => {
        const idx = prev.findIndex((h) => h.id === remoteHub.id);
        if (idx === -1) return [...prev, remoteHub];
        const next = [...prev];
        next[idx] = { ...next[idx], ...remoteHub };
        return next;
      });

      // Sync members into users state so partnerUser instantly reflects on both screens
      if (remoteHub.members && remoteHub.members.length > 0) {
        setUsers((prev) => {
          const nextUsers = [...prev];
          remoteHub.members.forEach((m) => {
            const uIdx = nextUsers.findIndex((u) => u.id === m.id || u.email.toLowerCase() === m.email.toLowerCase());
            if (uIdx === -1) {
              nextUsers.push(m);
            } else {
              nextUsers[uIdx] = { ...nextUsers[uIdx], ...m };
            }
          });
          return nextUsers;
        });
      }
    });

    return () => unsub();
  }, [currentHub?.id]);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      // Check Firestore in case user registered on another device
      try {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const uData = snap.docs[0].data() as UserAccount;
          found = uData;
          if (uData.hubId) {
            const hSnap = await getDoc(doc(db, 'hubs', uData.hubId));
            if (hSnap.exists()) {
              const hData = hSnap.data() as SharedHub;
              setHubs((prev) => [...prev.filter((h) => h.id !== hData.id), hData]);
            }
          }
          setUsers((prev) => [...prev.filter((u) => u.id !== uData.id), uData]);
        }
      } catch (e) {
        console.warn('Firestore user fetch check:', e);
      }
    }

    if (!found) {
      return { success: false, error: 'Account not found with this email. Please create an account or verify your invite code.' };
    }
    setCurrentUserId(found.id);
    return { success: true };
  };

  const loginAsAdmin = async () => {
    return login('admin@duosync.app');
  };

  const register = async ({
    name,
    email,
    gender,
    customPronoun,
    avatarColor,
    hubChoice,
    inviteCode,
    hubName,
  }: {
    name: string;
    email: string;
    gender: UserGender;
    customPronoun?: string;
    avatarColor?: string;
    hubChoice: 'create' | 'join';
    inviteCode?: string;
    hubName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account already exists with this email. Please sign in.' };
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const defaultColors = [
      'bg-purple-600',
      'bg-indigo-600',
      'bg-sky-600',
      'bg-teal-600',
      'bg-emerald-600',
      'bg-amber-600',
      'bg-rose-600',
    ];
    const finalAvatarColor = avatarColor || defaultColors[users.length % defaultColors.length];

    if (hubChoice === 'join' && inviteCode) {
      const cleanCode = inviteCode.trim().toUpperCase();

      // Look up in Firestore across devices so partner's device connects to the exact same hub
      let remoteHub: SharedHub | null = null;
      try {
        remoteHub = await findHubByInviteCode(cleanCode);
      } catch (err) {
        console.warn('Firestore hub lookup warning:', err);
      }

      // Fallback to local hubs if offline or cached
      const targetHub = remoteHub || hubs.find((h) => h.inviteCode.toUpperCase() === cleanCode);

      if (!targetHub) {
        return { 
          success: false, 
          error: `Invite code "${cleanCode}" not found. Please verify the code with your partner.` 
        };
      }

      const targetHubId = targetHub.id;
      const newUserObj: UserAccount = {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        gender,
        customPronoun,
        avatarColor: finalAvatarColor,
        hubId: targetHubId,
        role: 'partner',
        createdAt: new Date().toISOString(),
      };

      // Write join record to Firestore so creator receives live update
      try {
        await joinHubInFirestore(targetHubId, newUserObj);
      } catch (err) {
        console.warn('Firestore join error:', err);
      }

      // Update local state
      const updatedHubs = hubs.map((h) => {
        if (h.id === targetHubId) {
          return {
            ...h,
            members: [...h.members.filter((m) => m.id !== userId), newUserObj],
          };
        }
        return h;
      });

      if (!updatedHubs.some((h) => h.id === targetHubId)) {
        updatedHubs.push({
          ...targetHub,
          members: [...targetHub.members.filter((m) => m.id !== userId), newUserObj],
        });
      }

      setHubs(updatedHubs);
      setUsers((prev) => [...prev.filter((u) => u.id !== userId), newUserObj]);
      setCurrentUserId(userId);
      return { success: true };
    } else {
      // Create new isolated hub
      const targetHubId = `hub-${Date.now()}`;
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      const newInviteCode = `DUO-${codeSuffix}`;
      
      const newUserObj: UserAccount = {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        gender,
        customPronoun,
        avatarColor: finalAvatarColor,
        hubId: targetHubId,
        role: 'owner',
        createdAt: new Date().toISOString(),
      };

      const newHub: SharedHub = {
        id: targetHubId,
        name: hubName?.trim() || `${name.trim()}'s Couple Hub`,
        inviteCode: newInviteCode,
        members: [newUserObj],
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore so partner can look up this invite code from another device
      try {
        await createHubInFirestore(newHub, newUserObj);
      } catch (err) {
        console.warn('Firestore hub create error:', err);
      }

      setHubs((prev) => [...prev, newHub]);
      setUsers((prev) => [...prev, newUserObj]);
      setCurrentUserId(userId);
      return { success: true };
    }
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const switchUser = (userId: string) => {
    if (users.some((u) => u.id === userId)) {
      setCurrentUserId(userId);
    }
  };

  const joinHubWithCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    const cleanCode = code.trim().toUpperCase();

    // Query Firestore for hub
    let targetHub: SharedHub | null = null;
    try {
      targetHub = await findHubByInviteCode(cleanCode);
    } catch (err) {
      console.warn('Firestore hub lookup warning:', err);
    }

    if (!targetHub) {
      targetHub = hubs.find((h) => h.inviteCode.toUpperCase() === cleanCode) || null;
    }

    if (!targetHub) {
      return { success: false, error: `No shared hub found with invite code "${cleanCode}".` };
    }

    if (targetHub.id === currentUser.hubId) {
      return { success: false, error: 'You are already in this hub!' };
    }

    const updatedUser = { ...currentUser, hubId: targetHub.id, role: 'partner' as const };
    try {
      await joinHubInFirestore(targetHub.id, updatedUser);
    } catch (err) {
      console.warn('Firestore join error:', err);
    }

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    const updatedHubs = hubs.map((h) => {
      if (h.id === targetHub.id) {
        return {
          ...h,
          members: [...h.members.filter((m) => m.id !== currentUser.id), updatedUser],
        };
      }
      return h;
    });

    if (!updatedHubs.some((h) => h.id === targetHub.id)) {
      updatedHubs.push({
        ...targetHub,
        members: [...targetHub.members.filter((m) => m.id !== currentUser.id), updatedUser],
      });
    }

    setUsers(updatedUsers);
    setHubs(updatedHubs);
    return { success: true };
  };

  const updateProfile = (updates: Partial<UserAccount>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setUsers((prev) => {
      const newUsers = prev.map((u) => (u.id === currentUser.id ? updatedUser : u));
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
      } catch (e) {}
      return newUsers;
    });
    setHubs((prev) => {
      const newHubs = prev.map((h) => {
        if (h.id === currentUser.hubId) {
          return {
            ...h,
            members: h.members.map((m) => (m.id === currentUser.id ? updatedUser : m)),
          };
        }
        return h;
      });
      try {
        localStorage.setItem(HUBS_STORAGE_KEY, JSON.stringify(newHubs));
      } catch (e) {}
      return newHubs;
    });
    try {
      saveUserToFirestore(updatedUser).catch((err) => {
        console.warn('Failed to save user profile in Firestore:', err);
      });
    } catch (e) {}
  };

  const updateHubName = (name: string) => {
    if (!currentHub) return;
    const cleanName = name.trim();
    if (!cleanName) return;
    setHubs((prev) =>
      prev.map((h) => (h.id === currentHub.id ? { ...h, name: cleanName } : h))
    );
    try {
      updateHubInFirestore(currentHub.id, { name: cleanName }).catch((err) => {
        console.warn('Failed to update hub name in Firestore:', err);
      });
    } catch (e) {}
  };

  // Quick helper to add/simulate partner for preview/testing
  const addPartnerToHub = ({
    name,
    email,
    gender,
  }: {
    name: string;
    email: string;
    gender: UserGender;
  }) => {
    if (!currentHub || !currentUser) return;
    const partnerId = `usr-partner-${Date.now()}`;
    const newPartner: UserAccount = {
      id: partnerId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      gender,
      avatarColor: 'bg-emerald-500',
      hubId: currentHub.id,
      role: 'partner',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev.filter((u) => u.email !== newPartner.email), newPartner]);
    setHubs((prev) =>
      prev.map((h) => {
        if (h.id === currentHub.id) {
          return {
            ...h,
            members: [...h.members.filter((m) => m.id !== partnerId), newPartner],
          };
        }
        return h;
      })
    );
  };

  const clearAllHubData = () => {
    try {
      localStorage.removeItem('hub_events');
      localStorage.removeItem('hub_stays');
      localStorage.removeItem('hub_fridge_photos');
    } catch (e) {}
  };

  const switchHub = (hubId: string) => {
    if (!currentUser) return;
    const targetHub = hubs.find((h) => h.id === hubId);
    if (!targetHub) return;
    const updatedUser: UserAccount = { ...currentUser, hubId: targetHub.id };
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === currentUser.id ? updatedUser : u));
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentHub,
        partnerUser,
        userPronouns,
        partnerPronouns,
        coupleViewLabel,
        partner1Label,
        partner2Label,
        partner1Initial,
        partner2Initial,
        partner1DisplayName,
        partner2DisplayName,
        user1Theme,
        user2Theme,
        login,
        loginAsAdmin,
        register,
        logout,
        switchUser,
        joinHubWithCode,
        updateProfile,
        updateHubName,
        addPartnerToHub,
        clearAllHubData,
        hubs,
        switchHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
