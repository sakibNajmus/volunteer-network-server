const express = require('express')
const bodyParser = require('body-parser');
const cors = require ('cors');
require('dotenv').config();
const admin = require("firebase-admin");
const ObjectId = require('mongodb').ObjectId;

const port = 4000

const app = express()
app.use(cors());
app.use(bodyParser.json());



const serviceAccount = require("./volunteer-network-fire-auth-firebase-adminsdk-9uc9u-5a80a96a24.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-fire-auth.firebaseio.com"
});


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rqcp4.mongodb.net/volunteerNetwork?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const registrations = client.db("volunteerNetwork").collection("tasks");
  
  app.post('/addRegistration', (req, res) => {
      const newRegistration = req.body;
      registrations.insertOne(newRegistration)
      .then(result => {
          console.log(result)
          res.send(result.insertedCount > 0);
      })
      console.log(newRegistration)
  }) 
                

app.get('/tasklist', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            registrations.find({email: queryEmail})
            .toArray((err, documents) => {
                res.send(documents);
              })
          }
        }).catch(function (error) {

        });
    }
    else{
      res.status(401).send("Un authorized access!")
    }
})

app.delete('/taskdelete/:id', (req, res) => {
  console.log(req.params.id)
  registrations.deleteOne({ _id: ObjectId(req.params.id)})
    .then((result) => {
      res.send(result.deletedCount > 0);
    })
})
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)