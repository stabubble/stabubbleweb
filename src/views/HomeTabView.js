import React, {useState} from 'react';
import {Page, Tab, Tabbar} from "react-onsenui";
import HomePage from "../pages/HomePage";
import SettingsPage from "../pages/SettingsPage";
import NewPostPage from "../pages/NewPostPage";
import MyPage from "../pages/MyPage";
import NewPostPrePage from "../pages/NewPostPrePage";

/*
bgColor:#FFFFFF
baseColor:#DB8DBD
subColor:#F5D7E7
subColor:#D1EAF4
 */

function HomeTabView(props) {

    const [index, setIndex] = useState(0);

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

