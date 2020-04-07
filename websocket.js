const WebSocket = require('ws');
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token');

var channelName = '';
var uid = 0;
var uid2 = 0;

// Rtc Examples
const appID = '180b9e92a7b14eadbbcc7b25d1cbe08c';
const appCertificate = '597c2fa5e5634411884258bc11a2b21f';
// const channelName = 'demooooooooo';
// const uid = randomInt(1, 4294967295);
// const uid2 = randomInt(1, 4294967295);
const role = RtcRole.PUBLISHER;

const expirationTimeInSeconds = 3600

const currentTimestamp = Math.floor(Date.now() / 1000)

const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

// IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

// Build token with uid
// const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
// console.log("Token With Integer Number Uid: " + tokenA);

// Build token with user account
// const tokenB = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid2, role, privilegeExpiredTs);
// console.log("Token With Integer Number Uid 2222: " + tokenA);

const wss = new WebSocket.Server({ port: 8080 });
// const wss = new WebSocket.Server({ port: 8080 });
let clients = [];

wss.on('connection', function connection(ws) {
    clients.push(ws);
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        if(message){
            // console.log('message == true', typeof(message))
            message = JSON.parse(message);
            channelName = message.channelName;
            uid = message.uid;
            uid2 = message.uid2;
            console.log('final checking', channelName, uid, uid2);
            var tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
            console.log("Token With Integer Number Uid: " + tokenA);

            var tokenB = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid2, role, privilegeExpiredTs);
            console.log("Token With Integer Number Uid 2222: " + tokenA);
        }

        let rtcParam = {
            appID: appID,
            channel: channelName,
            tokenA: tokenA,
            tokenB: tokenB,
            uid: uid,
            uid2: uid2
        };
        console.log('rtcParam',rtcParam);

        clients.forEach(function (client) {
            // client.send(message);
            client.send(JSON.stringify(rtcParam));
        });
    });

    // ws.send('something');
    // clients.forEach(function(client) {
    //     client.send("something");
    // });

    ws.on("close", function(code, message){
        console.log("Close the connection", code, message);
        removeClient(ws);
    });
});


function removeClient(socket) {
    if(!socket)
        return;

    var idx = -1;
    for( var i = 0; i < clients.length; i++ ){
        if( socket.id == clients[i].id ){
            idx = i;
            break;
        }
    }
    if(idx === -1)
        return;
    clients.splice(idx, 1);
}

function randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
}