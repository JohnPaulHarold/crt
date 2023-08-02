var hbbtvMimetypes = {
    applicationManager: 'application/oipfApplicationManager',
    broadcastVideo: 'video/broadcast',
};

var broadcastObject = {
    videoObj: null,
    currentLiveChannel: null,
    initialize: function () {
        broadcastObject.videoObj = document.getElementById('broadcastVideo');
        broadcastObject.videoObj.addEventListener(
            'PlayStateChange',
            broadcastObject.playStateChangeEventHandler
        );
        try {
            broadcastObject.videoObj.bindToCurrentChannel();
            broadcastObject.videoObj.setFullScreen(false);
            broadcastObject.currentLiveChannel =
                broadcastObject.videoObj.currentChannel;
            return true;
        } catch (error) {
            broadcastObject.currentLiveChannel = null;
            return false;
        }
    },
    getChannelList: function () {
        try {
            return broadcastObject.videoObj.getChannelConfig().channelList;
        } catch (error) {
            return null;
        }
    },
    getChannelInfo: function (ch) {
        var channelInfo =
            '' + ch.name + '(' + ch.onid + ',' + ch.tsid + ',' + ch.sid + ')';
        return channelInfo;
    },
    playStateChangeEventHandler: function () {
        var playStateField = document.getElementById('playState_field');
        switch (broadcastObject.videoObj.playState) {
            case 0: // unrealized
                playStateField.innerHTML = 'Unrealized';
                break;
            case 1: // connecting
                playStateField.innerHTML = 'Connecting';
                break;
            case 2: // presenting
                playStateField.innerHTML = 'Presenting';
                break;
            case 3: // stopped
                playStateField.innerHTML = 'Stopped';
                break;
            default:
                playStateField.innerHTML = 'Error';
        }
    },
};

function createSafeArea() {
    var bodyEl = document.getElementsByTagName('body')[0];
    var div = document.createElement('div');
    div.setAttribute('class', 'hbbtv safe_area');
    div.setAttribute('id', 'app_area');

    div.innerHTML =
        '<!-- status display fields and channel list -->' +
        '<div class="status_text">video/broadcast object initialization: <span id="inititalization_field">waiting...</span></div>' +
        '<div class="status_text">video/broadcast object playState: <span id="playState_field">...</span></div>' +
        '<div class="status_text">video/broadcast object currentChannel: <span id="currentChannel_field">acquiring...</span></div>' +
        '<ul class="channel_list_general" id="channelList_field">' +
        '<li class="channel_list_header">Obtained channel list (may be truncated):</li>' +
        '</ul>';

    bodyEl.appendChild(div);
}

function createHbbtvDomObject(mimetype) {
    var objEl = document.createElement('object');
    var container = document.getElementById('hbbtv-objects');
    var bodyEl = document.getElementsByTagName('body')[0];
    var type = mimetype.split('/')[1];

    objEl.setAttribute('type', type);
    objEl.setAttribute('id', type);
    container.appendChild(objEl);
    bodyEl.appendChild(container);
}

function createHbbTVObject(mimetype) {
    switch (mimetype) {
        case hbbtvMimetypes.applicationManager:
            createHbbtvDomObject(mimetype);
            break;

        default:
            break;
    }
}

function launchHbbtvApp() {
    try {
        // attempt to acquire the Application object
        var appManager = document.getElementById('applicationManager');
        var appObject = appManager.getOwnerApplication(document);

        // check if Application object was a success
        if (appObject === null) {
            console.error('error acquiring the Application object!');
        } else {
            var i, li, availableChannels;
            // we have the Application object, and we proceed with broadcast_object initialization

            if (broadcastObject.initialize()) {
                // initialization OK, so display message and current channel
                document.getElementById('inititalization_field').innerHTML =
                    'Success';

                if (broadcastObject.currentLiveChannel !== null) {
                    document.getElementById('currentChannel_field').innerHTML =
                        broadcastObject.getChannelInfo(
                            broadcastObject.currentLiveChannel
                        );
                } else {
                    document.getElementById('currentChannel_field').innerHTML =
                        'null';
                }

                // get available channels
                availableChannels = broadcastObject.getChannelList();
                // append channels to list
                try {
                    if (availableChannels.length > 0) {
                        for (i = 0; i < availableChannels.length; i++) {
                            li = document.createElement('li');
                            li.innerHTML = broadcastObject.getChannelInfo(
                                availableChannels.item(i)
                            );
                            document
                                .getElementById('channelList_field')
                                .appendChild(li);
                        }
                    } else {
                        throw 'No channels in list';
                    }
                } catch (channelError) {
                    // channel error occurred
                    li = document.createElement('li');
                    li.innerHTML = 'channel_error: ' + channelError;
                    document
                        .getElementById('channelList_field')
                        .appendChild(li);
                }
            } else {
                // initialization not OK, so show the message
                document.getElementById('inititalization_field').innerHTML =
                    'Failure';
            }
            // we have the Application object, and we can show our app
            appObject.show();
        }
    } catch (e) {
        console.error('this is not an HbbTV client');
    }
}

function prepHbbtv() {
    // the `<object>` should now exist in the DOM
    createHbbTVObject(hbbtvMimetypes.applicationManager);
    createSafeArea();
}

function isHbbtv() {
    var userAgent = navigator.userAgent;

    return Boolean(userAgent.match(/HbbTV/i));
}

function boot() {
    if (isHbbtv()) {
        prepHbbtv();
        launchHbbtvApp();
    }

    window.spa.main();
    document.removeEventListener('DOMContentLoaded', boot);
}

document.addEventListener('DOMContentLoaded', boot);
