import React, {useState} from 'react';
import {BackButton, BottomToolbar, Page, Toolbar, ToolbarButton} from "react-onsenui";
import NewText from "../components/NewText";
import {useHistory, useParams} from 'react-router-dom';
import {isEmpty, isLoaded, useFirebase} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {makeTextComment} from "../util/helpers";

function ComponentTypeSwitcher(props) {
    switch (props.type) {
        case 'text':
            return <NewText maxLength={280} data={props.data} setData={props.setData}/>
        default:
            return <NewText maxLength={280} data={props.data} setData={props.setData}/>
    }
}

function NewCommentPage(props) {
    const history = useHistory();
    const {postId, type} = useParams();

    const firebase = useFirebase();
    const user = useSelector((state) => state.firebase.auth);

    const [data, setData] = useState('');

    const addComment = async () => {
        switch (type) {
            case 'text':
                await makeTextComment(firebase, user, postId, data);
                break;
            default:
                await makeTextComment(firebase, user, postId, data);
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
                    <div className="center">
                        reply to bubble
                    </div>
                </Toolbar>
            }
            renderBottomToolbar={() =>
                <BottomToolbar style={{height: 49}}>
                    <div style={{height: '100%'}}>
                        <ToolbarButton
                            style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10}}
                            disabled={!isLoaded(user) || isEmpty(user) || !data}
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