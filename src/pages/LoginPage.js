import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {AlertDialog, BackButton, Button, Input, Page, ProgressCircular, Toolbar} from "react-onsenui";
import {useFirebase} from "react-redux-firebase";

function LoginPage(props) {
    const history = useHistory();
    const [passphrase, setPassphrase] = useState('');

    const [isLoggingIn, setLoggingIn] = useState(false);
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState({title: '', message: ''});

    const firebase = useFirebase();

    const doLogin = async () => {
        setLoggingIn(true);
        const login = firebase.functions().httpsCallable('login');
        try {
            const loginResult = await login({passphrase: passphrase.trim().toLowerCase()});

            if (loginResult?.data?.result === 'ok') {
                await firebase.login({
                    token: loginResult.data.token
                });
                history.push('/');
            } else {
                setDisplayError(true);
                setErrorMessage({title: 'passphrase invalid', message: 'check and try again'});
                setLoggingIn(false);
            }
        } catch (err) {
            setDisplayError(true);
            setErrorMessage({title: 'network error', message: 'try again later'});
            setLoggingIn(false);
        }
    }

    return (
        <Page
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "NumpadEnter") {
                    doLogin();
                }
            }}
            renderToolbar={() =>
                <Toolbar>
                    <div className="left">
                        <BackButton onClick={() => history.goBack()}>
                            back
                        </BackButton>
                    </div>
                    <div className="center">
                        enter the bubble
                    </div>
                </Toolbar>}
            contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                paddingLeft: 5, paddingRight: 5
            }}>
                <Input
                    value={passphrase} float
                    onChange={(event) => {
                        setPassphrase(event.target.value)
                    }}
                    placeholder='enter your passphrase here'
                    style={{width: '95%', marginTop: 15}}/>
                {isLoggingIn ?
                    <ProgressCircular indeterminate/> :
                    <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                            onClick={doLogin}>enter!</Button>
                }
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
    );
}

export default LoginPage;