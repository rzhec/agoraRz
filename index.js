// Create WebSocket connection.
// const socket = new WebSocket('ws://localhost:8080');
const socket = new WebSocket('wss://demowss.zhubb.top:443');
console.log('Connection Open');
// Connection opened
let channelName;
let uid;
let uid2;
let pingpong;
let tokenA;

function channelRNG(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
}

socket.addEventListener('open', function (event) {
    channelName = channelRNG(8);
    uid = randomInt(1, 4294967295);
    // uid2 = randomInt(1, 4294967295);

    let sendMessage = {
        channelName: channelName,
        uid: uid,
        type: 'initialize'
        // uid2: uid2
    };
    socket.send(JSON.stringify(sendMessage));

    // let pingpong = setInterval(() => {
    //     // console.log('channelName', channelName);
    //     socket.send(JSON.stringify(sendMessage));
    //     }, 5000);
    // // socket.send('Hello Server!');
    // // console.log("walaoheheheheh")
    // console.log('pingpong')
});

let initParams = {};
let params = {};

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event, event.data);
    let message = "";

    try {
        message = JSON.parse(event.data);
        if(message.type) {
            // clearInterval(pingpong);
            if(message.type === 'received'){
                clearInterval(pingpong)
            }else if (message.type === 'reject'){
                alert('User Reject Call');
                clearInterval(pingpong)
            }
        }else {
            initParams = {
                appID: message.appID,
                channel: message.channel,
                mode: 'live',
                codec: 'h264',
                uid: uid
            };

            // if (tokenA) {
            //     initParams.token = tokenA;
            // } else if (message.tokenA) {
            //     tokenA = message.tokenA;
            //     initParams.token = tokenA;
            // }

            if(message.tokenA) {
                tokenA = message.tokenA;
                initParams.token = tokenA;
            } else if (tokenA) {
                initParams.token = tokenA;
            }

            document.getElementById('uid').value = initParams.uid;
            document.getElementById('channel').value = initParams.channel;
            document.getElementById('token').value = tokenA;
        }
    } catch (e) {
        message = event.data;
    }

    console.log('initParams', initParams);
    params = initParams;

});

console.log("agora sdk version: " + AgoraRTC.VERSION + " compatible: " + AgoraRTC.checkSystemRequirements());
var resolutions = [
    {
        name: 'default',
        value: 'default',
    },
    {
        name: '480p',
        value: '480p',
    },
    {
        name: '720p',
        value: '720p',
    },
    {
        name: '1080p',
        value: '1080p'
    }
];

function Toastify (options) {
    M.toast({html: options.text, classes: options.classes});
}

var Toast = {
    info: (msg) => {
        Toastify({
            text: msg,
            classes: "info-toast"
        })
    },
    notice: (msg) => {
        Toastify({
            text: msg,
            classes: "notice-toast"
        })
    },
    error: (msg) => {
        Toastify({
            text: msg,
            classes: "error-toast"
        })
    }
};
function validator(formData, fields) {
    var keys = Object.keys(formData);
    for (let key of keys) {
        if (fields.indexOf(key) != -1) {
            if (!formData[key]) {
                Toast.error("Please Enter " + key);
                return false;
            }
        }
    }
    return true;
}

function serializeformData() {
    var formData = $("#form").serializeArray();
    var obj = {}
    for (var item of formData) {
        var key = item.name;
        var val = item.value;
        obj[key] = val;
    }
    return obj;
}

function addView (id, show) {
    if (!$("#" + id)[0]) {
        $("<div/>", {
            id: "remote_video_panel_" + id,
            class: "video-view",
        }).appendTo("#video");

        $("<div/>", {
            id: "remote_video_" + id,
            class: "video-placeholder",
        }).appendTo("#remote_video_panel_" + id);

        $("<div/>", {
            id: "remote_video_info_" + id,
            class: "video-profile " + (show ? "" :  "hide"),
        }).appendTo("#remote_video_panel_" + id);

        $("<div/>", {
            id: "video_autoplay_"+ id,
            class: "autoplay-fallback hide",
        }).appendTo("#remote_video_panel_" + id);
    }
}
function removeView (id) {
    if ($("#remote_video_panel_" + id)[0]) {
        $("#remote_video_panel_"+id).remove();
    }
}

function getDevices (next) {
    AgoraRTC.getDevices(function (items) {
        items.filter(function (item) {
            return ['audioinput', 'videoinput'].indexOf(item.kind) !== -1
        })
            .map(function (item) {
                return {
                    name: item.label,
                    value: item.deviceId,
                    kind: item.kind,
                }
            });
        var videos = [];
        var audios = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if ('videoinput' == item.kind) {
                var name = item.label;
                var value = item.deviceId;
                if (!name) {
                    name = "camera-" + videos.length;
                }
                videos.push({
                    name: name,
                    value: value,
                    kind: item.kind
                });
            }
            if ('audioinput' == item.kind) {
                var name = item.label;
                var value = item.deviceId;
                if (!name) {
                    name = "microphone-" + audios.length;
                }
                audios.push({
                    name: name,
                    value: value,
                    kind: item.kind
                });
            }
        }
        next({videos: videos, audios: audios});
    });
}

var rtc = {
    client: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {}
};

// var initParams = {
//     appID: '180b9e92a7b14eadbbcc7b25d1cbe08c',
//     channel: 'rzhec',
//     token: '006180b9e92a7b14eadbbcc7b25d1cbe08cIABCO4/zFuapZtGueGpDJADEF4ZToxS91ZGyBTey+47A8tIxR8sAAAAAEABXPAJxsemHXgEAAQCx6Yde',
//     mode: 'live',
//     codec: 'h264'
// };

function handleEvents (rtc) {
    // Occurs when an error message is reported and requires error handling.
    rtc.client.on("error", (err) => {
        console.log(err)
    })
    // Occurs when the peer user leaves the channel; for example, the peer user calls Client.leave.
    rtc.client.on("peer-leave", function (evt) {
        var id = evt.uid;
        console.log("id", evt);
        if (id != rtc.params.uid) {
            removeView(id);
        }
        Toast.notice("peer leave")
        console.log('peer-leave', id);
    })
    // Occurs when the local stream is published.
    rtc.client.on("stream-published", function (evt) {
        Toast.notice("stream published success")
        console.log("stream-published");
    })
    // Occurs when the remote stream is added.
    rtc.client.on("stream-added", function (evt) {
        var remoteStream = evt.stream;
        var id = remoteStream.getId();
        Toast.info("stream-added uid: " + id)
        if (id !== rtc.params.uid) {
            rtc.client.subscribe(remoteStream, function (err) {
                console.log("stream subscribe failed", err);
            })
        }
        console.log('stream-added remote-uid: ', id);
    });
    // Occurs when a user subscribes to a remote stream.
    rtc.client.on("stream-subscribed", function (evt) {
        var remoteStream = evt.stream;
        var id = remoteStream.getId();
        rtc.remoteStreams.push(remoteStream);
        addView(id);
        remoteStream.play("remote_video_" + id);
        Toast.info('stream-subscribed remote-uid: ' + id);
        console.log('stream-subscribed remote-uid: ', id);
    })
    // Occurs when the remote stream is removed; for example, a peer user calls Client.unpublish.
    rtc.client.on("stream-removed", function (evt) {
        var remoteStream = evt.stream;
        var id = remoteStream.getId();
        Toast.info("stream-removed uid: " + id)
        remoteStream.stop("remote_video_" + id);
        rtc.remoteStreams = rtc.remoteStreams.filter(function (stream) {
            return stream.getId() !== id
        })
        removeView(id);
        console.log('stream-removed remote-uid: ', id);
    })
    rtc.client.on("onTokenPrivilegeWillExpire", function(){
        // After requesting a new token
        // rtc.client.renewToken(token);
        Toast.info("onTokenPrivilegeWillExpire")
        console.log("onTokenPrivilegeWillExpire")
    });
    rtc.client.on("onTokenPrivilegeDidExpire", function(){
        // After requesting a new token
        // client.renewToken(token);
        Toast.info("onTokenPrivilegeDidExpire")
        console.log("onTokenPrivilegeDidExpire")
    })
}

/**
 * rtc: rtc object
 * option: {
 *  mode: string, 'live' | 'rtc'
 *  codec: string, 'h264' | 'vp8'
 *  appID: string
 *  channel: string, channel name
 *  uid: number
 *  token; string,
 * }
 **/
function join (rtc, option) {


    if (rtc.joined) {
        Toast.error("Your already joined");
        return;
    }

    /**
     * A class defining the properties of the config parameter in the createClient method.
     * Note:
     *    Ensure that you do not leave mode and codec as empty.
     *    Ensure that you set these properties before calling Client.join.
     *  You could find more detail here. https://docs.agora.io/en/Video/API%20Reference/web/interfaces/agorartc.clientconfig.html
     **/
    // console.log('option == ', option)
    rtc.client = AgoraRTC.createClient({mode: option.mode, codec: option.codec});

    rtc.params = option;
    // handle AgoraRTC client event
    handleEvents(rtc);
    // console.log('rtc.client', rtc.client)
    // init client
    rtc.client.init(option.appID, function () {
        console.log("init success", option);

        /**
         * Joins an AgoraRTC Channel
         * This method joins an AgoraRTC channel.
         * Parameters
         * tokenOrKey: string | null
         *    Low security requirements: Pass null as the parameter value.
         *    High security requirements: Pass the string of the Token or Channel Key as the parameter value. See Use Security Keys for details.
         *  channel: string
         *    A string that provides a unique channel name for the Agora session. The length must be within 64 bytes. Supported character scopes:
         *    26 lowercase English letters a-z
         *    26 uppercase English letters A-Z
         *    10 numbers 0-9
         *    Space
         *    "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", "{", "}", "|", "~", ","
         *  uid: number | null
         *    The user ID, an integer. Ensure this ID is unique. If you set the uid to null, the server assigns one and returns it in the onSuccess callback.
         *   Note:
         *      All users in the same channel should have the same type (number or string) of uid.
         *      If you use a number as the user ID, it should be a 32-bit unsigned integer with a value ranging from 0 to (232-1).
         **/
        // console.log('rtc.client',rtc.client)
        rtc.client.join(option.token ? option.token : null, option.channel, option.uid ? +option.uid : null, function (uid) {
            Toast.notice("join channel: " + option.channel + " success, uid: " + uid);
            console.log("join channel: " + option.channel + " success, uid: " + uid);
            rtc.joined = true;

            rtc.params.uid = uid;

            // create local stream
            rtc.localStream = AgoraRTC.createStream({
                streamID: rtc.params.uid,
                audio: true,
                video: option.video,
                screen: false,
                microphoneId: option.microphoneId,
                cameraId: option.cameraId
            })

            // init local stream
            rtc.localStream.init(function () {
                console.log("init local stream success");
                // play stream with html element id "local_stream"
                rtc.localStream.play("local_stream")

                // publish local stream
                publish(rtc);
            }, function (err)  {
                Toast.error("stream init failed, please open console see more detail")
                console.error("init local stream failed ", err);
            })
        }, function(err) {
            Toast.error("client join failed, please open console see more detail")
            console.error("client join failed", err)
        })
    }, (err) => {
        Toast.error("client init failed, please open console see more detail")
        console.error(err);
    });
}

function publish (rtc) {
    if (!rtc.client) {
        Toast.error("Please Join Room First");
        return;
    }
    if (rtc.published) {
        Toast.error("Your already published");
        return;
    }
    var oldState = rtc.published;

    // publish localStream
    rtc.client.publish(rtc.localStream, function (err) {
        rtc.published = oldState;
        console.log("publish failed");
        Toast.error("publish failed")
        console.error(err);
    })
    Toast.info("publish")
    rtc.published = true
}

function unpublish (rtc) {
    if (!rtc.client) {
        Toast.error("Please Join Room First");
        return;
    }
    if (!rtc.published) {
        Toast.error("Your didn't publish");
        return;
    }
    var oldState = rtc.published;
    rtc.client.unpublish(rtc.localStream, function (err) {
        rtc.published = oldState;
        console.log("unpublish failed");
        Toast.error("unpublish failed");
        console.error(err);
    })
    Toast.info("unpublish")
    rtc.published = false;
}

function leave (rtc) {
    if (!rtc.client) {
        Toast.error("Please Join First!");
        return;
    }
    if (!rtc.joined) {
        Toast.error("You are not in channel");
        return;
    }
    /**
     * Leaves an AgoraRTC Channel
     * This method enables a user to leave a channel.
     **/
    rtc.client.leave(function () {
        // stop stream
        rtc.localStream.stop();
        // close stream
        rtc.localStream.close();
        while (rtc.remoteStreams.length > 0) {
            var stream = rtc.remoteStreams.shift();
            var id = stream.getId();
            stream.stop();
            removeView(id);
        }
        rtc.localStream = null;
        rtc.remoteStreams = [];
        rtc.client = null;
        console.log("client leaves channel success");
        rtc.published = false;
        rtc.joined = false;
        Toast.notice("leave success");
    }, function (err) {
        console.log("channel leave failed");
        Toast.error("leave success");
        console.error(err);
    })
}

$(function () {

    getDevices(function (devices) {
        devices.audios.forEach(function (audio) {
            $('<option/>', {
                value: audio.value,
                text: audio.name,
            }).appendTo("#microphoneId");
        })
        devices.videos.forEach(function (video) {
            $('<option/>', {
                value: video.value,
                text: video.name,
            }).appendTo("#cameraId");
        })
        resolutions.forEach(function (resolution) {
            $('<option/>', {
                value: resolution.value,
                text: resolution.name
            }).appendTo("#cameraResolution");
        })
        M.AutoInit();
    })

    var fields = ['appID', 'channel'];

    $("#join").on("click", function (e) {
        console.log("join");
        e.preventDefault();
        params.video = true;
        // var params = serializeformData();
        if (validator(params, fields)) {
            console.log('validator true');
            join(rtc, params);
            uid2 = randomInt(1, 4294967295);

            let sendMessage = {
                channelName: channelName,
                uid2: uid2,
                video: true,
                type: 'send'
            };

            socket.send(JSON.stringify(sendMessage));
            console.log('pingpong');
            pingpong = setInterval(() => {
                socket.send(JSON.stringify(sendMessage))
            }, 5000);
        }
    })

    $("#publish").on("click", function (e) {
        console.log("publish")
        e.preventDefault();
        params.video = false;
        // var params = serializeformData();
        if (validator(params, fields)) {
            console.log('validator true');
            join(rtc, params);
            uid2 = randomInt(1, 4294967295);

            let sendMessage = {
                channelName: channelName,
                uid2: uid2,
                video: false,
                type: 'send'
            };

            socket.send(JSON.stringify(sendMessage));
            console.log('pingpong');
            pingpong = setInterval(() => {
                socket.send(JSON.stringify(sendMessage))
            }, 5000);
        }
    });

    $("#unpublish").on("click", function (e) {
        console.log("unpublish")
        e.preventDefault();
        // var params = serializeformData();
        if (validator(params, fields)) {
            unpublish(rtc);
        }
    });

    $("#leave").on("click", function (e) {
        console.log("leave")
        e.preventDefault();
        // var params = serializeformData();
        if (validator(params, fields)) {
            leave(rtc);
            clearInterval(pingpong);
        }
    })
})