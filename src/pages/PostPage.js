import React from 'react';
import {BackButton, BottomToolbar, Icon, List, Page, Toolbar, ToolbarButton} from "react-onsenui";
import {SwipeableList} from '@sandstreamdev/react-swipeable-list';
import PostCard from "../components/PostCard";
import {Redirect, useHistory, useParams} from 'react-router-dom';
import {isEmpty, isLoaded, useFirebase, useFirebaseConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {AnimatePresence, motion} from "framer-motion";
import {
    deleteComment,
    deletePost,
    toggleCommentVoteDown,
    toggleCommentVoteUp,
    togglePostVoteDown,
    togglePostVoteUp
} from "../util/helpers";

function PostPage(props) {
    const history = useHistory();
    const {postId} = useParams();

    const firebase = useFirebase();
    const user = useSelector((state) => state.firebase.auth);

    useFirebaseConnect([
        {
            path: '/.info/connected'
        },
        {
            path: `/posts/owner/${user.uid}`
        },
        {
            path: `/posts/data/posts/${postId}`,
        },
        {
            path: `/posts/data/votes/${postId}`,
        },
        {
            path: `/comments/owner/${user.uid}`,
        },
        {
            path: `/comments/data/comments/${postId}`,
        },
        {
            path: `/comments/data/votes/${postId}`,
        },
    ], [postId, user]);

    const connected = useSelector((state) => state.firebase.data?.[""]?.info?.connected);

    const post = useSelector((state) => state.firebase.data?.posts?.data?.posts?.[postId]);
    const vote = useSelector((state) => state.firebase.data?.posts?.data?.votes?.[postId]);
    const userPosts = useSelector((state) => state.firebase.data?.posts?.owner?.[user.uid]);

    const comments = useSelector((state) => state.firebase.data?.comments?.data?.comments?.[postId]);
    const commentsVotes = useSelector((state) => state.firebase.data?.comments?.data?.votes?.[postId]);
    const userComments = useSelector((state) => state.firebase.data?.comments?.owner?.[user.uid]);

    const votePostUp = async (postId) => {
        await togglePostVoteUp(firebase, user, userPosts, postId);
    }

    const votePostDown = async (postId) => {
        await togglePostVoteDown(firebase, user, userPosts, postId);
    }

    const doDeletePost = async (postId) => {
        await deletePost(firebase, user, postId);
    }

    const voteCommentUp = async (commentId) => {
        await toggleCommentVoteUp(firebase, user, userComments, postId, commentId);
    }

    const voteCommentDown = async (commentId) => {
        await toggleCommentVoteDown(firebase, user, userComments, postId, commentId);
    }

    const doDeleteComment = async (commentId) => {
        await deleteComment(firebase, user, postId, commentId);
    }

    return (
        isLoaded(post) && isLoaded(vote) && isLoaded(userPosts &&
            isLoaded(comments) && isLoaded(commentsVotes) && isLoaded(userComments)) ?
            (!isEmpty(post) ?
                <Page
                    renderToolbar={() =>
                        <Toolbar>
                            <div className="left">
                                <BackButton onClick={() => history.goBack()}>
                                    back
                                </BackButton>
                            </div>
                            <div className="center">
                                a bubble!
                            </div>
                        </Toolbar>
                    }
                    renderBottomToolbar={() =>
                        <BottomToolbar style={{height: 49}}>
                            <div style={{height: '100%'}}>
                                <ToolbarButton style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                                               onClick={() => history.push(`/new/comment/${postId}/${post.type}`)}>
                                    <Icon size={32} icon="fa-plus-circle"/>
                                </ToolbarButton>
                            </div>
                        </BottomToolbar>
                    }
                    renderFixed={() =>
                        <AnimatePresence>
                            {isLoaded(connected) && !connected ?
                                <motion.div
                                    initial={{y: 50}}
                                    animate={{y: 0}}
                                    exit={{y: 50}}
                                    style={{
                                        position: 'absolute',
                                        bottom: 49,
                                        width: '100%',
                                        paddingTop: 10,
                                        paddingBottom: 10,
                                        backgroundColor: 'rgba(0, 0, 0, 0.2'
                                    }}>
                                    <div style={{textAlign: 'center', color: '#ff6961'}}>
                                        not connected!
                                    </div>
                                </motion.div> : null}
                        </AnimatePresence>
                    }
                    contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
                    <motion.div key={postId} layoutId={postId} style={{zIndex: 1000, position: 'relative'}}>
                        <PostCard
                            id={postId}
                            content={post.content}
                            upVotes={vote.up ?? 0}
                            downVotes={vote.down ?? 0}
                            created={post.created}
                            canDelete={userPosts?.posts?.[postId] ?? false}
                            voteDirection={userPosts?.votes?.[postId] ?? ''}
                            votePostUp={votePostUp}
                            votePostDown={votePostDown}
                            deletePost={doDeletePost}
                            commentsLength={Object.keys(comments ?? {}).length}
                            disableClick={true}
                        />
                    </motion.div>
                    <hr style={{margin: 0, borderColor: '#cfcfc4', borderWidth: 2, borderStyle: 'solid'}}/>
                    {!isEmpty(comments) ?
                        <SwipeableList
                            scrollStartThreshold={10}
                            swipeStartThreshold={10}
                            threshold={0.2}
                        >
                            <List>
                                {Object.entries(comments)
                                    .map(([key, value]) => [key,
                                        {
                                            ...value,
                                            upVotes: commentsVotes?.[key]?.up ?? 0,
                                            downVotes: commentsVotes?.[key]?.down ?? 0,
                                            voteDirection: userComments?.votes?.[postId]?.[key] ?? '',
                                            owner: userComments?.comments?.[postId]?.[key] ?? false
                                        }])
                                    .sort(([key1, value1], [key2, value2]) => {
                                        let aValue = 0;
                                        let bValue = 0;
                                        aValue = parseInt(value2.created);
                                        bValue = parseInt(value1.created);
                                        if (aValue > bValue) {
                                            return -1;
                                        }
                                        if (aValue < bValue) {
                                            return 1;
                                        }
                                        return 0;
                                    })
                                    .map(([key, value]) =>
                                        <motion.div key={key} layout
                                                    style={{zIndex: 1000, position: 'relative'}}>
                                            <PostCard
                                                id={key}
                                                content={value.content}
                                                upVotes={value.upVotes}
                                                downVotes={value.downVotes}
                                                created={value.created}
                                                canDelete={value.owner}
                                                voteDirection={value.voteDirection}
                                                votePostUp={voteCommentUp}
                                                votePostDown={voteCommentDown}
                                                deletePost={doDeleteComment}
                                                disableClick={true}
                                            />
                                        </motion.div>
                                    )}
                            </List>
                        </SwipeableList> :
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                            <div><span role="img"
                                       aria-label="cheeky face with tongue sticky out">😝</span> no replies yet
                            </div>
                        </div>
                    }
                </Page>
                :
                <Redirect to={{pathname: "/"}}/>)
            : <Page
                renderToolbar={() =>
                    <Toolbar>
                        <div className="left">
                            <BackButton onClick={() => history.goBack()}>
                                back
                            </BackButton>
                        </div>
                        <div className="center">
                            a bubble!
                        </div>
                    </Toolbar>
                }
                renderBottomToolbar={() =>
                    <BottomToolbar style={{height: 49}}>
                        <div style={{height: '100%'}}>
                            <ToolbarButton style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                                           onClick={() => history.push(`/new/comment/${postId}/${post.type}`)}>
                                <Icon size={32} icon="fa-plus-circle"/>
                            </ToolbarButton>
                        </div>
                    </BottomToolbar>
                }
                contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
                <motion.div key={postId} layoutId={postId} style={{zIndex: 1000, position: 'relative'}}>
                    <PostCard
                        id={postId}
                        content="Loading"
                        upVotes={0}
                        downVotes={0}
                        created={Date.now()}
                    />
                </motion.div>
                <hr style={{margin: 0, borderColor: '#cfcfc4', borderWidth: 2, borderStyle: 'solid'}}/>
            </Page>
    );
}

export default PostPage;