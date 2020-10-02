// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const crypto = require('crypto');
const util = require('util');

const diceware = require('diceware-generator');
const dicewareWord = require('diceware-wordlist-en-eff');
const userNameSalt = 'kLqzs2L4hfAcJpFt';
const {v4: uuidv4} = require('uuid');
const ipaddr = require('ipaddr.js');

const staIp = ipaddr.parseCIDR('138.251.0.0/16');

exports.generateToken = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const tokenRef = admin.database().ref('token');
    const userTokenRef = tokenRef.child('users').child(uid);
    const activeTokensRef = tokenRef.child('active');
    const userToken = await userTokenRef.once('value');
    if (userToken.exists()) {
        if (userToken.created > (Date.now() - (24 * 60 * 60 * 1000))) {
            return;
        }
    }
    const dicewareOptions = {
        language: dicewareWord,
        wordcount: 2,
        format: 'string'
    }
    const words = diceware(dicewareOptions);
    await userTokenRef.set({
        token: words,
        created: admin.database.ServerValue.TIMESTAMP,
        active: true
    });
    await activeTokensRef.child(words).set(admin.database.ServerValue.TIMESTAMP);
});

exports.register = functions.https.onCall(async (data, context) => {
    /*
    1) Check token exists
    2) If yes, go to 3, else return error
    3) Generate 5 words with niceware
    4) Part 1 + fixed salt -> sha256 -> user_id
    5) Check user_id does not exist otherwise go to 3
    6) Generate random salt
    7) Part 2.. -> scrypt(secret, salt, 64) -> hash
    8) Store user_id: { hash: , salt: }
    9) return login with user_id
     */
    const token = data.token && data.token.toString().trim().replace(/\W/g, ' ');
    if (token) {
        const activeTokenRef = admin.database().ref(`token/active`).child(token);
        const activeToken = await activeTokenRef.once('value');
        const tokenExists = activeToken.exists();
        const tokenValid = activeToken.val() > (Date.now() - (24 * 60 * 60 * 1000));
        const util = require('util');
        if ((tokenExists && tokenValid) ||
            (token === 'staipaddr' &&
                context.rawRequest.headers['x-appengine-user-ip'] &&
                ipaddr.IPv4.isValid(context.rawRequest.headers['x-appengine-user-ip']) &&
                ipaddr.parse(context.rawRequest.headers['x-appengine-user-ip']).match(staIp))) {
            let userId = '';
            let words = [];
            do {
                const dicewareOptions = {
                    language: dicewareWord,
                    wordcount: 5,
                    format: 'array'
                }
                words = diceware(dicewareOptions);

                const hash = crypto.createHash('sha256');
                hash.update(words[0] + userNameSalt);
                userId = hash.digest('hex');

                const authRef = admin.database().ref(`auth`);
                const userRef = authRef.child(userId);
                /* eslint-disable no-await-in-loop */
                const userObject = await userRef.once('value');
                /* eslint-enable no-await-in-loop */

                if (userObject && userObject.salt) {
                    userId = '';
                }
            } while (!userId);

            const randomBytes = util.promisify(crypto.randomBytes);
            const saltBuffer = await randomBytes(32);
            const saltString = saltBuffer.toString('hex');

            const scrypt = util.promisify(crypto.scrypt);
            const passphraseHashBuffer = await scrypt(words.slice(1).join(''), saltBuffer, 64);
            const passphraseHashString = passphraseHashBuffer.toString('hex');

            const uid = uuidv4();
            const customToken = await admin.auth().createCustomToken(uid);

            const authUserRef = admin.database().ref(`auth`).child(userId);
            await authUserRef.set({
                uid: uid,
                hash: passphraseHashString,
                salt: saltString,
                created: admin.database.ServerValue.TIMESTAMP
            });
            await activeTokenRef.set(null);
            const userTokenRef = admin.database().ref('token')
                .child('users').orderByChild('token').equalTo(token);
            const userTokenObj = (await userTokenRef.once('value')).val();
            const userToken = userTokenObj && Object.keys(userTokenObj).length && Object.keys(userTokenObj)[0];
            if (userToken) {
                await admin.database().ref('token')
                    .child('users').child(userToken).update({active: false});
            }
            return {
                result: 'ok',
                token: customToken,
                passphrase: words.join(' ')
            };
        } else if (tokenExists && !tokenValid) {
            await activeTokenRef.set(null);
        }
    }
    return {
        result: 'error',
        reason: 'invalidToken'
    };
});

exports.login = functions.https.onCall(async (data, context) => {
    /*
    1) Split passphrase
    2) Part 1 + fixed salt -> sha256 -> user_id
    3) Part 2.. -> scrypt (secret, salt from user object, 64) -> hash
    4) Compare with safe equals
    5) If true, return login else return error
     */
    const passphrase = data.passphrase && data.passphrase.split(/\s+/);

    if (passphrase && passphrase.length === 5) {
        const hash = crypto.createHash('sha256');
        hash.update(passphrase[0] + userNameSalt);
        const userId = hash.digest('hex');

        const authUserRef = admin.database().ref(`auth`).child(userId);
        const userObject = (await authUserRef.once('value')).val();
        if (userObject && userObject.salt) {
            const scrypt = util.promisify(crypto.scrypt);
            const passphraseHashBuffer = await scrypt(passphrase.slice(1).join(''),
                Buffer.from(userObject.salt, 'hex'), 64);
            const compare = crypto.timingSafeEqual(Buffer.from(userObject.hash, 'hex'), passphraseHashBuffer);
            if (compare) {
                const customToken = await admin.auth().createCustomToken(userObject.uid);
                return {
                    result: 'ok',
                    token: customToken
                };
            }
        }
    }
    return {
        result: 'error',
        reason: 'invalidUser'
    };
});

exports.logoutAll = functions.https.onCall(async (data, context) => {
    await admin.auth().revokeRefreshTokens(context.auth.uid);
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    await admin.auth().revokeRefreshTokens(uid);
    await admin.auth().deleteUser(uid);
    const authObject = await admin.database().ref('auth')
        .orderByChild('uid')
        .equalTo(uid)
        .once('value');
    const authIdObject = authObject.val() && Object.keys(authObject.val());
    const authId = authIdObject && authIdObject.length && authIdObject[0];
    await admin.database().ref('auth').child(authId).remove();
    await admin.database().ref('users').child(uid).remove();
    const postsOwnerRef = admin.database().ref('posts/owner').child(uid);
    const postOwner = (await postsOwnerRef.once('value')).val();
    if (postOwner && postOwner.posts) {
        const posts = postOwner.posts;
        Object.keys(posts).forEach(async (post) => {
            await admin.database().ref('posts/data/posts').child(post).remove();
            await admin.database().ref('posts/data/votes').child(post).remove();
            await admin.database().ref('comments/data/comments').child(post).remove();
            await admin.database().ref('comments/data/votes').child(post).remove();
        });
    }
    await postsOwnerRef.remove();
    const commentsOwnerRef = admin.database().ref('comments/owner').child(uid);
    const commentsOwner = (await commentsOwnerRef.once('value')).val();
    if (commentsOwner && commentsOwner.comments) {
        const comments = commentsOwner.comments;
        Object.keys(comments).forEach(async (postComment) => {
            if (postComment) {
                Object.keys(postComment).forEach(async (comment) => {
                    await admin.database().ref('comments/data/comments')
                        .child(postComment).child(comment).remove();
                    await admin.database().ref('comments/data/votes')
                        .child(postComment).child(comment).remove();
                });
            }
        });
    }
    await commentsOwnerRef.remove();
});
