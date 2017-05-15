const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 4649 });
const channel = process.argv[2];
let count = 0;
require('colors');

if(typeof process.argv[2] == 'undefined' || process.argv[2] == '') {
    console.log("Usage : " + process.argv[0] + " " + process.argv[1]);
    process.exit(1);
}
console.log("===================================");
console.log("ChatAssistX".green + " Server by Lastorder-DC");
console.log("Distributed by MIT License");
console.log("===================================\n");

console.log("INFO".green + " : ChatAssistX server started");

wss.on('listening', function(ws) {
    console.log("INFO".green + " : Now listening port 4649...");
})

wss.on('error', function(ws) {
    console.log("ERROR".red + " : Websocket error occured!");
})

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

let TAPIC = require('tapic');
let oauth = 'usexgv9w2ikqi1lpx8x94q1dqhh3d9';

function sendConfig() {
    var config = {};
    config.type = "config";
    config.presetName = "default";
    config.platformIcon = true;
    config.platform = "all";
    config.animation = "fade";
    config.chatFade = 30;
    config.font = "Jeju Gothic";
    config.fontUsernameSize = 14;
    config.fontUsernameColor = "255, 255, 255";
    config.fontChatSize = 16;
    config.fontChatColor = "255, 255, 255";
    config.backgroundColor = "255, 255, 255";
    config.backgroundAlpha = 0;
    config.chatBackgroundColor = "100, 100, 100";
    config.chatBackgroundAlpha = 25;
    
    wss.broadcast(JSON.stringify(config));
    setTimeout(sendConfig,5000);
}

function heartbeat() {
  this.isAlive = true;
}

function sendChat(rawbody) {
/*
{ from: '오얍레',
color: '#d2691e',
mod: false,
sub: false,
turbo: false,
streamer: false,
action: false,
text: '스마슈가아니라 스마갤이겠지',
emotes: '',
badges: [ '' ],
room_id: '66375105',
user_id: '113614342',
bits: undefined }
*/
    var chat = {};
    
    chat.type = "chat_message";
    chat.platform = 'twitch';
    chat.username = rawbody.from;
    chat.message = rawbody.text.replace(/"/g,'\"');
    chat.emotes = rawbody.emotes;
    wss.broadcast(JSON.stringify(chat));
}

sendConfig();

TAPIC.setup(oauth, function (username) {
    TAPIC.joinChannel(channel,function(){
        console.log("INFO".green + " : Connected to channel " + channel);
    });
});

//TAPIC.listen('raw', event => sendChat(event,ws));
TAPIC.listen('message', event => sendChat(event));


wss.on('connection', function connection(ws) {
    console.log("INFO".green + " : ChatAssist client connected.");
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    //TAPIC.listen('echoChat', event => console.log('echochat > ' + event));
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
        console.log("INFO : Client disconnected");
        return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping('', false, true);
  });
}, 30000);