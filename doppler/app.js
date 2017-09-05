var id = "123";

var execSync = require('child_process').execSync;
var SerialPort = require('serialport');
var moment = require('moment');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'IPアドレス:9200',
  log: 'trace'
});

// http://akizukidenshi.com/download/ds/akizuki/AE-NJR4265_manual.pdf

var portName = execSync('ls /dev/serial/by-path/platform*',{encoding:'utf8'}).trim();
var sp = new SerialPort(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'odd',
    stopBits: 1,
    flowControl: false
});

var cmd = {
  '@C\r\n' : ['C', '接近', 1],
  '@L\r\n' : ['L', '離反', 2],
  '@N\r\n' : ['N', '停止', 3]
}

sp.on('data', function(input) {
  var buffer = new Buffer(input, 'utf8');
  var status = cmd[buffer.toString()];

  if(status){
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    var csv = `${date}, ${status[0]}, ${status[1]}`;
    console.log(csv);


    var datetime = moment().format('YYYYMMDD\THHmmss\Z');
    var json = {id:id, datetime:datetime, d1:status[0], d2:status[1], d3:status[2]};
    // console.log(json);
    client.index({
      index: 'wionode',
      type: 'school',
      body: json
    }, function (err, res) {
      // console.log(err)
    });

  }

});

