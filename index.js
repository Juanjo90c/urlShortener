require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser');

// Configuration port and database
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
})
const URL = mongoose.model('URL', urlSchema)
const urlRegex = /^(https?:\/\/)(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}([\/\w.-]*)?(\?.*)?$/;
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  let url_input = urlRegex.test(req.body.url)? req.body.url : 'invalid url'
  if (url_input == 'invalid url'){
    res.json({
      "error":url_input
    })
  }
  else {
    const urlNumber = Math.floor(Math.random()*1000)
    const newURL = new URL({
      original_url: url_input.toString(),
      short_url: urlNumber.toString()
    })
    newURL.save()
      .then((url) => {console.log(url)})
      .catch((err) => {console.error(err);})
    res.json({
      "original_url": newURL.original_url,
      "short_url": newURL.short_url
    })
  }
})

app.get('/api/shorturl/:shorturl', (req, res) =>{
  let shorturl = req.params.shorturl
  URL.findOne({short_url:shorturl})
  .then((founded) => {
    if (founded == null) return res.json({"error": "no short url founded"})
    else return res.redirect(founded.original_url)
  })
  .catch((err) => {console.error(err);})
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

