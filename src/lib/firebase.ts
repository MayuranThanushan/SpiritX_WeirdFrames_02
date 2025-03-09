import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper function to process CSV data and import to Firestore
import { collection, doc, setDoc } from 'firebase/firestore';
import { PlayerData, calculatePlayerStats } from '../types';

export const importPlayersData = async (playersData: PlayerData[]) => {
  const playersCollection = collection(db, 'players');

  for (const playerData of playersData) {
    const stats = calculatePlayerStats(playerData);
    
    const playerDoc = {
      name: playerData.name,
      university: playerData.university,
      category: playerData.category,
      stats: {
        totalRuns: playerData.totalRuns,
        ballsFaced: playerData.ballsFaced,
        inningsPlayed: playerData.inningsPlayed,
        wickets: playerData.wickets,
        oversBowled: playerData.oversBowled,
        runsConceded: playerData.runsConceded,
        ...stats
      }
    };

    await setDoc(doc(playersCollection), playerDoc);
  }
};