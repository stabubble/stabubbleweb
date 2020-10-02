import React, {useCallback, useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {AlertDialog, BackButton, Button, Input, Page, ProgressCircular, Toolbar} from "react-onsenui";
import {useFirebase} from "react-redux-firebase";

function TokenPage(props) {
    const [isTryingIp, setTryingIp] = useState(true);
    const [isRegistering, setRegistering] = useState(false);
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState({title: '', message: ''});

    const history = useHistory();
    const [token, setToken] = useState('');

    const firebase = useFirebase();

    const tryRegisterIp = useCallback(async () => {
        const register = firebase.functions().httpsCallable('register');
        try {
            const registerResult = await register({token: 'staipaddr'});

            if (registerResult?.data?.result === 'ok') {
                await firebase.login({
                    token: registerResult.data.token
                });
                history.push('/register', {passphrase: registerResult.data.passphrase});
                await firebase.updateProfile({location: 'welcome'});
            } else {
                setTryingIp(false);
            }
        } catch (err) {
            setDisplayError(true);
            setErrorMessage({title: 'network error', message: 'try again later'});
            setRegistering(false);
        }
    }, [history, firebase]);

    const doRegister = async () => {
        setRegistering(true);
        const register = firebase.functions().httpsCallable('register');
        try {
            const registerResult = await register({token: token.trim().toLowerCase()});

            if (registerResult?.data?.result === 'ok') {
                await firebase.login({
                    token: registerResult.data.token
                });
                history.push('/register', {passphrase: registerResult.data.passphrase});
                await firebase.updateProfile({location: 'welcome'});
            } else {
                setDisplayError(true);
                setErrorMessage({title: 'token invalid', message: 'try again or try with different token'});
                setRegistering(false);
            }
        } catch (err) {
            setDisplayError(true);
            setErrorMessage({title: 'network error', message: 'try again later'});
            setRegistering(false);
        }
    }

    useEffect(() => {
        if (!displayError) {
            tryRegisterIp();
        }
    }, [tryRegisterIp, displayError])

    return (
        isTryingIp ?
            <Page>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                    <ProgressCircular indeterminate/>
                    <div style={{paddingLeft: 10}}>attempting to enter bubble</div>
                </div>
                <AlertDialog isOpen={displayError} onCancel={() => setDisplayError(false)} cancelable>
                    <div className="alert-dialog-title">{errorMessage.title}</div>
                    <div className="alert-dialog-content">
                        {errorMessage.message}
                    </div>
                    <div className="alert-dialog-footer">
                        <Button onClick={() => setDisplayError(false)} className="alert-dialog-button">
                            ok
                        </Button>
                    </div>
                </AlertDialog>
            </Page>
            :
            <Page renderToolbar={() =>
                <Toolbar>
                    <div className="left">
                        <BackButton onClick={() => history.goBack()}>
                            back
                        </BackButton>
                    </div>
                    <div className="center">
                        join the bubble
                    </div>
                </Toolbar>}
                  contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                    paddingLeft: 5, paddingRight: 5
                }}>
                    <div style={{marginTop: 15}}>
                        it seems you are not on the st andrews network
                    </div>
                    <div>
                        so we can't let you enter the bubble directly
                    </div>
                    <div>
                        you will need to get one of your friends to send you an invite code!
                    </div>
                    <Input
                        value={token} float
                        onChange={(event) => {
                            setToken(event.target.value)
                        }}
                        placeholder='enter your invite code here'
                        style={{width: '95%', marginTop: 15}}/>
                    {isRegistering ?
                        <ProgressCircular indeterminate/> :
                        <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                                onClick={doRegister}>join!</Button>
                    }
                </div>
                <AlertDialog isOpen={displayError} onCancel={() => setDisplayError(false)} cancelable>
                    <div className="alert-dialog-title">{errorMessage.title}</div>
                    <div className="alert-dialog-content">
                        {errorMessage.message}
                    </div>
                    <div className="alert-dialog-footer">
                        <Button onClick={() => setDisplayError(false)} className="alert-dialog-button">
                            try again
                        </Button>
                    </div>
                </AlertDialog>
            </Page>
    );
}

export default TokenPage;