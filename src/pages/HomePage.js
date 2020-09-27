import React, {useState, useEffect} from 'react';
import {
    BackButton,
    Button,
    Card,
    Icon,
    List,
    ListItem,
    Page,
    Segment,
    Select,
    Tab,
    Tabbar,
    Toolbar,
    ToolbarButton
} from "react-onsenui";
import {SwipeableList, SwipeableListItem} from '@sandstreamdev/react-swipeable-list';
import PostCard from "../components/PostCard";

import {useSelector} from 'react-redux';
import {useFirebaseConnect, isLoaded, isEmpty, useFirebase} from 'react-redux-firebase';

import {motion} from "framer-motion";

import {locations, locationsAndWelcome} from "../constants";
import {deletePost, togglePostVoteDown, togglePostVoteUp} from "../util/helpers";

function HomePage(props) {
    const firebase = useFirebase();
    const user = useSelector((state) => state.firebase.auth) ?? {};
    const userProfile = useSelector((state) => state.firebase.profile) ?? {};

    const [activeSegment, setActiveSegment] = useState(0);

    useFirebaseConnect([
        {
            path: `/posts/owner/${user.uid}`
        },
        {
            path: '/posts/data/posts',
            queryParams: ['orderByChild=location', `equalTo=${userProfile.location}`, "limitToLast=200"],
            storeAs: 'filteredPosts'
        },
    ], [user]);

    const posts = useSelector((state) => state.firebase.data?.filteredPosts) ?? {};
    useFirebaseConnect(Object.keys(posts).flatMap(postId => [
        {
            path: `/posts/data/votes/${postId}`,
        }, {
            path: `/comments/data/comments/${postId}`,
        }]
    ), [posts]);

    const votes = useSelector((state) => state.firebase.data?.posts?.data?.votes) ?? {};
    const comments = useSelector((state) => state.firebase.data?.comments?.data?.comments) ?? {};

    const userPosts = useSelector((state) => state.firebase.data?.posts?.owner?.[user.uid]) ?? {};

    const votePostUp = async (postId) => {
        await togglePostVoteUp(firebase, user, userPosts, postId);
    }

    const votePostDown = async (postId) => {
        await togglePostVoteDown(firebase, user, userPosts, postId);
    }

    const doDeletePost = async (postId) => {
        await deletePost(firebase, user, postId);
    }

    const updateLocation = (event) => {
        firebase.updateProfile({location: event.target.value});
    }

    return (
        <Page
            renderToolbar={() =>
                <Toolbar>
                    <div className="center" style={{textAlign: 'center'}}>
                        <Segment style={{width: '50%'}} onPostChange={(ev) => {
                            setActiveSegment(ev.activeIndex)
                        }}>
                            <button>new</button>
                            <button>popular</button>
                        </Segment>
                    </div>
                </Toolbar>
            }
            contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div>
                <Select value={userProfile?.location}
                        onChange={updateLocation}
                        style={{paddingLeft: 15, paddingTop: 5}}>
                    {userProfile?.location === 'welcome' ?
                        locationsAndWelcome.map(loc => <option key={loc.id}
                                                               value={loc.id}>{loc.name}</option>) :
                        locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </Select>
                <SwipeableList
                    scrollStartThreshold={10}
                    swipeStartThreshold={10}
                    threshold={0.2}
                >
                    <List>
                        {Object.entries(posts)
                            .map(([key, value]) => [key,
                                {
                                    ...value,
                                    upVotes: votes?.[key]?.up ?? 0,
                                    downVotes: votes?.[key]?.down ?? 0,
                                    voteDirection: userPosts?.votes?.[key] ?? '',
                                    owner: userPosts?.posts?.[key] ?? false,
                                    commentsLength: (Object.keys(comments?.[key] ?? {})).length
                                }])
                            .sort(([key1, value1], [key2, value2]) => {
                                let aValue = 0;
                                let bValue = 0;
                                if (activeSegment === 0) {
                                    aValue = parseInt(value1.created);
                                    bValue = parseInt(value2.created);
                                } else {
                                    aValue = parseInt(value1.upVotes) - parseInt(value1.downVotes);
                                    bValue = parseInt(value2.upVotes) - parseInt(value2.downVotes);
                                }
                                if (aValue > bValue) {
                                    return -1;
                                }
                                if (aValue < bValue) {
                                    return 1;
                                }
                                return 0;
                            })
                            .map(([key, value]) => <motion.div key={key} layout>
                                    <PostCard
                                        id={key}
                                        content={value.content}
                                        upVotes={value.upVotes}
                                        downVotes={value.downVotes}
                                        created={value.created}
                                        canDelete={value.owner}
                                        voteDirection={value.voteDirection}
                                        votePostUp={votePostUp}
                                        votePostDown={votePostDown}
                                        deletePost={doDeletePost}
                                        commentsLength={value.commentsLength}
                                    />
                                </motion.div>
                            )}
                    </List>
                </SwipeableList>
            </div>
        </Page>
    );
}

export default HomePage;