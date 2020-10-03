import React, {useState} from 'react';
import {List, Page, ProgressCircular, Segment, Select, Toolbar} from "react-onsenui";
import {SwipeableList} from '@sandstreamdev/react-swipeable-list';
import PostCard from "../components/PostCard";

import {useSelector} from 'react-redux';
import {isEmpty, isLoaded, useFirebase, useFirebaseConnect} from 'react-redux-firebase';

import {AnimatePresence, motion} from "framer-motion";

import {locations, locationsAndWelcome} from "../constants";
import {deletePost, togglePostVoteDown, togglePostVoteUp} from "../util/helpers";

function HomePage(props) {
    const firebase = useFirebase();
    const user = useSelector((state) => state.firebase.auth) ?? {};
    const userProfile = useSelector((state) => state.firebase.profile);

    const [activeSegment, setActiveSegment] = useState(0);

    useFirebaseConnect([
        {
            path: '/.info/connected'
        },
        {
            path: `/posts/owner/${user.uid}`
        },
        {
            path: '/posts/data/posts',
            queryParams: ['orderByChild=location', `equalTo=${userProfile.location}`, "limitToLast=200"],
            storeAs: 'filteredPosts'
        },
    ], [user, userProfile]);

    const connected = useSelector((state) => state.firebase.data?.[""]?.info?.connected);

    const posts = useSelector((state) => state.firebase.data?.filteredPosts);
    useFirebaseConnect(Object.keys(posts ?? {}).flatMap(postId => [
        {
            path: `/posts/data/votes/${postId}`,
        }, {
            path: `/comments/data/comments/${postId}`,
        }]
    ), [posts]);

    const votes = useSelector((state) => state.firebase.data?.posts?.data?.votes);
    const comments = useSelector((state) => state.firebase.data?.comments?.data?.comments);

    const userPosts = useSelector((state) => state.firebase.data?.posts?.owner?.[user.uid]);

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
                            setActiveSegment(ev.activeIndex);
                        }}>
                            <button>new</button>
                            <button>popular</button>
                        </Segment>
                    </div>
                </Toolbar>
            }
            renderFixed={() =>
                <AnimatePresence>
                    {isLoaded(connected) && !connected ?
                        <motion.div
                            initial={{y: 50}}
                            animate={{y: 0}}
                            exit={{y: 50}}
                            style={{
                                position: 'absolute', bottom: 0, width: '100%', paddingTop: 10, paddingBottom: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.2'
                            }}>
                            <div style={{textAlign: 'center', color: '#ff6961'}}>
                                not connected!
                            </div>
                        </motion.div> : null}
                </AnimatePresence>
            }
            contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div>

                <div style={{
                    paddingLeft: 15, paddingTop: 5, display: 'inline-flex',
                    alignItems: 'center', minHeight: 40
                }}>
                    <span>you are at</span>
                    {isLoaded(userProfile) && !isEmpty(userProfile) ?
                        <Select value={userProfile?.location}
                                style={{paddingLeft: 15, paddingRight: 15}}
                                onChange={updateLocation}
                        >
                            {userProfile?.location === 'welcome' ?
                                locationsAndWelcome.map(loc => <option key={loc.id}
                                                                       value={loc.id}>{loc.name}</option>) :
                                locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </Select>

                        :
                        <Select value="loading" style={{paddingLeft: 15, paddingTop: 5}}>
                            <option key="loading">loading</option>
                        </Select>
                    }
                    {userProfile?.location === 'welcome' ? <span>(tap/click to change)</span> : null}
                </div>
                {isLoaded(posts) ?
                    (isLoaded(votes) && isLoaded(comments) && isLoaded(userPosts) &&
                    !isEmpty(posts) && !isEmpty(votes) && !isEmpty(comments) ?
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
                                    .map(([key, value]) =>
                                        <motion.div key={`home_${key}`} layout>
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
                        </SwipeableList> :
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                            <div><span role="img" aria-label="laughing face">😂</span> no bubbles here yet</div>
                        </div>)
                    : <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                        <ProgressCircular indeterminate/>
                        <div style={{paddingLeft: 10}}>loading bubbles</div>
                    </div>
                }
            </div>
        </Page>
    );
}

export default HomePage;