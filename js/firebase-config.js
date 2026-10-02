import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD6PdXgwde6bYIK0aUWqgi9MDL1oRHNZwY",
  authDomain: "rudra7-mods.firebaseapp.com",
  databaseURL: "https://rudra7-mods-default-rtdb.firebaseio.com",
  projectId: "rudra7-mods",
  storageBucket: "rudra7-mods.firebasestorage.app",
  messagingSenderId: "901789706217",
  appId: "1:901789706217:web:578b87ce4a05a99c3ecd78",
  measurementId: "G-NLMDPKEN85"
};

// Sirf ye UID login kar sakti hai. Firebase console →
// Authentication → Users se copy karo. Same UID rules/*.json me bhi hona chahiye.
const ADMIN_UID = "wtaaxfIvBgY0hWkLUeAoomgoZMP2";

const app = initializeApp(firebaseConfig);

let analytics = null;
try {
    analytics = getAnalytics(app);
} catch (e) {
    analytics = null;
}

const db = getDatabase(app);
const auth = getAuth(app);

export { app, analytics, db, auth, ADMIN_UID };
