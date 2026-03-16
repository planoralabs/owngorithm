import { 
    auth, 
    db, 
    googleProvider 
} from './firebase.js';
import { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from 'firebase/firestore';

/**
 * Handle Google Sign-In
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        await createUserProfile(user);
        return user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
}

/**
 * Handle Email/Password Registration
 */
export async function registerWithEmail(email, password, name) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await createUserProfile(user, name);
        return user;
    } catch (error) {
        console.error("Error registering with email:", error);
        throw error;
    }
}

/**
 * Handle Email/Password Sign-In
 */
export async function loginWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error("Error logging in with email:", error);
        throw error;
    }
}

/**
 * Logout
 */
export async function logout() {
    try {
        await signOut(auth);
        console.log("User logged out");
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

/**
 * Initialize or update user profile in Firestore
 */
async function createUserProfile(user, displayName) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: displayName || user.displayName || 'Usuário Owngorithm',
            photoURL: user.photoURL || '',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            metrics: {
                hoursTracked: 0,
                activeSources: 0
            },
            theme: 'creme'
        });
    } else {
        await setDoc(userRef, {
            lastLogin: serverTimestamp()
        }, { merge: true });
    }
}

/**
 * Listen for auth state changes
 */
export function watchAuthState(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Fetch user profile from Firestore
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const profileData = userSnap.exists() ? userSnap.data() : null;
            callback(user, profileData);
        } else {
            callback(null, null);
        }
    });
}
