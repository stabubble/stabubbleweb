import React, {useState} from 'react';
import {BackButton, BottomToolbar, Page, Toolbar, ToolbarButton} from "react-onsenui";
import NewText from "../components/NewText";
import {useHistory, useParams} from 'react-router-dom';
import {isEmpty, isLoaded, useFirebase} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {makeTextPost} from "../util/helpers";

function ComponentTypeSwitcher(props) {
    switch (props.type) {
        case 'text':
            return <NewText maxLength={280} data={props.data} setData={props.setData}/>
        default:
            return <NewText maxLength={280} data={props.data} setData={props.setData}/>
    }
}

function NewPostPage(props) {
    const history = useHistory();
    const {type} = useParams();

    const firebase = useFirebase();
    const user = useSelector((state) => state.firebase.auth);
    const userProfile = useSelector((state) => state.firebase.profile);

    const [data, setData] = useState('');

    const addPost = async () => {
        switch (type) {
            case 'text':
                await makeTextPost(firebase, user, userProfile, data);
                break;
            default:
                await makeTextPost(firebase, user, userProfile, data);
                break;
        }
    }

    return (
        <Page
            onKeyDown={(event) => {
                if (!event.shiftKey && (event.key === "Enter" || event.key === "NumpadEnter")) {
                    if (isLoaded(user) && isLoaded(userProfile) &&
                        !isEmpty(user) && !isEmpty(userProfile) && data) {
                        addPost();
                        history.push('/');
                    }
                }
            }}
            renderToolbar={() =>
                <Toolbar>
                    <div className="left">
                        <BackButton onClick={() => history.goBack()}>
                            back
                        </BackButton>
                    </div>
                    <div className="center">
                        new {type} bubble
                    </div>
                </Toolbar>
            }
            renderBottomToolbar={() =>
                <BottomToolbar style={{height: 49}}>
                    <div style={{height: '100%'}}>
                        <ToolbarButton
                            style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10}}
                            disabled={!isLoaded(user) || !isLoaded(userProfile) ||
                            isEmpty(user) || isEmpty(userProfile) || !data}
                            onClick={() => {
                                addPost();
                                history.push('/');
                            }}>
                            blow bubble
                        </ToolbarButton>
                    </div>
                </BottomToolbar>
            }
            contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <ComponentTypeSwitcher type={type} data={data} setData={setData}/>
        </Page>
    );
}

export default NewPostPage;