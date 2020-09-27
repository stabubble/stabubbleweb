import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Button, Card, Input, Page, Toolbar, ProgressCircular, AlertDialog} from "react-onsenui";
import {useFirebase} from "react-redux-firebase";

function TokenPage(props) {
    const [isRegistering, setRegistering] = useState(false);
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState({title: '', message: ''});

    const history = useHistory();
    const [token, setToken] = useState('');

    const firebase = useFirebase();

    const doRegister = async () => {
        setRegistering(true);
        const register = firebase.functions().httpsCallable('register');
        try {
            const registerResult = await register({token});

            if (registerResult?.data?.result === 'ok') {
                firebase.login({
                    token: registerResult.data.token
                });
                history.push('/register', {passphrase: registerResult.data.passphrase});
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

    return (
        <Page renderToolbar={() =>
            <Toolbar>
                <div className="center" style={{textAlign: 'center'}}>
                    join the bubble
                </div>
            </Toolbar>}
              contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                <Input
                    value={token} float
                    onChange={(event) => {
                        setToken(event.target.value)
                    }}
                    placeholder='enter your invite token here'
                    style={{width: '100%', paddingTop: 10}}/>

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
                        ok
                    </Button>
                </div>
            </AlertDialog>
        </Page>
    );
}

export default TokenPage;