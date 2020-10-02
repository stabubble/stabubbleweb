import React from "react";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseProdConfig = {
    apiKey: "AIzaSyANoU_wB3fMLMcnBVejNEkT5N-rxezyp3Y",
    authDomain: "stabubble.firebaseapp.com",
    databaseURL: "https://stabubble.firebaseio.com",
    projectId: "stabubble",
    storageBucket: "stabubble.appspot.com",
    messagingSenderId: "443504906431",
    appId: "1:443504906431:web:e8b9db56ec5ac3bbaaf60a"
};

export const firebaseStagingConfig = {
    apiKey: "AIzaSyCU4SS7j3r1tzhUtWxAv1WmQhyyjbI5y2c",
    authDomain: "stabubble-staging.firebaseapp.com",
    databaseURL: "https://stabubble-staging.firebaseio.com",
    projectId: "stabubble-staging",
    storageBucket: "stabubble-staging.appspot.com",
    messagingSenderId: "168714439337",
    appId: "1:168714439337:web:c4b7d70567ed192bc2b7b8"
};

export const firebaseDevConfig = {
    apiKey: "AIzaSyCU4SS7j3r1tzhUtWxAv1WmQhyyjbI5y2c",
    authDomain: "stabubble-staging.firebaseapp.com",
    databaseURL: "http://localhost:9000?ns=stabubble",
    projectId: "stabubble-staging",
    storageBucket: "stabubble-staging.appspot.com",
    messagingSenderId: "168714439337",
    appId: "1:168714439337:web:c4b7d70567ed192bc2b7b8"
};

export const reduxFirebase = {
    userProfile: 'users',
    useFirestoreForProfile: false,
    enableLogging: false
}

export const AppContext = React.createContext();
