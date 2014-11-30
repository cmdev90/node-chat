
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, { log: false })
  , path = require('path');

var _ = require('lodash');
var crypto = require('crypto');

  // all environments
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({uploadDir:'./upload', keepExtensions : true}));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret : 'your secret here'}));
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));


  // development only
  if ('development' == app.get('env')) {
      app.use(express.errorHandler());
  }

  server.listen(3000);


  // Auto generate a random string of lenght len;
  var autoGen = function(len) {
    var map = "1234567890poiuytrewqasdfghjklmnbvcxz~!@#$%^&*POIUYTREWQASDFGHJKLMNBVCXZ",
        str = "";

    for(var i=0; i<len; ++i) {
      rand = Math.floor(Math.random() * map.length);
      str += map[rand];
    }

    return str;
  };

  var hash = function(password) {
    var salt = '3EKJ2_@&Ea',
        saltedpassword = password + salt;

    var sha1 = crypto.createHash('sha1').update(saltedpassword),
        hash = sha1.digest("hex");

    return hash;
  };

  var containsO = function(arr, target) {
    var flag = false
    _.each(arr, function(object) {
      if(_.contains(object, target))
        flag = true;
    });
    return flag;
  };

  // Status indicators for messages.
  var FLAGS = {
    NCC : 1, // new client connection.
    LIST : 2, // sends list of all avaliable clients.
    REM : 3, // remove client.
    CREQ : 4, // Chat request flag.
    JOINT : 5, // tells the client to join this room.
  }

  // Holds an up-to-date list of all the connected users.
  var connected = [];


  //  Helper function!
  // ==================
  var connect = function(socket) {
    // Using autoGen create a nonce of length 20;
    var nonce = autoGen(20);

    // alert others on the network about this new client.
    socket.broadcast.emit('alert', { 
      type : FLAGS.NCC,
      cid : socket.id,
    });

    // send the new client list of all clients already connected to network.
    socket.emit('alert', {
      type : FLAGS.LIST,
      clients : connected,
      me : socket.id,
      nonce : nonce,
    });

    // Add the client to list of connected clients.
    // Hash the nonce so that other clients can't view it.
    connected.push({cid : socket.id, nonce : hash(nonce)});
  };

  var disconnect = function(socket) {
    // Broadcast removal of socket from list.
    socket.broadcast.emit('alert', { 
      type : FLAGS.REM,
      cid : socket.id,
    });

    // Update the connection list.
    _.remove(connected, function(client) {
      return client.cid === socket.id;
    });
  };

  var openChat = function(socket, data) {

    if (containsO(connected, data.id)) {
      // Generate a room name of 30 chars long.
      var room_name = autoGen(30);

      socket.broadcast.emit('alert', {
        type : FLAGS.CREQ,
        cid : data.id,
        room : room_name,
      });

      socket.join(room_name);

      socket.emit('alert',{
        type : FLAGS.JOINT,
        room : room_name,
      });
    } else {
      socket.emit('err');
    }
  };

  var joinRoom = function(socket, data) {
    if(hash(data.nonce) === getNonce(socket.id)) {
      socket.join(data.room);
      socket.emit('alert',{
        type : FLAGS.JOINT,
        room : data.room,
      });
    };
  };

  var getNonce = function(id) {
    return _.find(connected, {cid : id}).nonce;
  };



  //  Sockets Main.
  // ===============
  io.sockets.on('connection', function(socket) {
    // Attach all events to the socket.
    socket.on('disconnect', function() {
      disconnect(this);
    });

    socket.on('chat', function(data) {
      openChat(this, data);
    });

    socket.on('acknowledge', function(data) {
      joinRoom(this, data);
    });

    socket.on('message', function(data) {
      console.log(data);
      socket.broadcast.to(data.room).emit('message', data);
    });

    // Add the socket to the connected pool
    // of sockets.
    connect(socket);
  });














  
  // socket.emit('connectionEstablished', { id : socket.id });

  // socket.broadcast.emit('newClientConnection', { message : 'A new client has connected. Private channel ' + socket.id })

  // socket.on('message', function (data){
  //   socket.emit('send', data);
  // });

// /**
//  * Module dependencies.
//  */

// var express = require('express'),
//     http = require('http'),
//     path = require('path');

// var app = express();
// var server = http.createServer(app);
// var io = require("socket.io").listen(server);

// // all environments
// app.set('port', process.env.PORT || 3000);
// app.set('views', __dirname + '/views');
// app.set('view engine', 'jade');
// app.use(express.favicon());
// app.use(express.logger('dev'));
// app.use(express.bodyParser({uploadDir:'./upload', keepExtensions : true}));
// app.use(express.methodOverride());
// app.use(express.cookieParser());
// app.use(express.session({secret : 'your secret here'}));
// app.use(app.router);
// app.use(require('stylus').middleware(__dirname + '/public'));
// app.use(express.static(path.join(__dirname, 'public')));


// // development only
// if ('development' == app.get('env')) {
//     app.use(express.errorHandler());
// }


// server.listen(app.get('port'), function(){
//     console.log('Express server listening on port ' + app.get('port'));
// });
