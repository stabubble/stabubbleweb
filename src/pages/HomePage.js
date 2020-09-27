import React, {useState, useEffect} from 'react';
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

import {useSelector} from 'react-redux';
import {useFirebaseConnect, isLoaded, isEmpty, useFirebase} from 'react-redux-firebase';

import {motion} from "framer-motion";

function HomePage(props) {
    const [activeSegment, setActiveSegment] = useState(0);

    const userId = Math.floor(Math.random() * 100);

    useFirebaseConnect([
        {
            path: `/posts/owner/${userId}`
        },
        {
            path: '/posts/data',
        },
    ]);

    const posts = useSelector((state) => state.firebase.data?.posts?.data?.posts) ?? {};
    const votes = useSelector((state) => state.firebase.data?.posts?.data?.votes) ?? {};
    const userPosts = useSelector((state) => state.firebase.data?.posts?.owner?.[userId]) ?? {};

    const firebase = useFirebase();

    const votePostUp = (postId) => {
        firebase.update('posts', {
            [`owner/${userId}/votes/${postId}`]: 'up',
            [`data/votes/${postId}/up`]: firebase.database.ServerValue.increment(1)
        });
    }

    const votePostDown = (postId) => {
        firebase.update('posts', {
            [`owner/${userId}/votes/${postId}`]: 'down',
            [`data/votes/${postId}/down`]: firebase.database.ServerValue.increment(1)
        });
    }

    const deletePost = (postId) => {
        firebase.update('posts', {
            [`owner/${userId}/posts/${postId}`]: null,
            [`data/posts/${postId}`]: null,
            [`data/votes/${postId}`]: null
        });
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
                                owner: userPosts?.posts?.[key] ?? false
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
                                    deletePost={deletePost}
                                />
                            </motion.div>
                        )}
                </List>
            </SwipeableList>
        </Page>
    );
}

export default HomePage;