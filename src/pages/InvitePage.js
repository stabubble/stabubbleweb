import React, {useCallback, useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {BackButton, Card, Page, ProgressCircular, Toolbar} from "react-onsenui";
import {isEmpty, isLoaded, useFirebase, useFirebaseConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import TimeAgo from "react-timeago";

function InvitePage() {
    const history = useHistory();
    const firebase = useFirebase();
    const user = useSelector((state) => state.firebase.auth) ?? {};

    const [isGettingToken, setGettingToken] = useState(false);

    useFirebaseConnect([
        {
            path: `/token/users/${user.uid}`
        },
    ], [user]);

    const userToken = useSelector((state) => state.firebase.data?.token?.users?.[user.uid]);

    const doGenerateToken = useCallback(async () => {
        if (!isGettingToken) {
            setGettingToken(true);
            const generateToken = firebase.functions().httpsCallable('generateToken');
            await generateToken();
        }
    }, [isGettingToken, firebase]);

    const getToken = useCallback(async () => {
        if (isEmpty(userToken)) {
            await doGenerateToken();
        } else {
            if (userToken?.created < (Date.now() - (24 * 60 * 60 * 1000))) {
                await doGenerateToken();
            } else {
                setGettingToken(false);
            }
        }
    }, [doGenerateToken, userToken]);

    useEffect(() => {
        if (isLoaded(userToken)) {
            getToken();
        }
    }, [userToken, getToken]);

    return (
        isLoaded(userToken) && !isEmpty(userToken) &&
        userToken?.created > (Date.now() - (24 * 60 * 60 * 1000)) ?
            <Page renderToolbar={() =>
                <Toolbar>
                    <div className="left">
                        <BackButton onClick={() => history.goBack()}>
                            back
                        </BackButton>
                    </div>
                    <div className="center">
                        invite to bubble
                    </div>
                </Toolbar>}
                  contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                    paddingLeft: 5, paddingRight: 5
                }}>
                    <div style={{paddingTop: 10, width: '100%'}}>
                        <Card>use an invite code to let friends not on the st andrews network join stabubble</Card>
                    </div>
                    <div style={{paddingTop: 10, width: '100%'}}>
                        <Card style={{backgroundColor: '#ffb347'}}>
                            <div className="title">your invite code</div>
                            <textarea className="textarea textarea--transparent" rows="2" style={{width: '100%'}}
                                      value={userToken.token} readOnly={true}>
                        </textarea>
                        </Card>
                    </div>
                    {userToken.active ?
                        <div style={{paddingTop: 10, width: '100%'}}>
                            <Card>share it with your friend so that they can blow their first bubble!</Card>
                            {userToken.created ? <Card>this code will expire in <TimeAgo
                                date={userToken.created + (24 * 60 * 60 * 1000)}/></Card> : null}
                        </div> :
                        <div style={{paddingTop: 10, width: '100%'}}>
                            {userToken.created ? <Card>this code has been used, check again in <TimeAgo
                                date={userToken.created + (24 * 60 * 60 * 1000)}/> to get a new code</Card> : null}
                            <Card>you can only invite one friend every 24 hours</Card>
                        </div>
                    }
                </div>
            </Page> :
            <Page>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                    <ProgressCircular indeterminate/>
                    <div style={{paddingLeft: 10}}>generating invite code</div>
                </div>
            </Page>
    );
}

export default InvitePage;