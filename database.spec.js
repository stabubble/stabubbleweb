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
});

