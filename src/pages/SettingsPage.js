import React from 'react';
import {useHistory} from 'react-router-dom';
import {BackButton, Button, Page, Toolbar} from "react-onsenui";

function SettingsPage(props) {
    const history = useHistory();
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
              contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                <div style={{paddingTop: 30}}>
                    <img alt="logo"
                         style={{width: '50%', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}/>
                </div>
                <div style={{paddingLeft: 10, paddingRight: 10, textAlign: 'center'}}>
                    <h1>st andrews anonymous chat</h1>
                </div>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={() => history.push('/welcome')}>
                    leave the bubble
                </Button>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}>
                    pack the bubble (download data)
                </Button>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10, backgroundColor: '#ff3b30'}}
                        onClick={() => history.push('/welcome')}>
                    pop the bubble (delete account)
                </Button>
            </div>
        </Page>
    )
}

export default SettingsPage;