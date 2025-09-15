// ---
// Part 1: Firebase Configuration
// ---
// This file holds your Firebase project's configuration keys.
// The values below have been updated with the ones you provided.

const firebaseConfig = {
  apiKey: "AIzaSyAo_HrefFZgVnhZS0NGnFFJjz1oIekI7nI",
  authDomain: "expensia-d18d4.firebaseapp.com",
  projectId: "expensia-d18d4",
  storageBucket: "expensia-d18d4.firebasestorage.app",
  messagingSenderId: "340279313261",
  appId: "1:340279313261:web:43df1c0d84175b5ef09064",
  measurementId: "G-G32M4MVQSZ"
};

// Export the config to be used in other scripts
export { firebaseConfig };

// --- Additional Firebase Setup (Do this in the Firebase Console) ---
// 1. Enable Authentication:
//    - Go to "Authentication" > "Sign-in method".
//    - Enable "Email/Password".
//    - Enable "Google".
//giy
// 2. Setup Firestore Database:
//    - Go to "Firestore Database" > "Create database".
//    - Start in "production mode".
//    - Choose a location (e.g., us-central).
//    - Go to the "Rules" tab and paste the following for initial development:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // For now, allow reads and writes if the user is signed in.
    // We will make these rules more secure later.
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
*/
//
// 3. Setup Firebase Storage:
//    - Go to "Storage" > "Get started".
//    - Follow the on-screen prompts (production mode is fine).
//    - Go to the "Rules" tab and update to allow authorized writes:
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to write to a 'profile-images' folder if they are signed in.
    match /profile-images/{userId}/{fileName} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
*/

// Export the config to be used in other scripts
export { firebaseConfig };
