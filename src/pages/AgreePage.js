import React from 'react';

import {useHistory} from 'react-router-dom';
import {BackButton, Button, Card, Page, Toolbar} from "react-onsenui";

function AgreePage(props) {
    const history = useHistory();
    return (
        <Page renderToolbar={() =>
            <Toolbar>
                <div className="left">
                    <BackButton onClick={() => history.goBack()}>
                        back
                    </BackButton>
                </div>
                <div className="center">
                    some things first...
                </div>
            </Toolbar>}
              contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                paddingLeft: 5, paddingRight: 5
            }}>
                <div style={{paddingTop: 10, width: '100%'}}>
                    <Card>please be nice to everyone 😊</Card>
                    <Card>respect opinions of others</Card>
                    <Card>don't post any spam or personal information</Card>
                </div>
                <div style={{paddingTop: 10, width: '100%'}}>
                    <Card>we don't store any personally identifying info</Card>
                    <Card>the app is completely open source</Card>
                    <Card>view the code at: (fill in url)</Card>
                </div>
                <div style={{paddingTop: 10, width: '100%'}}>
                    <Card>blow your thought in a bubble</Card>
                    <Card>like or dislike bubbles by swiping right or left</Card>
                    <Card>reply to bubbles to leave comments</Card>
                </div>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={() => history.push('/token')}>
                    ok!
                </Button>
            </div>
        </Page>
    );
}

export default AgreePage;
