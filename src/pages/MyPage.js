import React, {useState} from 'react';
import {
    BackButton,
    Button,
    Card,
    Icon,
    List,
    ListItem,
    Page,
    Segment, Tab,
    Tabbar,
    Toolbar,
    ToolbarButton
} from "react-onsenui";
import {SwipeableList, SwipeableListItem} from '@sandstreamdev/react-swipeable-list';
import PostCard from "../components/PostCard";
import {useHistory} from 'react-router-dom';

function MyPage(props) {
    const [activeSegment, setActiveSegment] = useState(0);
    const history = useHistory();
    return (
        <Page
            renderToolbar={() =>
                <Toolbar>
                    <div className="left" style={{width: '25%'}}>
                    </div>
                    <div className="center" style={{textAlign: 'center', width: '50%'}}>
                        <Segment style={{width: '100%'}} onPostChange={(ev) => {
                            setActiveSegment(ev.activeIndex)
                        }}>
                            <button>new</button>
                            <button>popular</button>
                        </Segment>
                    </div>
                    <div className="right">
                        <ToolbarButton onClick={() => history.push('/settings')}>
                            <Icon icon="fa-cog"/>
                        </ToolbarButton>
                    </div>
                </Toolbar>
            }
            contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <SwipeableList
                scrollStartThreshold={10}
                swipeStartThreshold={10}
                threshold={0.2}
            >
                {/*<List>*/}
                {/*    {[].concat(props.posts)*/}
                {/*        .sort((a, b) => {*/}
                {/*                let aValue = 0;*/}
                {/*                let bValue = 0;*/}
                {/*                if (activeSegment === 0) {*/}
                {/*                    aValue = new Date(a.postedTime).getTime() / 1000;*/}
                {/*                    bValue = new Date(b.postedTime).getTime() / 1000;*/}
                {/*                } else {*/}
                {/*                    aValue = parseInt(a.up) - parseInt(a.down);*/}
                {/*                    bValue = parseInt(b.up) - parseInt(b.down);*/}
                {/*                }*/}
                {/*                if (aValue > bValue) {*/}
                {/*                    return -1;*/}
                {/*                }*/}
                {/*                if (aValue < bValue) {*/}
                {/*                    return 1;*/}
                {/*                }*/}
                {/*                return 0;*/}
                {/*            }*/}
                {/*        )*/}
                {/*        .map(el =>*/}
                {/*            <div key={el.id}><PostCard id={el.id} content={el.content} delete={true} up={el.up}*/}
                {/*                                       down={el.down} postedTime={el.postedTime}*/}
                {/*                                       votePost={props.votePost}/></div>*/}
                {/*        )}*/}
                {/*</List>*/}
            </SwipeableList>
        </Page>
    );
}

export default MyPage;