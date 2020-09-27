import React, {useState} from 'react';
import {BackButton, BottomToolbar, Icon, Page, Toolbar, ToolbarButton} from "react-onsenui";
import PostCard from "../components/PostCard";
import NewText from "../components/NewText";
import {useHistory, useParams} from 'react-router-dom';
import {useFirebase} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {makeTextPost} from "../util/helpers";

function ComponentTypeSwitcher(props) {
    switch (props.type) {
        case 'text':
            return <NewText maxLength={280} data={props.data} setData={props.setData}/>
    }
}

function NewPostPage(props) {
    const history = useHistory();
    const {type} = useParams();

    const firebase = useFirebase();
    const user = useSelector((state) => state.firebase.auth) ?? {};
    const userProfile = useSelector((state) => state.firebase.profile) ?? {};

    const [data, setData] = useState('');

    const addPost = async () => {
        switch (type) {
            case 'text':
                await makeTextPost(firebase, user, userProfile, data);
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
                        new bubble
                    </div>
                </Toolbar>
            }
            renderBottomToolbar={() =>
                <BottomToolbar style={{height: 49}}>
                    <div style={{height: '100%'}}>
                        <ToolbarButton
                            style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10}}
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