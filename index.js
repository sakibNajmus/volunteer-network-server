const express = require('express')
const bodyParser = require('body-parser');
const cors = require ('cors');
require('dotenv').config();

const port = 4000

const app = express()
app.use(cors());
app.use(bodyParser.json());

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
    registrations.find({email: req.query.email})
    .toArray((err, documents) => {
        res.send(documents)
    })
  })
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})