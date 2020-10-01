/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const firebase = require("./test");
const http = require("http");
const fs = require("fs");

/**
 * The emulator will accept any database name for testing.
 */
const DATABASE_NAME = "stabubble";

/**
 * Creates a new client FirebaseApp with authentication and returns the Database instance.
 */
function getAuthedDatabase(auth) {
    return firebase
        .initializeTestApp({ databaseName: DATABASE_NAME, auth })
        .database();
}

/**
 * Creates a new admin FirebaseApp and returns the Database instance.
 */
function getAdminDatabase() {
    return firebase
        .initializeAdminApp({ databaseName: DATABASE_NAME })
        .database();
}

before(async () => {
    // Set database rules before running these tests
    const rules = fs.readFileSync("database.rules.json", "utf8");
    await firebase.loadDatabaseRules({
        databaseName: DATABASE_NAME,
        rules: rules,
    });
});

beforeEach(async () => {
    // Clear the database between tests
    await getAdminDatabase().ref().set(null);
});

after(async () => {
    // Close any open apps
    await Promise.all(firebase.apps().map((app) => app.delete()));
});

describe("profile rules", () => {
    it("should allow users to read their own profiles but not others", async () => {
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        await getAdminDatabase().ref("users/alice").set({
            location: 'test'
        });

        await firebase.assertSucceeds(alice.ref("users/alice").once("value"));
        await firebase.assertFails(bob.ref("users/alice").once("value"));
        await firebase.assertFails(noone.ref("users/alice").once("value"));
    });

    it("should allow users to modify their own profiles but not others", async () => {
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        await firebase.assertSucceeds(
            alice.ref("users/alice").update({
                location: "test",
            })
        );
        await firebase.assertFails(
            bob.ref("users/alice").update({
                location: "test",
            })
        );
        await firebase.assertFails(
            noone.ref("users/alice").update({
                location: "test",
            })
        );
    });

    it("should require users to have post token to update/create a post but not others", async () =>{
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);


        await firebase.assertFails(

            bob.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        );

        await firebase.assertFails(

            noone.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        );
        await firebase.assertSucceeds(

            alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        );
    });

    it("should require users to have post token to update/create a post but not a random one", async () =>{
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);
        await firebase.assertFails(

            alice.ref(`posts`).update({
                [`data/posts/random`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/random`]:{
                    up: 0,
                    down: 0
                },
            })
        );

        await firebase.assertFails(

            bob.ref(`posts`).update({
                [`data/posts/random`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/random`]:{
                    up: 0,
                    down: 0
                },
            })
        );

        await firebase.assertFails(

            noone.ref(`posts`).update({
                [`data/posts/random`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        );


        await firebase.assertSucceeds(

            alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        );

    });

    it("should let a user create a token they own but not to someone else", async () =>{
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);
        await firebase.assertFails(
            bob.ref('posts/owner/alice/posts').push(true)
        );

        await firebase.assertFails(
            noone.ref('posts/owner/alice/posts').push(true)
        );

        await firebase.assertSucceeds(
            alice.ref('posts/owner/alice/posts').push(true)
        );

    });

    it("should require users to have comment token to update/create a comment but not others", async () =>{
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);
        alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })

        const aliceCommentKey = await alice.ref(`comments/owner/alice/comments/${aliceKey.key}`).push(true);
        await firebase.assertFails(

            bob.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    type: 'text',
                    content: "test",
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        );

        await firebase.assertFails(

            noone.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    type: 'text',
                    content: "test",
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        );


        await firebase.assertSucceeds(

            alice.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    type: 'text',
                    content: "test",
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        );

    });

    it("should require users to have comment token to update/create a comment but not a random one", async () =>{
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);
        alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })

        const aliceCommentKey = await alice.ref(`comments/owner/alice/comments/${aliceKey.key}`).push(true);


        await firebase.assertFails(

            alice.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/random`]:{
                    type: 'text',
                    content: "test",
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}/random`]:{
                    up: 0,
                    down: 0
                },
            })
        );


        await firebase.assertFails(

            bob.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/random`]:{
                    type: 'text',
                    content: "test",
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}/random`]:{
                    up: 0,
                    down: 0
                },
            })
        );

        await firebase.assertFails(

            noone.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/random`]:{
                    type: 'text',
                    content: "test",
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}/random`]:{
                    up: 0,
                    down: 0
                },
            })
        );

        await firebase.assertSucceeds(

            alice.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    type: 'text',
                    content: "test",
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        );
    });

    it("should let a user create a comment token for themselves but not to someone else", async () =>{
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);

        alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })

        await firebase.assertFails(
            bob.ref(`comments/owner/alice/comments/${aliceKey.key}/`).push(true)
        );

        await firebase.assertFails(
            noone.ref(`comments/owner/alice/comments/${aliceKey.key}/`).push(true)
        );

        await firebase.assertSucceeds(
            alice.ref(`comments/owner/alice/comments/${aliceKey.key}/`).push(true)
        );
    });

    it("should require users to have post token to delete a post but not others", async () =>{
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);
        alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        await firebase.assertFails(

            bob.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:null,
                [`data/votes/${aliceKey.key}`]:null,
                [`owner/alice/posts/${aliceKey.key}`]:null
            })
        );
        await firebase.assertFails(

            noone.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:null,
                [`data/votes/${aliceKey.key}`]:null,
                [`owner/alice/posts/${aliceKey.key}`]:null
            })
        );


        await firebase.assertSucceeds(

            alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:null,
                [`data/votes/${aliceKey.key}`]:null,
                [`owner/alice/posts/${aliceKey.key}`]:null
            })
        );
    });

    it("should require users to have comment token to delete a comment but not others", async () =>{
        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);
        alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })

        const aliceCommentKey = await alice.ref(`comments/owner/alice/comments/${aliceKey.key}`).push(true);
        alice.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    type: 'text',
                    content: "test",
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}/${aliceCommentKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        await firebase.assertFails(

            bob.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/${aliceCommentKey.key}`]:null,
                [`data/votes/${aliceKey.key}/${aliceCommentKey.key}`]:null,
                [`owner/alice/comments/${aliceKey.key}/${aliceCommentKey.key}`]:null,
            })
        );
        await firebase.assertFails(

            noone.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/${aliceCommentKey.key}`]:null,
                [`data/votes/${aliceKey.key}/${aliceCommentKey.key}`]:null,
                [`owner/alice/comments/${aliceKey.key}/${aliceCommentKey.key}`]:null,
            })
        );


        await firebase.assertSucceeds(

            alice.ref(`comments`).update({
                [`data/comments/${aliceKey.key}/${aliceCommentKey.key}`]:null,
                [`data/votes/${aliceKey.key}/${aliceCommentKey.key}`]:null,
                [`owner/alice/comments/${aliceKey.key}/${aliceCommentKey.key}`]:null,
            })
        );

    });

    it("should require users to use your slot to vote, but not someone else's", async() =>{

        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);
        alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        await firebase.assertFails(
            bob.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: 'up',
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(+1)
            })
        );
        await firebase.assertFails(
            noone.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: 'up',
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(+1)
            })
        );

        await firebase.assertSucceeds(
            alice.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: 'up',
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(+1)
            })
        );
    })
    it("should require users to modify your slot to remove vote, but not someone else's", async() =>{

        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);
        alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
            alice.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: 'up',
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(+1)
            })

        await firebase.assertFails(
            bob.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: null,
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(-1)
            })
        );
        await firebase.assertFails(
            noone.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: null,
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(-1)
            })
        );

        await firebase.assertSucceeds(
            alice.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: null,
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(-1)
            })
        );
    })
    it("should require users to use your slot to vote, but not more than once", async() =>{

        const alice = getAuthedDatabase({ uid: "alice" });
        const bob = getAuthedDatabase({ uid: "bob" });
        const noone = getAuthedDatabase(null);

        const aliceKey = await alice.ref('posts/owner/alice/posts').push(true);
        alice.ref(`posts`).update({
                [`data/posts/${aliceKey.key}`]:{
                    type: 'text',
                    content: "test",
                    location: 'test',
                    created: firebase.database.ServerValue.TIMESTAMP,
                    modified: firebase.database.ServerValue.TIMESTAMP
                },
                [`data/votes/${aliceKey.key}`]:{
                    up: 0,
                    down: 0
                },
            })
        await firebase.assertSucceeds(
            alice.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: 'up',
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(+1)
            })
        );
        await firebase.assertFails(
            alice.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: 'up',
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(+1)
            })
        );
        await firebase.assertFails(
            alice.ref('posts').update( {
                [`owner/alice/votes/${aliceKey.key}`]: 'up',
                [`data/votes/${aliceKey.key}/up`]: firebase.database.ServerValue.increment(+1)
            })
        );
    })

});
