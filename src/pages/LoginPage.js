import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {AlertDialog, Button, Card, Input, Page, ProgressCircular, Toolbar} from "react-onsenui";
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
            const loginResult = await login({passphrase});

            if (loginResult?.data?.result === 'ok') {
                firebase.login({
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
        <Page renderToolbar={() =>
            <Toolbar>
                <div className="center" style={{textAlign: 'center'}}>
                    enter the bubble
                </div>
            </Toolbar>}
              contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                <Input
                    value={passphrase} float
                    onChange={(event) => {
                        setPassphrase(event.target.value)
                    }}
                    placeholder='enter your passphrase here'
                    style={{width: '100%', paddingTop: 10}}/>
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