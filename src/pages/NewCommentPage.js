import React, {useState} from 'react';
import {BackButton, BottomToolbar, Icon, Page, Toolbar, ToolbarButton} from "react-onsenui";
import PostCard from "../components/PostCard";
import NewText from "../components/NewText";
import {useHistory, useParams} from 'react-router-dom';
import {useFirebase} from "react-redux-firebase";

function ComponentTypeSwitcher(props) {
    switch (props.type) {
        case 'text':
            return <NewText maxLength={140} data={props.data} setData={props.setData}/>
    }
}

function NewCommentPage(props) {
    const history = useHistory();
    const {postId, type} = useParams();

    const [data, setData] = useState('');

    const firebase = useFirebase();

    const userId = Math.floor(Math.random() * 100);

    const addComment = async () => {
        switch (type) {
            case 'text':
                const newCommentRef = await firebase.push(`comments/owner/${userId}/comments/${postId}`, true);
                await firebase.update(`comments`, {
                    [`data/comments/${postId}/${newCommentRef.key}`]: {
                        type: 'text',
                        content: data,
                        created: firebase.database.ServerValue.TIMESTAMP,
                        modified: firebase.database.ServerValue.TIMESTAMP
                    },
                    [`data/votes/${postId}/${newCommentRef.key}`]: {
                        up: 0,
                        down: 0
                    }
                });
                break;
        }
    }

    return (
        <Page
            renderToolbar={() =>
                <Toolbar>
                    <div className="left">
                        <BackButton onClick={() => history.goBack()}>
                            back
                        </BackButton>
                    </div>
                    <div className="center" style={{textAlign: 'center'}}>
                        reply to bubble
                    </div>
                </Toolbar>
            }
            renderBottomToolbar={() =>
                <BottomToolbar style={{height: 49}}>
                    <div style={{height: '100%'}}>
                        <ToolbarButton
                            style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10}}
                            onClick={() => {
                                addComment();
                                history.goBack();
                            }}>
                            blow reply
                        </ToolbarButton>
                    </div>
                </BottomToolbar>
            }
            contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <ComponentTypeSwitcher type={type} data={data} setData={setData}/>
        </Page>
    );
}

export default NewCommentPage;