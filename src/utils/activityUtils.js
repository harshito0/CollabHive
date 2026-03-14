import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Centrally logs developer activities and updates Collab Score atomically.
 * @param {string} userId - The UID of the developer
 * @param {string} type - 'task', 'commit', 'chat', or 'prototype'
 * @param {string} description - Human-readable description of the act
 */
export const logActivity = async (userId, type, description) => {
  if (!userId || !type) return;

  const userRef = doc(db, 'users', userId);
  const activityRef = collection(db, 'users', userId, 'activities');

  // Define point weights for the Collab Score algorithm
  const weights = {
    task: 5,        // Completing a task in Workspace
    commit: 2,      // Syncing/shipping code
    chat: 1,        // Engaging in Team Rooms
    prototype: 10,  // Launching a project/hackathon entry
  };

  const points = weights[type] || 1;

  try {
    // 1. Record the activity in the sub-collection (for Heatmap)
    await addDoc(activityRef, {
      type,
      description,
      points,
      timestamp: serverTimestamp(),
    });

    // 2. Atomically update the user's score and stats
    const updatePayload = {
      collabScore: increment(points),
      lastActive: serverTimestamp(),
    };

    // Specific stat increments based on activity type
    if (type === 'task') {
      updatePayload['stats.tasksCompleted'] = increment(1);
    } else if (type === 'chat') {
      // Logic for hourly tracking could be added here
      updatePayload['stats.hoursCollaborated'] = increment(0.1); 
    }

    await updateDoc(userRef, updatePayload);
    
    return points;
  } catch (err) {
    console.error('Activity Logging Error:', err);
    throw err;
  }
};
