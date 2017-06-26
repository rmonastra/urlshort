const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const randomstring = require("randomstring");
const cors = require('cors');
const dns = require('dns');
const path = require('path');
const shortUrl = require('./models/shortUrl');

let app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(process.cwd() + 'public'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

mongoose.Promise = global.Promise;
let dbUrl = process.env.MONGOLAB_URI;
mongoose.connect(dbUrl || 'mongodb://localhost/shortUrls');


app.post('/api/shorturl/new', (req, res) => {
  // Regexp for domains
  let formatRegex = /(?:[\w-]+\.)+[\w-]+/;
  let findUrl = formatRegex.exec(req.body.url)[0];
  dns.lookup(findUrl, function(err, address, family) {
    let shortId = randomstring.generate(6);

    if (address) {
      let postedUrl = new shortUrl({
        original_url: findUrl
      });
      postedUrl.save((err, url) => {
        res.json({
          original_url: findUrl,
          short_url: shortId
        });
      })
    } else {
      res.json({
        error: "Are you sure you typed something correctly?"
      });
    }
  })
});

app.get("/api/shorturl/:urlShort", (req, res) => {
  shortUrl.findOne({
    short_url: req.params.urlShort
  }, (err, data) => {
    if (err) return res.json("It's not me, it's you");
    console.log(data);
    return data ? res.redirect("https://" + data.original_url) : res.send("Error, remind me to never let you guide me!");
    
  });
});

//Listen on connection port
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Listening on port: " + port);
});
