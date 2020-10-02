import React, {useEffect, useState} from 'react';
import {Page, Tab, Tabbar} from "react-onsenui";

import HomePage from "../pages/HomePage";
import MyPage from "../pages/MyPage";
import NewPostPrePage from "../pages/NewPostPrePage";
import {useHistory, useParams} from "react-router-dom";

function HomeTabView(props) {
    const history = useHistory();
    const {tab} = useParams();
    const [index, setIndex] = useState(() => {
        if (tab === 'posts') {
            return 0;
        } else if (tab === 'new') {
            return 1;
        } else if (tab === 'me') {
            return 2;
        } else {
            history.replace('/');
        }
    });

    useEffect(() => {
        if (index === 0) {
            window.history.replaceState({}, '', `/home/posts/`);
        } else if (index === 1) {
            window.history.replaceState({}, '', `/home/new`);
        } else if (index === 2) {
            window.history.replaceState({}, '', `/home/me/`);
        }
    }, [index]);

    return (
        <div>
            <Page>
                <Tabbar
                    onPreChange={({index}) => setIndex(index)}
                    position='bottom'
                    index={index}
                    renderTabs={(activeIndex, tabbar) => [
                        {
                            content: <HomePage key="home" title="home" active={activeIndex === 0}
                                               tabbar={tabbar}/>,
                            tab: <Tab key="home" label="home" icon="fa-home"/>
                        },
                        {
                            content: <NewPostPrePage key="new" title="new post"
                                                     active={activeIndex === 1} tabbar={tabbar}/>,
                            tab: <Tab key="new" label="new bubble" icon="fa-plus-circle"/>
                        },
                        {
                            content: <MyPage key="me" title="me" active={activeIndex === 2}
                                             tabbar={tabbar}/>,
                            tab: <Tab key="me" label="me" icon="fa-user"/>
                        }]
                    }
                />
            </Page>
        </div>
    );
}

export default HomeTabView;

