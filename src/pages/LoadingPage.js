import React from 'react';
import {Page, ProgressCircular} from "react-onsenui";

function LoadingPage(props) {
    return (
        <Page>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                <ProgressCircular indeterminate/>
                <div style={{paddingLeft: 10}}>preparing bubble</div>
            </div>
        </Page>
    );
}

export default LoadingPage;