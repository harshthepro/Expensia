// ---
// Part 1: Firebase Configuration
// ---
// This file will hold your Firebase project's configuration keys.
// Follow the instructions below to get your own keys.

// 1. Go to the Firebase console: https://console.firebase.google.com/
// 2. Create a new project (or use an existing one).
// 3. In your project's dashboard, click the "</>" icon to add a web app.
// 4. Register the app (you can give it any nickname).
// 5. Firebase will give you a `firebaseConfig` object. Copy it.
// 6. Paste the entire object here, replacing the placeholder object below.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- Additional Firebase Setup (Do this in the Firebase Console) ---
// 1. Enable Authentication:
//    - Go to "Authentication" > "Sign-in method".
//    - Enable "Email/Password".
//    - Enable "Google".
//
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
