const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send('Hello chatbee!');
});

exports.getBuzzes = functions.https.onRequest((req, res) => {
    admin
        .firestore()
        .collection('buzzes')
        .get()
        .then((data) => {
            let buzzes = [];
            data.forEach((doc) => {
                buzzes.push(doc.data());
            });
            return res.json(buzzes);
        })
        .catch((err) => console.log(err));
});

exports.createBuzzes = functions.https.onRequest((req, res) => {
    const newBuzz = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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
