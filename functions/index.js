// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const crypto = require('crypto');
const util = require('util');

const niceware = require('niceware');
const userNameSalt = 'kLqzs2L4hfAcJpFt';
const { v4: uuidv4 } = require('uuid');

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
    const token = data.token && data.token.toString().replace(/\W/g, '');
    if (token) {
        const activeTokenRef = admin.database().ref(`token/active`).child(token);
        //TODO check for expiry instead
        const tokenExists = (await activeTokenRef.once('value')).exists();
        if (tokenExists) {
            let userId = '';
            let words = [];
            do {
                words = niceware.generatePassphrase(10);

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
            return {
                result: 'ok',
                token: customToken,
                passphrase: words.join(' ')
            };
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

