import React from 'react';

import {Redirect, Route, Switch, useLocation} from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import AgreePage from "./pages/AgreePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import PostPage from "./pages/PostPage";
import NewCommentPage from "./pages/NewCommentPage";
import NewPostPage from "./pages/NewPostPage";
import SettingsPage from "./pages/SettingsPage";
import HomeTabView from "./views/HomeTabView";
import TokenPage from "./pages/TokenPage";
import InvitePage from "./pages/InvitePage";
import LoadingPage from "./pages/LoadingPage";

import {useSelector} from 'react-redux';
import {isEmpty, isLoaded} from 'react-redux-firebase';
import {AnimateSharedLayout} from "framer-motion";


function AuthRoute({children, ...rest}) {
    const auth = useSelector(state => state.firebase.auth);
    return (
        <Route
            {...rest}
            render={({location}) =>
                isLoaded(auth) ? !isEmpty(auth) ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: "/welcome",
                            state: {from: location}
                        }}
                    />
                ) : (<LoadingPage/>)
            }
        />
    );
}

function NonAuthRoute({children, ...rest}) {
    const auth = useSelector(state => state.firebase.auth);
    return (
        <Route
            {...rest}
            render={({location}) =>
                isLoaded(auth) ? !isEmpty(auth) ? (
                    <Redirect
                        to={{
                            pathname: "/",
                            state: {from: location}
                        }}
                    />
                ) : (
                    children
                ) : (<LoadingPage/>)
            }
        />
    );
}

function AppRouter(props) {
    const location = useLocation();
    return (
        <div>
            <AnimateSharedLayout>
                <Switch location={location}>
                    <AuthRoute exact path="/">
                        <Redirect to={{pathname: '/home/posts'}}/>
                    </AuthRoute>
                    <AuthRoute exact path="/home/:tab">
                        <HomeTabView/>
                    </AuthRoute>
                    <NonAuthRoute exact path="/welcome">
                        <WelcomePage/>
                    </NonAuthRoute>
                    <NonAuthRoute exact path="/agree">
                        <AgreePage/>
                    </NonAuthRoute>
                    <NonAuthRoute exact path="/token">
                        <TokenPage/>
                    </NonAuthRoute>
                    <Route exact path="/register">
                        <RegisterPage/>
                    </Route>
                    <NonAuthRoute exact path="/login">
                        <LoginPage/>
                    </NonAuthRoute>
                    <AuthRoute exact path="/new/post/:type">
                        <NewPostPage/>
                    </AuthRoute>
                    <AuthRoute exact path="/new/comment/:postId/:type">
                        <NewCommentPage/>
                    </AuthRoute>
                    <AuthRoute exact path="/post/:postId">
                        <PostPage/>
                    </AuthRoute>
                    <AuthRoute exact path="/settings">
                        <SettingsPage/>
                    </AuthRoute>
                    <AuthRoute exact path="/invite">
                        <InvitePage/>
                    </AuthRoute>
                    <Route path="*">
                        <Redirect to={{pathname: '/'}}/>
                    </Route>
                </Switch>
            </AnimateSharedLayout>
        </div>
    )
}

export default AppRouter;