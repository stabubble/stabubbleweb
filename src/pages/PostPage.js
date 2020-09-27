import React from 'react';
import {BackButton, BottomToolbar, Icon, List, Page, Tabbar, Toolbar, ToolbarButton} from "react-onsenui";
import {SwipeableList, SwipeableListItem} from '@sandstreamdev/react-swipeable-list';
import PostCard from "../components/PostCard";
import {useHistory, useParams} from 'react-router-dom';
import {useFirebase, useFirebaseConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {motion} from "framer-motion";

function PostPage(props) {
    const history = useHistory();
    const {postId} = useParams();

    const userId = Math.floor(Math.random() * 100);

    useFirebaseConnect([
        {
            path: `/posts/owner/${userId}`
        },
        {
            path: `/posts/data/posts/${postId}`,
        },
        {
            path: `/posts/data/votes/${postId}`,
        },
        {
            path: `/comments/owner/${userId}`,
        },
        {
            path: `/comments/data/comments/${postId}`,
        },
        {
            path: `/comments/data/votes/${postId}`,
        },
    ]);

    const post = useSelector((state) => state.firebase.data?.posts?.data?.posts?.[postId]) ?? undefined;
    const vote = useSelector((state) => state.firebase.data?.posts?.data?.votes?.[postId]) ?? {};
    const userPosts = useSelector((state) => state.firebase.data?.posts?.owner?.[userId]) ?? {};

    const comments = useSelector((state) => state.firebase.data?.comments?.data?.comments?.[postId]) ?? {};
    const commentsVotes = useSelector((state) => state.firebase.data?.comments?.data?.votes?.[postId]) ?? {};
    const userComments = useSelector((state) => state.firebase.data?.comments?.owner?.[userId]) ?? {};

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

    const voteCommentUp = (commentId) => {
        firebase.update('comments', {
            [`owner/${userId}/votes/${postId}/${commentId}`]: 'up',
            [`data/votes/${postId}/${commentId}/up`]: firebase.database.ServerValue.increment(1)
        });
    }

    const voteCommentDown = (commentId) => {
        firebase.update('comments', {
            [`owner/${userId}/votes/${postId}/${commentId}`]: 'down',
            [`data/votes/${postId}/${commentId}/down`]: firebase.database.ServerValue.increment(1)
        });
    }

    const deleteComment = (commentId) => {
        firebase.update('comments', {
            [`owner/${userId}/comments/${postId}/${commentId}`]: null,
            [`data/comments/${postId}/${commentId}`]: null,
            [`data/votes/${postId}/${commentId}`]: null
        });
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
                    deletePost={deletePost}
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
                                        deletePost={deleteComment}
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