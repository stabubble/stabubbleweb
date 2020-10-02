import React from 'react';
import {Button, Page, Toolbar} from "react-onsenui";

import {useHistory} from 'react-router-dom';

function NewPostPrePage() {
    const history = useHistory();

    return (
        <Page
            renderToolbar={() =>
                <Toolbar>
                    <div className="center" style={{textAlign: 'center'}}>
                        new bubble
                    </div>
                </Toolbar>
            }
            contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto', paddingLeft: 5, paddingRight: 5}}
        >
            <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                    onClick={() => history.push('/new/post/text')}>
                new text bubble
            </Button>
            <Button disabled modifier="large" style={{marginTop: 10, marginBottom: 10}}>
                other bubble types (coming soon)
            </Button>
        </Page>
    );
}

export default NewPostPrePage;

