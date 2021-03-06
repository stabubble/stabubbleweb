'use strict';
// from https://github.com/firebase/firebase-js-sdk/tree/master/packages/rules-unit-testing
// fixed assertFails issue
Object.defineProperty(exports, '__esModule', { value: true });

var firebase = require('firebase');
var request = require('request');
var util = require('@firebase/util');
var logger = require('@firebase/logger');
var component = require('@firebase/component');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

/**
 * @license
 * Copyright 2018 Google LLC
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
/** If this environment variable is set, use it for the database emulator's address. */
var DATABASE_ADDRESS_ENV = 'FIREBASE_DATABASE_EMULATOR_HOST';
/** The default address for the local database emulator. */
var DATABASE_ADDRESS_DEFAULT = 'localhost:9000';
/** If any of environment variable is set, use it for the Firestore emulator. */
var FIRESTORE_ADDRESS_ENV = 'FIRESTORE_EMULATOR_HOST';
/** The default address for the local Firestore emulator. */
var FIRESTORE_ADDRESS_DEFAULT = 'localhost:8080';
/** The actual address for the database emulator */
var _databaseHost = undefined;
/** The actual address for the Firestore emulator */
var _firestoreHost = undefined;
/** Create an unsecured JWT for the given auth payload. See https://tools.ietf.org/html/rfc7519#section-6. */
function createUnsecuredJwt(auth) {
    // Unsecured JWTs use "none" as the algorithm.
    var header = {
        alg: 'none',
        kid: 'fakekid'
    };
    // Ensure that the auth payload has a value for 'iat'.
    auth.iat = auth.iat || 0;
    // Use `uid` field as a backup when `sub` is missing.
    auth.sub = auth.sub || auth.uid;
    if (!auth.sub) {
        throw new Error("auth must be an object with a 'sub' or 'uid' field");
    }
    // Unsecured JWTs use the empty string as a signature.
    var signature = '';
    return [
        util.base64.encodeString(JSON.stringify(header), /*webSafe=*/ false),
        util.base64.encodeString(JSON.stringify(auth), /*webSafe=*/ false),
        signature
    ].join('.');
}
function apps() {
    return firebase.apps;
}
/** Construct an App authenticated with options.auth. */
function initializeTestApp(options) {
    return initializeApp(options.auth ? createUnsecuredJwt(options.auth) : undefined, options.databaseName, options.projectId);
}
/** Construct an App authenticated as an admin user. */
function initializeAdminApp(options) {
    var admin = require('firebase-admin');
    var app = admin.initializeApp(getAppOptions(options.databaseName, options.projectId), getRandomAppName());
    if (options.projectId) {
        app.firestore().settings({
            host: getFirestoreHost(),
            ssl: false
        });
    }
    return app;
}
function getDatabaseHost() {
    if (!_databaseHost) {
        var fromEnv = process.env[DATABASE_ADDRESS_ENV];
        if (fromEnv) {
            _databaseHost = fromEnv;
        }
        else {
            console.warn("Warning: " + DATABASE_ADDRESS_ENV + " not set, using default value " + DATABASE_ADDRESS_DEFAULT);
            _databaseHost = DATABASE_ADDRESS_DEFAULT;
        }
    }
    return _databaseHost;
}
function getFirestoreHost() {
    if (!_firestoreHost) {
        var fromEnv = process.env[FIRESTORE_ADDRESS_ENV];
        if (fromEnv) {
            _firestoreHost = fromEnv;
        }
        else {
            console.warn("Warning: " + FIRESTORE_ADDRESS_ENV + " not set, using default value " + FIRESTORE_ADDRESS_DEFAULT);
            _firestoreHost = FIRESTORE_ADDRESS_DEFAULT;
        }
    }
    return _firestoreHost;
}
function getRandomAppName() {
    return 'app-' + new Date().getTime() + '-' + Math.random();
}
function getAppOptions(databaseName, projectId) {
    var appOptions = {};
    if (databaseName) {
        appOptions['databaseURL'] = "http://" + getDatabaseHost() + "?ns=" + databaseName;
    }
    if (projectId) {
        appOptions['projectId'] = projectId;
    }
    return appOptions;
}
function initializeApp(accessToken, databaseName, projectId) {
    var _this = this;
    var appOptions = getAppOptions(databaseName, projectId);
    var app = firebase.initializeApp(appOptions, getRandomAppName());
    if (accessToken) {
        var mockAuthComponent = new component.Component('auth-internal', function () {
            return ({
                getToken: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({ accessToken: accessToken })];
                }); }); },
                getUid: function () { return null; },
                addAuthTokenListener: function (listener) {
                    // Call listener once immediately with predefined accessToken.
                    listener(accessToken);
                },
                removeAuthTokenListener: function () { }
            });
        }, "PRIVATE" /* PRIVATE */);
        app._addOrOverwriteComponent(mockAuthComponent);
    }
    if (databaseName) {
        // Toggle network connectivity to force a reauthentication attempt.
        // This mitigates a minor race condition where the client can send the
        // first database request before authenticating.
        app.database().goOffline();
        app.database().goOnline();
    }
    if (projectId) {
        app.firestore().settings({
            host: getFirestoreHost(),
            ssl: false
        });
    }
    /**
     Mute warnings for the previously-created database and whatever other
     objects were just created.
     */
    logger.setLogLevel(logger.LogLevel.ERROR);
    return app;
}
function loadDatabaseRules(options) {
    if (!options.databaseName) {
        throw Error('databaseName not specified');
    }
    if (!options.rules) {
        throw Error('must provide rules to loadDatabaseRules');
    }
    return new Promise(function (resolve, reject) {
        request.put({
            uri: "http://" + getDatabaseHost() + "/.settings/rules.json?ns=" + options.databaseName,
            headers: { Authorization: 'Bearer owner' },
            body: options.rules
        }, function (err, resp, body) {
            if (err) {
                reject(err);
            }
            else if (resp.statusCode !== 200) {
                reject(JSON.parse(body).error);
            }
            else {
                resolve();
            }
        });
    });
}
function loadFirestoreRules(options) {
    if (!options.projectId) {
        throw new Error('projectId not specified');
    }
    if (!options.rules) {
        throw new Error('must provide rules to loadFirestoreRules');
    }
    return new Promise(function (resolve, reject) {
        request.put({
            uri: "http://" + getFirestoreHost() + "/emulator/v1/projects/" + options.projectId + ":securityRules",
            body: JSON.stringify({
                rules: {
                    files: [{ content: options.rules }]
                }
            })
        }, function (err, resp, body) {
            if (err) {
                reject(err);
            }
            else if (resp.statusCode !== 200) {
                console.log('body', body);
                reject(JSON.parse(body).error);
            }
            else {
                resolve();
            }
        });
    });
}
function clearFirestoreData(options) {
    if (!options.projectId) {
        throw new Error('projectId not specified');
    }
    return new Promise(function (resolve, reject) {
        request['delete']({
            uri: "http://" + getFirestoreHost() + "/emulator/v1/projects/" + options.projectId + "/databases/(default)/documents",
            body: JSON.stringify({
                database: "projects/" + options.projectId + "/databases/(default)"
            })
        }, function (err, resp, body) {
            if (err) {
                reject(err);
            }
            else if (resp.statusCode !== 200) {
                console.log('body', body);
                reject(JSON.parse(body).error);
            }
            else {
                resolve();
            }
        });
    });
}
function assertFails(pr) {
    return pr.then(function (v) {
        return Promise.reject(new Error('Expected request to fail, but it succeeded.'));
    }, function (err) {
        var isPermissionDenied = (err && err.message && err.message.indexOf('PERMISSION_DENIED') >= 0) ||
            (err && err.code === 'permission-denied') ||
            (err && err.code === 'PERMISSION_DENIED');
        if (!isPermissionDenied) {
            return Promise.reject(new Error("Expected PERMISSION_DENIED but got unexpected error: " + err));
        }
        return err;
    });
}
function assertSucceeds(pr) {
    return pr;
}

Object.defineProperty(exports, 'database', {
    enumerable: true,
    get: function () {
        return firebase.database;
    }
});
Object.defineProperty(exports, 'firestore', {
    enumerable: true,
    get: function () {
        return firebase.firestore;
    }
});
exports.apps = apps;
exports.assertFails = assertFails;
exports.assertSucceeds = assertSucceeds;
exports.clearFirestoreData = clearFirestoreData;
exports.initializeAdminApp = initializeAdminApp;
exports.initializeTestApp = initializeTestApp;
exports.loadDatabaseRules = loadDatabaseRules;
exports.loadFirestoreRules = loadFirestoreRules;