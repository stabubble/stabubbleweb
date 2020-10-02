import React from 'react';

import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';

import {Provider} from 'react-redux';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';
import {combineReducers, createStore} from 'redux'
import {firebaseReducer, ReactReduxFirebaseProvider} from 'react-redux-firebase'

import {BrowserRouter} from "react-router-dom";

import {AppContext, firebaseDevConfig, firebaseProdConfig, firebaseStagingConfig, reduxFirebase} from "./config";

import AppRouter from "./AppRouter";

let environment = 'prod';

if (['sta.social', 'sta.social', 'stabubble.web.app', 'stabubble.firebaseapp.com']
    .find(el => el === window.location.hostname)) {
    firebase.initializeApp(firebaseProdConfig);
    firebase.functions();
} else if (['localhost', '127.0.0.1']
    .find(el => el === window.location.hostname)) {
    firebase.initializeApp(firebaseDevConfig);
    firebase.functions().useFunctionsEmulator("http://localhost:5001");
    environment = 'dev';
} else {
    firebase.initializeApp(firebaseStagingConfig);
    firebase.functions();
    environment = 'staging';
}

const rootReducer = combineReducers({
    firebase: firebaseReducer
});

const initialState = {};
const store = createStore(rootReducer, initialState);

const rrfProps = {
    firebase,
    config: reduxFirebase,
    dispatch: store.dispatch
}

function App(props) {
    return (
        <AppContext.Provider value={{version: 0.1, status: 'beta', environment}}>
            <Provider store={store}>
                <ReactReduxFirebaseProvider {...rrfProps}>
                    <BrowserRouter>
                        <AppRouter/>
                    </BrowserRouter>
                </ReactReduxFirebaseProvider>
            </Provider>
        </AppContext.Provider>
    )
}

export default App;
