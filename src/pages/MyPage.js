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
import {useFirebase, useFirebaseConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {deletePost, togglePostVoteDown, togglePostVoteUp} from "../util/helpers";
import {motion} from "framer-motion";
import {locationsAndWelcome} from "../constants";

function MyPage(props) {
    const [activeSegment, setActiveSegment] = useState(0);
    const history = useHistory();

    const locationsMap = locationsAndWelcome.reduce((acc, location) =>
        ({...acc, [location.id]: location.name}), {});

    const firebase = useFirebase();
    const user = useSelector((state) => state.firebase.auth) ?? {};
    const userProfile = useSelector((state) => state.firebase.profile) ?? {};

    useFirebaseConnect([
        {
            path: `/posts/owner/${user.uid}`
        },
    ], [user]);

    const userPosts = useSelector((state) => state.firebase.data?.posts?.owner?.[user.uid]) ?? {};
    useFirebaseConnect(Object.keys(userPosts?.posts ?? {}).flatMap(postId => [
        {
            path: `/posts/data/posts/${postId}`,
        },
        {
            path: `/posts/data/votes/${postId}`,
        },
        {
            path: `/comments/data/comments/${postId}`,
        }]
    ), [userPosts]);

    const posts = useSelector((state) => state.firebase.data?.posts?.data?.posts) ?? {};
    const votes = useSelector((state) => state.firebase.data?.posts?.data?.votes) ?? {};
    const comments = useSelector((state) => state.firebase.data?.comments?.data?.comments) ?? {};


    const votePostUp = async (postId) => {
        await togglePostVoteUp(firebase, user, userPosts, postId)
    }

    const votePostDown = async (postId) => {
        await togglePostVoteDown(firebase, user, userPosts, postId);
    }

    const doDeletePost = async (postId) => {
        await deletePost(firebase, user, postId);
    }

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
                <List>
                    {Object.keys(userPosts?.posts ?? {})
                        .map((key) => [key,
                            {
                                ...posts[key],
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
                                    location={locationsMap?.[value.location] ?? 'unknown location'}
                                />
                            </motion.div>
                        )}
                </List>
            </SwipeableList>
        </Page>
    );
}

export default MyPage;