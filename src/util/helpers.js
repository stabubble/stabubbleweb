import {isEmpty} from "react-redux-firebase";

export const makeTextPost = async (firebase, user, userProfile, data) => {
    const newPostRef = await firebase.push(`posts/owner/${user.uid}/posts`, true);
    await firebase.update(`posts`, {
        [`data/posts/${newPostRef.key}`]: {
            type: 'text',
            content: data,
            location: userProfile?.location ?? 'welcome',
            created: firebase.database.ServerValue.TIMESTAMP,
            modified: firebase.database.ServerValue.TIMESTAMP
        },
        [`data/votes/${newPostRef.key}`]: {
            up: 0,
            down: 0
        },
    });
}

export const makeTextComment = async (firebase, user, postId, data) => {
    const newCommentRef = await firebase.push(`comments/owner/${user.uid}/comments/${postId}`, true);
    await firebase.update(`comments`, {
        [`data/comments/${postId}/${newCommentRef.key}`]: {
            type: 'text',
            content: data,
            created: firebase.database.ServerValue.TIMESTAMP,
            modified: firebase.database.ServerValue.TIMESTAMP
        },
        [`data/votes/${postId}/${newCommentRef.key}`]: {
            up: 0,
            down: 0
        }
    });
}

export const togglePostVoteUp = async (firebase, user, userObj, postId) => {
    if (userObj?.votes?.[postId] === 'up') {
        await firebase.update('posts', {
            [`owner/${user.uid}/votes/${postId}`]: null,
            [`data/votes/${postId}/up`]: firebase.database.ServerValue.increment(-1)
        });
    } else if (userObj?.votes?.[postId] === 'down') {
        await firebase.update('posts', {
            [`owner/${user.uid}/votes/${postId}`]: null,
            [`data/votes/${postId}/down`]: firebase.database.ServerValue.increment(-1)
        });
        await firebase.update('posts', {
            [`owner/${user.uid}/votes/${postId}`]: 'up',
            [`data/votes/${postId}/up`]: firebase.database.ServerValue.increment(1)
        });
    } else if (isEmpty(userObj?.votes?.[postId])) {
        await firebase.update('posts', {
            [`owner/${user.uid}/votes/${postId}`]: 'up',
            [`data/votes/${postId}/up`]: firebase.database.ServerValue.increment(1)
        });
    }
}

export const togglePostVoteDown = async (firebase, user, userPostObj, postId) => {
    if (userPostObj?.votes?.[postId] === 'down') {
        await firebase.update('posts', {
            [`owner/${user.uid}/votes/${postId}`]: null,
            [`data/votes/${postId}/down`]: firebase.database.ServerValue.increment(-1)
        });
    } else if (userPostObj?.votes?.[postId] === 'up') {
        await firebase.update('posts', {
            [`owner/${user.uid}/votes/${postId}`]: null,
            [`data/votes/${postId}/up`]: firebase.database.ServerValue.increment(-1)
        });
        await firebase.update('posts', {
            [`owner/${user.uid}/votes/${postId}`]: 'down',
            [`data/votes/${postId}/down`]: firebase.database.ServerValue.increment(1)
        });
    } else if (isEmpty(userPostObj?.votes?.[postId])) {
        await firebase.update('posts', {
            [`owner/${user.uid}/votes/${postId}`]: 'down',
            [`data/votes/${postId}/down`]: firebase.database.ServerValue.increment(1)
        });
    }
}

export const toggleCommentVoteUp = async (firebase, user, userCommentObj, postId, commentId) => {

    if (userCommentObj?.votes?.[postId]?.[commentId] === 'up') {
        await firebase.update('comments', {
            [`owner/${user.uid}/votes/${postId}/${commentId}`]: null,
            [`data/votes/${postId}/${commentId}/up`]: firebase.database.ServerValue.increment(-1)
        });
    } else if (userCommentObj?.votes?.[postId]?.[commentId] === 'down') {
        await firebase.update('comments', {
            [`owner/${user.uid}/votes/${postId}/${commentId}`]: null,
            [`data/votes/${postId}/${commentId}/down`]: firebase.database.ServerValue.increment(-1)
        });
        await firebase.update('comments', {
            [`owner/${user.uid}/votes/${postId}/${commentId}`]: 'up',
            [`data/votes/${postId}/${commentId}/up`]: firebase.database.ServerValue.increment(1)
        });
    } else if (isEmpty(userCommentObj?.votes?.[postId]?.[commentId])) {
        await firebase.update('comments', {
            [`owner/${user.uid}/votes/${postId}/${commentId}`]: 'up',
            [`data/votes/${postId}/${commentId}/up`]: firebase.database.ServerValue.increment(1)
        });
    }
}

export const toggleCommentVoteDown = async (firebase, user, userCommentObj, postId, commentId) => {
    if (userCommentObj?.votes?.[postId]?.[commentId] === 'down') {
        await firebase.update('comments', {
            [`owner/${user.uid}/votes/${postId}/${commentId}`]: null,
            [`data/votes/${postId}/${commentId}/down`]: firebase.database.ServerValue.increment(-1)
        });
    } else if (userCommentObj?.votes?.[postId]?.[commentId] === 'up') {
        await firebase.update('comments', {
            [`owner/${user.uid}/votes/${postId}/${commentId}`]: null,
            [`data/votes/${postId}/${commentId}/up`]: firebase.database.ServerValue.increment(-1)
        });
        await firebase.update('comments', {
            [`owner/${user.uid}/votes/${postId}/${commentId}`]: 'down',
            [`data/votes/${postId}/${commentId}/down`]: firebase.database.ServerValue.increment(1)
        });
    } else if (isEmpty(userCommentObj?.votes?.[postId]?.[commentId])) {
        await firebase.update('comments', {
            [`owner/${user.uid}/votes/${postId}/${commentId}`]: 'down',
            [`data/votes/${postId}/${commentId}/down`]: firebase.database.ServerValue.increment(1)
        });
    }
}

export const deletePost = async (firebase, user, postId) => {
    await firebase.update('posts', {
        [`owner/${user.uid}/posts/${postId}`]: null,
        [`data/posts/${postId}`]: null,
        [`data/votes/${postId}`]: null
    });
}

export const deleteComment = async (firebase, user, postId, commentId) => {
    firebase.update('comments', {
        [`owner/${user.uid}/comments/${postId}/${commentId}`]: null,
        [`data/comments/${postId}/${commentId}`]: null,
        [`data/votes/${postId}/${commentId}`]: null
    });
}