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
                    <Card>you will need it to login</Card>
                    <Card>you <strong>won't</strong> see it again!</Card>
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
                    <Card><strong>don't</strong> share this passphrase with anyone else!</Card>
                    <Card>otherwise, they will be able to see your activity</Card>
                    <Card>this is <strong>not</strong> the code to invite a friend, you can find that at:
                        me -&gt; settings -&gt; invite</Card>
                </div>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={() => history.replace('/')}>i have saved it!</Button>
            </div>
        </Page>
    );
}

export default RegisterPage;