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
import {Helmet} from "react-helmet";

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
        <AppContext.Provider value={{version: 0.2, status: 'beta', environment}}>
            {environment === 'prod' ?
                <Helmet>
                    <meta name="description" content="st andrews anonymous chat"/>
                    <link rel="manifest" href={`${process.env.PUBLIC_URL}/manifest.json`}/>
                    <title>stabubble | st andrews anonymous chat</title>
                </Helmet> :
                <Helmet>
                    <meta name="robots" content="noindex, nofollow"/>
                    <meta name="description" content={`st andrews anonymous chat ${environment}`}/>
                    <link rel="manifest" href={`${process.env.PUBLIC_URL}/manifest.staging.json`}/>
                    <title>stabubble {environment} | st andrews anonymous chat</title>
                </Helmet>
            }
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
