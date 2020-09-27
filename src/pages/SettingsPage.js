import React from 'react';
import {useHistory} from 'react-router-dom';
import {BackButton, Button, Page, Toolbar} from "react-onsenui";
import {useFirebase} from "react-redux-firebase";
import logo from '../images/logo512.png';

function SettingsPage(props) {
    const history = useHistory();
    const firebase = useFirebase();

    const logout = async () => {
        await firebase.logout();
        history.push('/welcome');
    }

    const logoutMultiple = async () => {
        const logoutAll = firebase.functions().httpsCallable('logoutAll');
        await logoutAll();
        await logout();
    }

    const deleteAccount = async () => {
        const deleteUser = firebase.functions().httpsCallable('deleteUser');
        await deleteUser();
        await logout();
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
                </div>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={logout}>
                    leave the bubble
                </Button>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={logoutMultiple}>
                    leave the bubble (all devices)
                </Button>
                <Button modifier="large" disabled={true} style={{marginTop: 10, marginBottom: 10}}>
                    pack the bubble (download data) (coming soon)
                </Button>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10, backgroundColor: '#ff3b30'}}
                        onClick={deleteAccount}>
                    pop the bubble (delete account)
                </Button>
            </div>
        </Page>
    )
}

export default SettingsPage;