/**
 * Authentication Error and Timeout Helpers
 * Provides Bengali and English formatted feedback for Firebase Auth & Firestore
 */

export function withTimeout<T>(
  promise: Promise<T>,
  ms = 14000,
  timeoutMessage = 'সার্ভার থেকে সাড়া পেতে অতিরিক্ত সময় লেগেছে। দয়া করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন। (Request timed out)'
): Promise<T> {
  let timerId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, ms);
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timerId)),
    timeoutPromise,
  ]);
}

export function formatAuthError(err: unknown, language: 'bn' | 'en' = 'bn'): string {
  if (!err) return '';
  const errorStr = err instanceof Error ? err.message : String(err);

  // 1. Google Sign-In Popup & Domain Errors
  if (errorStr.includes('auth/popup-closed-by-user')) {
    return language === 'bn'
      ? 'গুগল সাইন-ইন পপ-আপ উইন্ডো বন্ধ করা হয়েছে। পুনরায় চেষ্টা করুন।'
      : 'Google Sign-In popup was closed before completing.';
  }
  if (errorStr.includes('auth/cancelled-popup-request')) {
    return language === 'bn'
      ? 'পূর্বের সাইন-ইন অনুরোধটি বাতিল করা হয়েছে।'
      : 'Previous sign-in request was cancelled.';
  }
  if (errorStr.includes('auth/popup-blocked')) {
    return language === 'bn'
      ? 'আপনার ব্রাউজার সাইন-ইন পপ-আপ ব্লক করেছে। ব্রাউজারের অ্যাড্রেস বার থেকে পপ-আপ এলাও (Allow) করে আবার চেষ্টা করুন।'
      : 'Popup was blocked by your browser. Please allow popups for this site and try again.';
  }
  if (errorStr.includes('auth/unauthorized-domain')) {
    return language === 'bn'
      ? 'এই ওয়েবসাইট ডোমেনটি Firebase Console-এ অথরাইজড নয়। দয়া করে Firebase Console > Authentication > Settings > Authorized domains-এ বর্তমান ডোমেন যুক্ত করুন।'
      : 'This domain is not authorized in Firebase Authentication. Please add it in Firebase Console > Authentication > Settings > Authorized domains.';
  }
  if (errorStr.includes('auth/operation-not-allowed')) {
    return language === 'bn'
      ? 'Firebase Console-এ এই অথেনটিকেশন মেথড সক্রিয় করা নেই। অনুগ্রহ করে Firebase Console > Authentication > Sign-in method-এ গিয়ে এনেবল করুন।'
      : 'This authentication provider is not enabled in Firebase Console. Please enable it in Firebase Console > Authentication > Sign-in method.';
  }
  if (errorStr.includes('auth/account-exists-with-different-credential')) {
    return language === 'bn'
      ? 'এই ইমেইল দিয়ে ইতিমধ্যে অন্য পদ্ধতিতে অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে সেই পদ্ধতি দিয়ে লগইন করুন।'
      : 'An account already exists with the same email address but different sign-in credentials.';
  }

  // 2. Email / Password Errors
  if (errorStr.includes('auth/email-already-in-use')) {
    return language === 'bn'
      ? 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত আছে। দয়া করে লগইন করুন অথবা অন্য ইমেইল ব্যবহার করুন।'
      : 'This email is already registered. Please sign in or use another email.';
  }
  if (
    errorStr.includes('auth/invalid-credential') ||
    errorStr.includes('auth/wrong-password') ||
    errorStr.includes('auth/user-not-found')
  ) {
    return language === 'bn'
      ? 'ভুল ইমেইল/মোবাইল অথবা পাসওয়ার্ড। অনুগ্রহ করে যাচাই করে সঠিক তথ্য দিন।'
      : 'Incorrect email/phone or password. Please verify and try again.';
  }
  if (errorStr.includes('auth/invalid-email')) {
    return language === 'bn'
      ? 'সঠিক ইমেইল ফরম্যাট লিখুন (যেমন: user@example.com)।'
      : 'Please enter a valid email address.';
  }
  if (errorStr.includes('auth/weak-password')) {
    return language === 'bn'
      ? 'পাসওয়ার্ড অত্যন্ত দুর্বল। কমপক্ষে ৬ অক্ষরের নিরাপদ পাসওয়ার্ড ব্যবহার করুন।'
      : 'Password is too weak. Must be at least 6 characters.';
  }
  if (errorStr.includes('auth/too-many-requests')) {
    return language === 'bn'
      ? 'অতিরিক্ত ভুল চেষ্টার কারণে সাময়িকভাবে বন্ধ করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
      : 'Access temporarily disabled due to multiple failed attempts. Please try again later.';
  }

  // 3. Network & Timeout Errors
  if (errorStr.includes('timed out') || errorStr.includes('Request timed out')) {
    return language === 'bn'
      ? 'অনুরোধের সময় শেষ হয়েছে (Request timed out)। আপনার ইন্টারনেট সংযোগ চেক করুন এবং পুনরায় চেষ্টা করুন।'
      : 'Request timed out. Please check your internet connection or try again.';
  }
  if (errorStr.includes('auth/network-request-failed') || errorStr.includes('network error')) {
    return language === 'bn'
      ? 'ইন্টারনেট সংযোগ বিচ্ছিন্ন অথবা ধীরগতির। অনুগ্রহ করে সংযোগ নিশ্চিত করে আবার চেষ্টা করুন।'
      : 'Network error. Please check your internet connection and try again.';
  }

  // 4. Firestore / Permission Errors
  if (errorStr.includes('permission-denied') || errorStr.includes('Missing or insufficient permissions')) {
    return language === 'bn'
      ? 'অনুমতি পাওয়া যায়নি (Permission denied)। অনুগ্রহ করে সঠিক অ্যাকাউন্টে লগইন করুন।'
      : 'Missing or insufficient permissions.';
  }

  // Fallback to error message
  return errorStr;
}
