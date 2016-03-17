var dgram = require('dgram');
var os = require('os');

var networkinterfaces = [];

exports.sendEvent = function(eventcontent) {
  var interfaces = os.networkInterfaces();
  networkinterfaces = [];
  Object.keys(interfaces).forEach(function (ifname) {
    console.log(ifname);
    networkinterfaces.push(ifname);
  });
  buzz(eventcontent, 0);
/*  var dgramClient = dgram.createSocket('udp6');
  dgramClient.on('message', (msg, rinfo) => {
    console.log("===============================");
    console.log(msg);
    console.log("===============================");
    console.log(`CLIENT got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  });
  dgramClient.on('listening', function() {
    var address = dgramClient.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    dgramClient.setBroadcast(true)
    dgramClient.setMulticastTTL(128);
    dgramClient.addMembership('FF02::6004');
    buzz(eventcontent, 0);
  });
  dgramClient.bind(6004, 'localhost');*/
}

function buzz(eventcontent, i) {
  console.log("INTERAFACES:"+networkinterfaces.length);
  var dgramServer = dgram.createSocket('udp6');
  var message = createMessage(eventcontent);
  if(i<networkinterfaces.length) {
    sendMessage(dgramServer, message, networkinterfaces[i], function(){
      buzz(eventcontent, i+1);
    });
  } else {
    dgramServer.close();
  }
}

function sendMessage(dgramServer, message, networkinterface, callback) {
    dgramServer.send(message, 0, message.length, 6004, 'FF02::6004%'+networkinterface, function(err, bytes) {
    if (err) {
      console.log("err when sending send UDP Message");
    }
    callback();
    console.log("server close");
  });
}

function createMessage(eventcontent) {
  var date = new Date();
  var dateString = date.getTime();
  var event = {eventtime: dateString, eventcontent: eventcontent};
  var message = new Buffer(JSON.stringify(event));
  //var message = new Buffer("door");
  console.log(message);
  return message;
}

//OLD STUFF
function tryLeds(number) {
  var dgramClient = dgram.createSocket('udp6');
  var buf = new Buffer(630);
  for (var i = 0; i < buf.length; i++) {
    if ((i + 1) % 3 == 0) {
      buf[i] = 0;
    } else {
      buf[i] = 0;
    }

  }
  console.log(buf);

  dgramClient.send(buf, 0, buf.length, 2812, '2a01:170:1112:0:bad8:12ff:fe66:fa1', function(err, bytes) {
    if (err) {
      throw err;
    }
    // Reuse the message buffer,
    // or close client
    console.log("close");
    dgramClient.close();
  });
}
