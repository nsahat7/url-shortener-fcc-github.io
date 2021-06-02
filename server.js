require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require ('url');
const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(mongoose.connection.readyState);

const urlSchema = new mongoose.Schema({ url: 'string'});
const Url = mongoose.model("Url", urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post("/api/shorturl", function(req, res) {
  const bodyUrl = req.body.url;
  
  dns.lookup(urlParser.parse(bodyUrl).hostname, (error, address) => {
    if(!address) {
      res.json({ error: "Invalid URL" });
    } else{
      const url = new Url({ url: bodyUrl });
      url.save((err, data) => {
        res.json({
          original_url: data.url,
          short_url: data.id
        })
      })
    console.log('error', error);
    console.log('address', address);
    }

  })

});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  
  Url.findById(id, (err, data) => {
    if(!data){
      res.json({ error: "Invalid URL" })
    } else{
      res.redirect(data.url);
    }
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});