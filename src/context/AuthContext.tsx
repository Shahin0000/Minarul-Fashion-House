import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ShippingAddress } from '../types';
import { storageService } from '../services/storageService';
import { auth, db, googleProvider } from '../firebase';
import { withTimeout } from '../utils/authErrors';
import { normalizePhoneNumber, isValidBangladeshiPhone } from '../utils/phoneUtils';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoadingAuth: boolean;
  isLoginModalOpen: boolean;
  loginModalTab: 'login' | 'register';
  openLoginModal: (defaultTab?: 'login' | 'register') => void;
  closeLoginModal: () => void;
  loginWithEmail: (emailOrPhone: string, password: string) => Promise<'admin' | 'customer'>;
  registerWithEmail: (name: string, email: string, phone: string, password: string) => Promise<'admin' | 'customer'>;
  loginWithGoogle: () => Promise<'admin' | 'customer'>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<User>) => Promise<void>;
  updateDefaultAddress: (address: ShippingAddress) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clean up any legacy or rogue cached admin flags
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('admin');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('admin');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('userRole');
  } catch {
    // Safe storage access
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Never initialize user from cached storage to prevent stale admin role
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    // Listen to Firebase Authentication state change
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentFbUser) => {
      setFirebaseUser(currentFbUser);

      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (currentFbUser) {
        setIsLoadingAuth(true);

        try {
          // Read users/{uid} document strictly from Firestore
          const userDocRef = doc(db, 'users', currentFbUser.uid);
          const userSnap = await getDoc(userDocRef);

          let userRole: 'customer' | 'admin' = 'customer';
          let userName = currentFbUser.displayName || 'Customer';
          let userPhone = currentFbUser.phoneNumber || '';
          let userAddress = undefined;

          if (userSnap.exists()) {
            const data = userSnap.data();
            // Source of Truth: ONLY data.role === 'admin'
            userRole = data.role === 'admin' ? 'admin' : 'customer';
            userName = data.name || currentFbUser.displayName || 'Customer';
            userPhone = data.phone || currentFbUser.phoneNumber || '';
            userAddress = data.address;
          } else {
            // Profile document does not exist yet; default strictly to 'customer'
            userRole = 'customer';
          }

          const verifiedUser: User = {
            id: currentFbUser.uid,
            name: userName,
            email: currentFbUser.email || '',
            phone: userPhone,
            role: userRole,
            address: userAddress,
          };

          setUser(verifiedUser);
          storageService.saveUser(verifiedUser);

          // Real-time listener on user's Firestore document
          unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const liveData = docSnap.data();
              const liveRole: 'customer' | 'admin' = liveData.role === 'admin' ? 'admin' : 'customer';

              setUser((prev) => {
                if (!prev) return null;
                const updated: User = {
                  ...prev,
                  role: liveRole,
                  name: liveData.name || prev.name,
                  phone: liveData.phone || prev.phone,
                  address: liveData.address || prev.address,
                };
                storageService.saveUser(updated);
                return updated;
              });
            }
          }, (error) => {
            console.warn('Real-time user document listener notice:', error.message);
          });
        } catch (error: any) {
          console.error('Error fetching user role from Firestore:', error?.code, error?.message);
          const fallbackUser: User = {
            id: currentFbUser.uid,
            name: currentFbUser.displayName || 'Customer',
            email: currentFbUser.email || '',
            phone: currentFbUser.phoneNumber || '',
            role: 'customer',
          };
          setUser(fallbackUser);
          storageService.saveUser(fallbackUser);
        } finally {
          setIsLoadingAuth(false);
        }
      } else {
        setUser(null);
        storageService.saveUser(null);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  useEffect(() => {
    storageService.syncAdminUsersListener(Boolean(user && user.role === 'admin'));
  }, [user]);

  const openLoginModal = (defaultTab: 'login' | 'register' = 'login') => {
    setLoginModalTab(defaultTab);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const isLoggedIn = Boolean(user && user.id && user.name);
  const isAdmin = Boolean(!isLoadingAuth && user && user.role === 'admin');

  // Convert Bangladeshi phone number to normalized email alias for Firebase Auth if needed
  const resolveEmail = (emailOrPhone: string): string => {
    const clean = emailOrPhone.trim();
    if (clean.includes('@')) return clean.toLowerCase();
    const digits = clean.replace(/[^0-9]/g, '');
    return `${digits}@customer.minarulfashion.com`;
  };

  // 1. Email/Phone + Password Login
  const loginWithEmail = async (emailOrPhone: string, password: string): Promise<'admin' | 'customer'> => {
    let resolvedEmail = emailOrPhone.trim().toLowerCase();

    // Check if input is a Bangladeshi mobile number (does not contain @)
    if (!resolvedEmail.includes('@')) {
      const cleanPhone = normalizePhoneNumber(emailOrPhone);
      if (isValidBangladeshiPhone(cleanPhone)) {
        // Look up registered user email by mobile number from phoneLookup/{cleanPhone}
        try {
          const phoneSnap = await withTimeout(
            getDoc(doc(db, 'phoneLookup', cleanPhone)),
            7000,
            'মোবাইল নম্বর যাচাই করতে অতিরিক্ত সময় লেগেছে।'
          );
          if (phoneSnap.exists() && phoneSnap.data()?.email) {
            resolvedEmail = phoneSnap.data().email.toLowerCase();
          } else {
            resolvedEmail = `${cleanPhone}@customer.minarulfashion.com`;
          }
        } catch (phoneErr) {
          console.warn('Phone lookup notice during login:', phoneErr);
          resolvedEmail = `${cleanPhone}@customer.minarulfashion.com`;
        }
      } else {
        throw new Error('সঠিক ইমেইল অথবা ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX বা 018XXXXXXXX)।');
      }
    }

    // Authenticate with Firebase Auth (enforcing a 15s timeout)
    const userCredential = await withTimeout(
      signInWithEmailAndPassword(auth, resolvedEmail, password),
      15000,
      'লগইন সম্পন্ন হতে অতিরিক্ত সময় লেগেছে। আপনার ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।'
    );
    const fbUser = userCredential.user;

    // Fetch user profile strictly from Firestore users/{uid}
    try {
      const snap = await withTimeout(
        getDoc(doc(db, 'users', fbUser.uid)), 
        8000,
        'Firestore ডাটাবেজ থেকে তথ্য আনার সময় শেষ হয়েছে।'
      );
      if (snap.exists()) {
        const data = snap.data();
        const resolvedRole: 'admin' | 'customer' = data.role === 'admin' ? 'admin' : 'customer';
        const loggedUser: User = {
          id: fbUser.uid,
          name: data.name || fbUser.displayName || 'Customer',
          email: fbUser.email || data.email || '',
          phone: data.phone || '',
          role: resolvedRole,
          address: data.address,
        };
        setUser(loggedUser);
        storageService.saveUser(loggedUser);
        return resolvedRole;
      }
    } catch (e) {
      console.warn('Firestore read notice during email login:', e);
    }

    // Fallback if Firestore read takes longer or document hasn't been populated: strictly customer
    const fallbackUser: User = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Customer',
      email: fbUser.email || '',
      phone: '',
      role: 'customer',
    };
    setUser(fallbackUser);
    storageService.saveUser(fallbackUser);
    return 'customer';
  };

  // 2. Email/Phone + Password Register
  const registerWithEmail = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<'admin' | 'customer'> => {
    const cleanPhone = normalizePhoneNumber(phone);
    if (!isValidBangladeshiPhone(cleanPhone)) {
      throw new Error('অনুগ্রহ করে সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX বা 018XXXXXXXX)।');
    }

    const validEmail = email.trim() ? email.trim().toLowerCase() : `${cleanPhone}@customer.minarulfashion.com`;
    const trimmedName = name.trim();

    // Check unique mobile number to prevent duplicate accounts
    try {
      const existingPhoneSnap = await withTimeout(
        getDoc(doc(db, 'phoneLookup', cleanPhone)),
        6000
      );
      if (existingPhoneSnap.exists()) {
        throw new Error('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।');
      }
    } catch (checkErr) {
      if (checkErr instanceof Error && checkErr.message.includes('ইতিমধ্যে একটি অ্যাকাউন্ট')) {
        throw checkErr;
      }
    }

    // 1. Create account with Firebase Authentication (enforcing 15s timeout)
    const userCredential = await withTimeout(
      createUserWithEmailAndPassword(auth, validEmail, password),
      15000,
      'Firebase Authentication-এ অ্যাকাউন্ট তৈরিতে অতিরিক্ত সময় লেগেছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
    );
    const fbUser = userCredential.user;

    // 2. Update Firebase Auth displayName
    try {
      await withTimeout(updateFirebaseProfile(fbUser, { displayName: trimmedName }), 4000);
    } catch (e) {
      console.warn('Could not update Firebase displayName:', e);
    }

    // 3. User document structure strictly matching requested format:
    // role is strictly set to "customer". User cannot self-assign admin role.
    const userDocData = {
      name: trimmedName,
      email: validEmail,
      phone: cleanPhone,
      role: 'customer' as const,
      createdAt: serverTimestamp(),
    };

    // 4. Create users/{uid} document in Firestore (resilient with 2.5s timeout)
    const userDocRef = doc(db, 'users', fbUser.uid);
    try {
      await withTimeout(
        setDoc(userDocRef, userDocData),
        2500,
        'Firestore ডাটাবেজে ইউজার ডকুমেন্ট সংরক্ষণে অতিরিক্ত সময় লেগেছে।'
      );
      console.log('✅ Firestore users/{uid} document created successfully:', fbUser.uid);
    } catch (firestoreErr: unknown) {
      const errMessage = firestoreErr instanceof Error ? firestoreErr.message : String(firestoreErr);
      const errCode = (firestoreErr as { code?: string })?.code || 'offline';
      console.warn(`Firestore user document sync deferred on registration [${errCode}]:`, errMessage);
      // Non-blocking: Firebase Auth user account is already created and verified
    }

    // 5. Index phone in phoneLookup collection for mobile login
    try {
      await setDoc(doc(db, 'phoneLookup', cleanPhone), {
        uid: fbUser.uid,
        email: validEmail,
        phone: cleanPhone,
        createdAt: serverTimestamp(),
      });
    } catch (lookupErr) {
      console.warn('phoneLookup index write notice:', lookupErr);
    }

    const newUser: User = {
      id: fbUser.uid,
      name: trimmedName,
      email: validEmail,
      phone: cleanPhone,
      role: 'customer',
    };

    setUser(newUser);
    storageService.saveUser(newUser);
    return 'customer';
  };

  // 3. Google Sign-In
  const loginWithGoogle = async (): Promise<'admin' | 'customer'> => {
    // 1. Popup Google login (allowing 35s for user interaction)
    const res = await withTimeout(
      signInWithPopup(auth, googleProvider),
      35000,
      'গুগল সাইন-ইন সম্পন্ন হতে অতিরিক্ত সময় লেগেছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
    );
    const fbUser = res.user;

    const userDocRef = doc(db, 'users', fbUser.uid);

    // 2. Check if Firestore users/{uid} document already exists
    try {
      const snap = await withTimeout(
        getDoc(userDocRef),
        8000,
        'Firestore ডাটাবেজ থেকে তথ্য আনার সময় শেষ হয়েছে।'
      );

      if (snap.exists()) {
        // Document exists: Preserve existing role strictly from Firestore
        const data = snap.data();
        const resolvedRole: 'admin' | 'customer' = data.role === 'admin' ? 'admin' : 'customer';

        const existingUser: User = {
          id: fbUser.uid,
          name: data.name || fbUser.displayName || 'Customer',
          email: fbUser.email || data.email || '',
          phone: data.phone || fbUser.phoneNumber || '',
          role: resolvedRole,
          address: data.address,
        };
        setUser(existingUser);
        storageService.saveUser(existingUser);
        return resolvedRole;
      } else {
        // First-time Google user: automatically create customer profile document in Firestore
        const newCustomerDoc = {
          name: fbUser.displayName || 'Customer',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '',
          role: 'customer' as const,
          createdAt: serverTimestamp(),
        };

        try {
          await withTimeout(
            setDoc(userDocRef, newCustomerDoc),
            2500,
            'Firestore-এ নতুন ইউজার ডকুমেন্ট সংরক্ষণে অতিরিক্ত সময় লেগেছে।'
          );
          console.log('✅ Created new Google customer profile in Firestore users/{uid}:', fbUser.uid);
        } catch (setDocErr) {
          const errMessage = setDocErr instanceof Error ? setDocErr.message : String(setDocErr);
          const errCode = (setDocErr as { code?: string })?.code || 'offline';
          console.warn(`Firestore user document sync deferred on Google Sign-In [${errCode}]:`, errMessage);
        }

        const newUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Customer',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '',
          role: 'customer',
        };
        setUser(newUser);
        storageService.saveUser(newUser);
        return 'customer';
      }
    } catch (e) {
      console.warn('Firestore read/check notice on Google Sign-In:', e);
      const fallbackUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Customer',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        role: 'customer',
      };
      setUser(fallbackUser);
      storageService.saveUser(fallbackUser);
      return 'customer';
    }
  };

  // 4. Forgot Password
  const forgotPassword = async (email: string): Promise<void> => {
    await withTimeout(
      sendPasswordResetEmail(auth, email.trim().toLowerCase()),
      12000
    );
  };

  // 5. Logout
  const logout = async (): Promise<void> => {
    try {
      await withTimeout(signOut(auth), 5000);
    } catch (e) {
      console.warn('SignOut error', e);
    }
    setUser(null);
    setFirebaseUser(null);
    storageService.saveUser(null);
  };

  // 6. Update Profile
  const updateProfile = async (updated: Partial<User>): Promise<void> => {
    if (!user) return;
    const safeUpdate = { ...updated };
    // Prevent normal customer from elevating role
    if (user.role !== 'admin') {
      delete safeUpdate.role;
    }
    const newUser: User = { ...user, ...safeUpdate };
    setUser(newUser);
    storageService.saveUser(newUser);

    try {
      await updateDoc(doc(db, 'users', user.id), {
        ...safeUpdate,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Error updating profile in Firestore:', e);
    }
  };

  // 7. Update Default Address
  const updateDefaultAddress = async (address: ShippingAddress): Promise<void> => {
    if (!user) return;
    const newUser: User = { ...user, address };
    setUser(newUser);
    storageService.saveUser(newUser);

    try {
      await updateDoc(doc(db, 'users', user.id), {
        address,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Error updating address in Firestore:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoggedIn,
        isAdmin,
        isLoadingAuth,
        isLoginModalOpen,
        loginModalTab,
        openLoginModal,
        closeLoginModal,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        forgotPassword,
        logout,
        updateProfile,
        updateDefaultAddress,
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
