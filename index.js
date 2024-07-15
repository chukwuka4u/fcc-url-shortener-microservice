require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url')
const { MongoClient } = require('mongodb');
const res = require('express/lib/response');


const client = new MongoClient('mongodb+srv://chukwukadiemma:' + process.env.DB_PSD + '@cluster1.lpcsfos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1')
try {
  client.connect().then(
    console.log("connected successfully")
  )
}
catch(e) {
  console.log(e)
}
const db = client.db('db1')
const collection = db.collection('urls')
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use('/api/shorturl', bodyParser.urlencoded({extended: false}) );

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  let url = req.body.url; //original url ourl
  dns.lookup(urlParser.parse(url).hostname,
  async function (err, address) {
    if (!address) {
      res.json({error: 'invalid url'})
      return;
    } else {
      const urlCount = await collection.countDocuments()
      await collection.insertOne({
        url,
        count: urlCount
      })
      res.json({
        original_url: url,
        short_url: urlCount
      })
    }
  }
)
});
app.get('/api/shorturl/:shorturl', async function(req, res) {
 let surl = req.params.shorturl;
 const urlDoc = await collection.findOne({count: +surl});
 res.redirect(urlDoc.url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
