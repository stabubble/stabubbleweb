import React from 'react';
import {Button, Page, Toolbar} from "react-onsenui";

import {useHistory} from 'react-router-dom';
import {useSelector} from "react-redux";

function NewPostPrePage() {
    const history = useHistory();
    const userProfile = useSelector((state) => state.firebase.profile);

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
            {userProfile?.location === 'all' ?
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                    <div>
                        you need to select a location<br/>
                        on the top of the home screen<br/>
                        which is not "st andrews bubble"<br/>
                        to post
                    </div>
                </div>
                :
                <div>
                    <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                            onClick={() => history.push('/new/post/text')}>
                        new text bubble
                    </Button>
                    <Button disabled modifier="large" style={{marginTop: 10, marginBottom: 10}}>
                        other bubble types (coming soon)
                    </Button>
                </div>
            }
        </Page>
    );
}

export default NewPostPrePage;

