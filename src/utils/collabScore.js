import { db, auth } from '../firebase';
import { 
  doc, 
  updateDoc, 
  increment, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Weights for CollabScore Calculation
 * Git Activity: 4.0 per action
 * Team Chat: 2.0 per message
 * Kanban Tasks: 3.0 per task
 * Whiteboard: 1.5 per interaction
 */
const WEIGHTS = {
  GIT: 4.0,
  CHAT: 2.0,
  TASK: 3.0,
  WHITEBOARD: 1.5
};

export const updateCollabScore = async (activityType) => {
  const user = auth?.currentUser;
  if (!user || !db) return;

  const userRef = doc(db, 'users', user.uid);
  const weight = WEIGHTS[activityType.toUpperCase()] || 1.0;

  try {
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Initialize user profile if it doesn't exist
      await setDoc(userRef, {
        name: user.displayName || 'Anonymous Developer',
        email: user.email,
        role: 'Developer',
        skills: ['React', 'Firebase'],
        collabScore: weight,
        wins: 0,
        experience: 'Junior',
        location: 'Remote',
        status: 'Active',
        lastActive: serverTimestamp()
      });
    } else {
      // Update existing score
      await updateDoc(userRef, {
        collabScore: increment(weight),
        lastActive: serverTimestamp()
      });
    }
    
    console.log(`CollabScore updated: +${weight} for ${activityType}`);
  } catch (error) {
    console.error('Error updating CollabScore:', error);
  }
};
