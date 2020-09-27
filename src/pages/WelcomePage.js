import React from 'react';
import {useHistory} from 'react-router-dom';
import {Button, Page, Toolbar} from "react-onsenui";

function WelcomePage(props) {
    const history = useHistory();
    return (
        <Page renderToolbar={() =>
            <Toolbar>
                <div className="center" style={{textAlign: 'center'}}>
                    stabubble
                </div>
            </Toolbar>}
              contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                paddingLeft: 5, paddingRight: 5}}>
                <div style={{paddingTop: 30}}>
                    <img alt="logo"
                         style={{width: '50%', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}/>
                </div>
                <div style={{paddingLeft: 10, paddingRight: 10, textAlign: 'center'}}>
                    <h1>st andrews anonymous chat</h1>
                </div>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}} onClick={() => history.push('/agree')}>
                    join the bubble
                </Button>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}} onClick={() => history.push('/login')}>
                    enter the bubble
                </Button>
            </div>
        </Page>
    )
}

export default WelcomePage;