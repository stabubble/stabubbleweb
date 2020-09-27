// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyANoU_wB3fMLMcnBVejNEkT5N-rxezyp3Y",
    authDomain: "stabubble.firebaseapp.com",
    databaseURL: "https://stabubble.firebaseio.com",
    projectId: "stabubble",
    storageBucket: "stabubble.appspot.com",
    messagingSenderId: "443504906431",
    appId: "1:443504906431:web:e8b9db56ec5ac3bbaaf60a",
    //measurementId: "G-3NNK3EW2LW"
};

export const reduxFirebase = {
    userProfile: 'users',
    // presence: 'presence',
    // sessions: 'sessions',
    useFirestoreForProfile: false,
    enableLogging: false
}