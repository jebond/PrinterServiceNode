//variables
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var whois = require('node-xwhois');
var cookieParser = require('cookie-parser');
var ioidhostname = [];
var bodyParser = require('body-parser');
var path = require('path');
var hostname = null;
var resolved = null;

app.use(cookieParser());
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//server init
server.listen(3003);
//routes

app.get('/', function (req, res) {
      ip = req.headers['x-real-ip'];
     // console.log(ip);
     // simpleip = ip.substr(7);
      resolved = dnsResolve(ip);
      if (resolved != null || resolved != '') {
      res.setHeader("hostname", "'" + resolved + "'");
      res.cookie('TNTscale',resolved);
      res.sendFile(__dirname + '/index.html');
      }
      else {
      res.sendFile(__dirname + '/index.html');  	  
}}
);

//postroute for the service
app.post('/addweight/', function(req, res) {
    var weight = req.body.weight;
    var computername = req.body.computername;
    io.sockets.in(computername).emit('new message',{
    username : computername,
    message : weight,
    computername : computername
});
    res.sendStatus(200);
});

//events
io.on('connection', function (socket) {
  socket.on('creategroup',function(data){
      socket.join(data.roomname);
    })
});

//helping functions
function dnsResolve(ip) {
      whois.reverse(ip)
      .then(hostnames => hostname = hostnames);
      if (hostname === null || hostname === undefined || hostname === "undefined") {
      	whois.reverse(ip)
      .then(hostnames => hostname = hostnames);
      }
      else {
      return hostname;
   }
 }
