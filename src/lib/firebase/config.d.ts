import { User } from "firebase/auth";
declare const firebaseApp: import("@firebase/app").FirebaseApp;
declare const auth: import("@firebase/auth").Auth;
declare const db: import("@firebase/firestore").Firestore;
declare const getIdToken: (user: User) => Promise<string>;
export { firebaseApp, auth, db, getIdToken };
