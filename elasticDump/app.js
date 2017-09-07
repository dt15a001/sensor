const fs = require('fs');
const es = require('elasticsearch');
const http = require('http');

const client = new es.Client({
  host: 'http://IPアドレス:9200',
  log: 'trace'
});

var ws = fs.createWriteStream('dump.log', 'utf-8');
ws.on('drain', function ()         { console.log('write: drain'); })
  .on('error', function (exeption) { console.log('write: error'); })
  .on('close', function ()         { console.log('write: colse'); })
  .on('pipe',  function (src)      { console.log('write: pipe');  });

var count = 0;

client.search({
  index: 'wionode',
  type: 'school',
  sort: 'datetime:asc',
  size: '1000',
  scroll: '1m'
}, function getMoreUntilDone(error, response) {
  response.hits.hits.forEach(function (hit) {
    var d = hit._source;
    // console.log(d);
    ws.write(JSON.stringify(d)+'\n');//書込み.
    count++;
  });

  if (response.hits.total > count) {
    client.scroll({
      scrollId: response._scroll_id,
      scroll: '1m'
    }, getMoreUntilDone);
  } else {
    console.log('Finish!');
    ws.end();//終了.
  }
});
