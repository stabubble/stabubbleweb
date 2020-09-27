import React from 'react';

import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';

import {Provider} from 'react-redux';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';
import {createStore, combineReducers, compose} from 'redux'
import {
    ReactReduxFirebaseProvider,
    firebaseReducer
} from 'react-redux-firebase'

import {BrowserRouter, Route, Switch, useLocation, useHistory} from "react-router-dom";

import {firebaseConfig, reduxFirebase} from "./config";
import AppRouter from "./AppRouter";

firebase.initializeApp(firebaseConfig);
firebase.functions();

const rootReducer = combineReducers({
    firebase: firebaseReducer
})

const initialState = {};
const store = createStore(rootReducer, initialState);

const rrfProps = {
    firebase,
    config: reduxFirebase,
    dispatch: store.dispatch
}

function App(props) {
    return (
        <Provider store={store}>
            <ReactReduxFirebaseProvider {...rrfProps}>
                <BrowserRouter>
                    <AppRouter/>
                </BrowserRouter>
            </ReactReduxFirebaseProvider>
        </Provider>
    )
}

export default App;
