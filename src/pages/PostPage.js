import React from 'react';
import {BackButton, BottomToolbar, Icon, List, Page, Tabbar, Toolbar, ToolbarButton} from "react-onsenui";
import {SwipeableList, SwipeableListItem} from '@sandstreamdev/react-swipeable-list';
import PostCard from "../components/PostCard";
import {useHistory, useParams} from 'react-router-dom';
import {useFirebase, useFirebaseConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {motion} from "framer-motion";
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
    const user = useSelector((state) => state.firebase.auth) ?? {};
    const userProfile = useSelector((state) => state.firebase.profile) ?? {};

    useFirebaseConnect([
        {
            path: `/posts/owner/${user.uid}`
        },
        {
            path: `/posts/data/posts/${user.uid}`,
        },
        {
            path: `/posts/data/votes/${user.uid}`,
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

    const post = useSelector((state) => state.firebase.data?.posts?.data?.posts?.[postId]) ?? undefined;
    const vote = useSelector((state) => state.firebase.data?.posts?.data?.votes?.[postId]) ?? {};
    const userPosts = useSelector((state) => state.firebase.data?.posts?.owner?.[user.uid]) ?? {};

    const comments = useSelector((state) => state.firebase.data?.comments?.data?.comments?.[postId]) ?? {};
    const commentsVotes = useSelector((state) => state.firebase.data?.comments?.data?.votes?.[postId]) ?? {};
    const userComments = useSelector((state) => state.firebase.data?.comments?.owner?.[user.uid]) ?? {};

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
        post ?
            <Page
                renderToolbar={() =>
                    <Toolbar>
                        <div className="left">
                            <BackButton onClick={() => history.goBack()}>
                                back
                            </BackButton>
                        </div>
                        <div className="center" style={{textAlign: 'center'}}>
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
                    commentsLength={(Object.keys(comments) ?? {}).length}
                />
                <hr style={{margin: 0, borderColor: '#cfcfc4', borderWidth: 2, borderStyle: 'solid'}}/>
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
                            .map(([key, value]) => <motion.div key={key} layout>
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
                                    />
                                </motion.div>
                            )}
                    </List>
                </SwipeableList>
            </Page>
            :
            <Page>
                bubble not found
            </Page>
    );
}

export default PostPage;