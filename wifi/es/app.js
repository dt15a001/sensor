var elasticsearch = require('elasticsearch');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var client = new elasticsearch.Client({
  host: 'IPアドレス:9200',
  log: 'trace'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(3000);

app.post('/', function(req, res) {
    req.body && client.index({
      index: 'wionode',
      type: 'school',
      body: req.body
    }, function (err, res) {
      // console.log(err)
    });

    res.send('OK');
})
