import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {AlertDialog, BackButton, Button, Page, Toolbar} from "react-onsenui";
import {useFirebase} from "react-redux-firebase";
import logo from '../images/logo512.png';

import {version} from "../constants";

function SettingsPage(props) {
    const history = useHistory();
    const firebase = useFirebase();

    const [displayWarning, setDisplayWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState({title: '', message: ''});
    const [warningAction, setWarningAction] = useState(null);

    const logoutWarn = () => {
        setWarningMessage({
            title: 'you really want to leave the bubble?',
            message: 'use your passphrase to login again!'
        });
        setWarningAction('logout');
        setDisplayWarning(true);
    }

    const logoutAllWarn = () => {
        setWarningMessage({
            title: 'you really want to leave the bubble everywhere?',
            message: 'use your passphrase to login again!'
        });
        setWarningAction('logoutAll');
        setDisplayWarning(true);
    }

    const deleteAccountWarn = () => {
        setWarningMessage({
            title: 'you really want to pop your bubbles?',
            message: 'all your data will be deleted!'
        });
        setWarningAction('deleteAccount');
        setDisplayWarning(true);
    }

    const doAction = async () => {
        switch (warningAction) {
            case 'logout':
                await firebase.logout();
                history.push('/welcome');
                break;
            case 'logoutAll':
                const logoutAll = firebase.functions().httpsCallable('logoutAll');
                await logoutAll();
                setWarningAction('logout');
                await doAction();
                break;
            case 'deleteAccount':
                const deleteUser = firebase.functions().httpsCallable('deleteUser');
                await deleteUser();
                setWarningAction('logout');
                await doAction();
                break;
        }
    }

    return (
        <Page renderToolbar={() =>
            <Toolbar>
                <div className="left">
                    <BackButton onClick={() => history.goBack()}>
                        back
                    </BackButton>
                </div>
                <div className="center" style={{textAlign: 'center'}}>
                    settings
                </div>
            </Toolbar>}
              contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto', paddingLeft: 5, paddingRight: 5}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                <div style={{paddingTop: 30}}>
                    <img src={logo} alt="stabubble logo"
                         style={{width: '30%', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}/>
                </div>
                <div style={{paddingLeft: 10, paddingRight: 10, textAlign: 'center'}}>
                    <h1>st andrews anonymous chat</h1>
                    <div style={{color: 'gray'}}>version: {version}</div>
                </div>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={logoutWarn}>
                    leave the bubble
                </Button>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={logoutAllWarn}>
                    leave the bubble (all devices)
                </Button>
                <Button modifier="large" disabled={true} style={{marginTop: 10, marginBottom: 10}}>
                    pack your bubbles (download data) (coming soon)
                </Button>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10, backgroundColor: '#ff3b30'}}
                        onClick={deleteAccountWarn}>
                    pop your bubbles (delete account)
                </Button>
            </div>
            <AlertDialog isOpen={displayWarning} onCancel={() => setDisplayWarning(false)} cancelable>
                <div className="alert-dialog-title">{warningMessage.title}</div>
                <div className="alert-dialog-content">
                    {warningMessage.message}
                </div>
                <div className="alert-dialog-footer">
                    <Button onClick={doAction} className="alert-dialog-button">
                        ok
                    </Button>
                    <Button onClick={() => setDisplayWarning(false)} className="alert-dialog-button">
                        cancel
                    </Button>
                </div>
            </AlertDialog>
        </Page>
    )
}

export default SettingsPage;