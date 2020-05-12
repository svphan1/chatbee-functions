const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const express = require('express');
const app = express();

var firebaseConfig = {
    apiKey: 'AIzaSyDtnLGHFwCWsVHlbV8rdUi13DQbqCEH6b0',
    authDomain: 'chatbee-43d0d.firebaseapp.com',
    databaseURL: 'https://chatbee-43d0d.firebaseio.com',
    projectId: 'chatbee-43d0d',
    storageBucket: 'chatbee-43d0d.appspot.com',
    messagingSenderId: '849862413464',
    appId: '1:849862413464:web:cfb0ec795ce7a20de794ed',
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send('Hello chatbee!');
});

app.get('/buzzes', (req, res) => {
    db.collection('buzzes')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let buzzes = [];
            data.forEach((doc) => {
                buzzes.push({
                    buzzId: doc.id,
                    ...doc.data(),
                });
            });
            return res.json(buzzes);
        })
        .catch((err) => console.log(err));
});

app.post('/buzz', (req, res) => {
    const newBuzz = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString(),
    };

    db.collection('buzzes')
        .add(newBuzz)
        .then((doc) => {
            res.json({ message: `Document ${doc.id} created successfully` });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Something went wrong' });
            console.error(err);
        });
});

// Signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // validate data
    db.doc(`/users/${newUser.Handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res
                    .status(400)
                    .json({ handle: 'This handle is already in use.' });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(
                        newUser.email,
                        newUser.password
                    );
            }
        })
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res
                    .status(400)
                    .json({ email: 'This email is already in use.' });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});

exports.api = functions.https.onRequest(app);
