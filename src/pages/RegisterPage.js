import React from 'react';
import {useHistory} from 'react-router-dom';
import {Button, Card, Page, Toolbar} from "react-onsenui";

function RegisterPage() {
    const history = useHistory();

    if (!history?.location?.state?.passphrase) {
        history.replace('/');
    }

    return (
        <Page renderToolbar={() =>
            <Toolbar>
                <div className="center" style={{textAlign: 'center'}}>
                    joining bubble...
                </div>
            </Toolbar>}
              contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                paddingLeft: 5, paddingRight: 5
            }}>
                <div style={{paddingTop: 10, width: '100%'}}>
                    <Card>write down, copy the passphrase or screenshot this screen</Card>
                    <Card>you will need it to login again</Card>
                </div>
                <div style={{paddingTop: 10, width: '100%'}}>
                    <Card style={{backgroundColor: '#ffb347'}}>
                        <div className="title">your passphrase</div>
                        <textarea className="textarea textarea--transparent" rows="2" style={{width: '100%'}}
                                  value={history?.location?.state?.passphrase} readOnly={true}>
                        </textarea>
                    </Card>
                </div>
                <div style={{paddingTop: 10, width: '100%'}}>
                    <Card>you won't see it again!</Card>
                </div>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={() => history.replace('/')}>i have saved it!</Button>
            </div>
        </Page>
    );
}

export default RegisterPage;