const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const express = require('express');
const app = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send('Hello chatbee!');
});

app.get('/buzzes', (req, res) => {
    admin
        .firestore()
        .collection('buzzes')
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

    admin
        .firestore()
        .collection('buzzes')
        .add(newBuzz)
        .then((doc) => {
            res.json({ message: `Document ${doc.id} created successfully` });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Something went wrong' });
            console.error(err);
        });
});

exports.api = functions.https.onRequest(app);
