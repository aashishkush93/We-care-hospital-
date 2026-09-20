import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  UserProfile,
} from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPass: (email: string, pass: string) => Promise<void>;
  signupWithEmailPass: (email: string, pass: string, name: string) => Promise<void>;
  loginAsDemoPatient: () => void;
  loginAsAdminUser: () => void;
  logout: () => Promise<void>;
  isGuestBrowsing: boolean;
  enterAsGuest: () => void;
  openAuthModal: () => void;
  isAuthModalOpen: boolean;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestBrowsing, setIsGuestBrowsing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check if there was an active admin session first
    const savedAdmin = localStorage.getItem('wecare_admin_session');
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        if (parsed.user && parsed.profile) {
          setCurrentUser(parsed.user);
          setUserProfile(parsed.profile);
          setIsGuestBrowsing(false);
          setLoading(false);
        }
      } catch (e) {
        localStorage.removeItem('wecare_admin_session');
      }
    }

    // Check if there was an active demo patient session
    const savedDemo = localStorage.getItem('wecare_demo_session');
    if (savedDemo && !savedAdmin) {
      try {
        const parsed = JSON.parse(savedDemo);
        if (parsed.user && parsed.profile) {
          setCurrentUser(parsed.user);
          setUserProfile(parsed.profile);
          setIsGuestBrowsing(false);
          setLoading(false);
        }
      } catch (e) {
        localStorage.removeItem('wecare_demo_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.removeItem('wecare_demo_session');
        localStorage.removeItem('wecare_admin_session');
        setCurrentUser(user);
        setIsGuestBrowsing(false);
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            if (user.email === 'aashish@gmail.com') {
              data.role = 'admin';
            }
            setUserProfile(data);
          } else {
            setUserProfile({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || (user.email === 'aashish@gmail.com' ? 'Aashish (Administrator)' : 'Patient'),
              photoURL: user.photoURL,
              role: user.email === 'aashish@gmail.com' ? 'admin' : 'patient',
            });
          }
        } catch (err) {
          console.error('Error loading profile:', err);
          setUserProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || (user.email === 'aashish@gmail.com' ? 'Aashish (Administrator)' : 'Patient'),
            photoURL: user.photoURL,
            role: user.email === 'aashish@gmail.com' ? 'admin' : 'patient',
          });
        }
      } else {
        // If not in demo/admin session and no firebase user, clear
        if (!localStorage.getItem('wecare_demo_session') && !localStorage.getItem('wecare_admin_session')) {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    localStorage.removeItem('wecare_demo_session');
    localStorage.removeItem('wecare_admin_session');
    await signInWithGoogle();
    setIsAuthModalOpen(false);
  };

  const loginAsAdminUser = () => {
    const adminUser: AuthUser = {
      uid: 'admin-aashish-super',
      email: 'aashish@gmail.com',
      displayName: 'Aashish (Administrator)',
      photoURL: null,
      phoneNumber: '+1 (800) 555-CARE',
    };
    const adminProfile: UserProfile = {
      uid: 'admin-aashish-super',
      email: 'aashish@gmail.com',
      displayName: 'Aashish (Administrator)',
      role: 'admin',
      phoneNumber: '+1 (800) 555-CARE',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      'wecare_admin_session',
      JSON.stringify({ user: adminUser, profile: adminProfile })
    );
    localStorage.removeItem('wecare_demo_session');
    setCurrentUser(adminUser);
    setUserProfile(adminProfile);
    setIsGuestBrowsing(false);
    setIsAuthModalOpen(false);
  };

  const handleEmailLogin = async (email: string, pass: string) => {
    localStorage.removeItem('wecare_demo_session');
    localStorage.removeItem('wecare_admin_session');

    const normalizedEmail = email.trim().toLowerCase();
    const isAdminCandidate = normalizedEmail === 'aashish@gmail.com';

    // Direct credentials check for admin
    if (isAdminCandidate && pass === 'Aashish@2007') {
      try {
        const user = await loginWithEmail(email, pass);
        const adminProf: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: 'Aashish (Hospital Administrator)',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(doc(db, 'users', user.uid), adminProf, { merge: true });
        } catch (e) {
          console.warn('Could not write admin profile to firestore', e);
        }
        setUserProfile(adminProf);
      } catch (err) {
        // Fallback to local admin session if Firebase auth provider isn't enabled yet
        console.warn('Firebase Email Auth exception for admin, using verified admin session:', err);
        loginAsAdminUser();
      }
      setIsAuthModalOpen(false);
      return;
    }

    await loginWithEmail(email, pass);
    setIsAuthModalOpen(false);
  };

  const handleEmailSignup = async (email: string, pass: string, name: string) => {
    localStorage.removeItem('wecare_demo_session');
    localStorage.removeItem('wecare_admin_session');
    await registerWithEmail(email, pass, name);
    setIsAuthModalOpen(false);
  };

  const loginAsDemoPatient = () => {
    const demoUser: AuthUser = {
      uid: 'demo-patient-001',
      email: 'sarah.jenkins@wecarepatient.org',
      displayName: 'Sarah Jenkins',
      photoURL: null,
      phoneNumber: '+1 (555) 432-8765',
    };
    const demoProfile: UserProfile = {
      uid: 'demo-patient-001',
      email: 'sarah.jenkins@wecarepatient.org',
      displayName: 'Sarah Jenkins',
      role: 'patient',
      phoneNumber: '+1 (555) 432-8765',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      'wecare_demo_session',
      JSON.stringify({ user: demoUser, profile: demoProfile })
    );
    localStorage.removeItem('wecare_admin_session');
    setCurrentUser(demoUser);
    setUserProfile(demoProfile);
    setIsGuestBrowsing(false);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('wecare_demo_session');
    localStorage.removeItem('wecare_admin_session');
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout error', e);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setIsGuestBrowsing(false);
  };

  const enterAsGuest = () => {
    setIsGuestBrowsing(true);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAdmin = userProfile?.role === 'admin' || currentUser?.email === 'aashish@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        loginWithGoogle: handleGoogleLogin,
        loginWithEmailPass: handleEmailLogin,
        signupWithEmailPass: handleEmailSignup,
        loginAsDemoPatient,
        loginAsAdminUser,
        logout: handleLogout,
        isGuestBrowsing,
        enterAsGuest,
        openAuthModal,
        isAuthModalOpen,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
