import uuid from 'node-uuid';
import queryString from 'query-string';
import $ from './jquery';

const CONF = window.VERTO_CONF;
const QUERY_STRING = queryString.parse(location.search);

const testBandwidth = function(verto) {
  return new Promise((resolve, reject) => {
    verto.rpcClient.speedTest(1024*256, function(event, data) {
      let up = Math.ceil(data.upKPS);
      let down = Math.ceil(data.downKPS);
      resolve(data);
    });
  });
};

const startCall = function(verto, bandwidthTestData) {
  console.log("[startCall]", verto, bandwidthTestData);
  verto.videoParams({
    minWidth: 640, minHeight: 480,
    maxWidth: 640, maxHeight: 480,
    minFrameRate: 15,
    vertoBestFrameRate: 30,
  });

  let name = QUERY_STRING.name || "Anonymous";
  let participating = CONF.mode === "participate";
  let currentCall = verto.newCall({
    destination_number: CONF.diaplanDestinationNumber,
    caller_id_name: name,
    caller_id_number: CONF.plenaryUsername,
    useVideo: participating,
    useCamera: participating ? 'any' : false,
    useMic: participating ? 'any' : 'none',
    useSpeak: participating ? 'any' : 'none',
    outgoingBandwidth: bandwidthTestData.upKPS,
    incomingBandwidth: bandwidthTestData.downKPS,
    // Use a dedicated outbound encoder for this user's video.
    // NOTE: This is generally only needed if the user has some kind of
    // non-standard video setup, and is not recommended to use, as it
    // dramatically increases the CPU usage for the conference.
    dedEnc: false,
    // You can pass any application/call specific variables here, and they will
    // be available as a dialplan variable, prefixed with 'verto_dvar_'.
    userVariables: {
      // Shows up as a 'verto_dvar_conference_id' dialplan variable
      conference_id: CONF.conferenceId,
    },
    useStereo: true,
    mirrorInput: participating
  });

  // Setup callbacks for mute controls
  $('#mute-audio').on('click', (e) => {
    e.preventDefault();
    if (currentCall) {
      currentCall.dtmf('0');
    }
  });
  $('#mute-video').on('click', (e) => {
    e.preventDefault();
    if (currentCall) {
      currentCall.dtmf('*0');
    }
  });
};

const callbacks = {
  // Websocket connection to FreeSWITCH authenticated
  onWSLogin: function(verto, success) {
    console.log("[onWSLogin]", verto, success);
    if (success) {
      testBandwidth(verto).then((bandwidthTestData) => {
        return startCall(verto, bandwidthTestData);
      });
    }
  },
  // Websocket connection to FreeSWITCH closed
  onWSClose: function(verto, success) {
    console.log("[onWSClose", verto, success);
    // Do something?
  },
  // Receives call state messages from FreeSWITCH
  onDialogState: function(d) {
    console.log("[onDialogState]", d);
    switch (d.state.name) {
      case "trying":
        break;
      case "answering":
        break;
      case "active":
        break;
      case "hangup":
        alert("Call ended with cause: " + d.cause);
        console.log("Call ended with cause: " + d.cause);
        break;
      case "destroy":
        // Some kind of client side cleanup...
        break;
    }
  },
  // Receives conference-related messages from FreeSWITCH.
  // Note that it's possible to write server-side modules to send customized
  // messages via this callback.
  onMessage: function(verto, dialog, message, data) {
    console.log("[onMessage]", verto, dialog, message, data)
    switch (message) {
      case $.verto.enum.message.pvtEvent:
        if (data.pvtData) {
          switch (data.pvtData.action) {
            // This client has joined the live array for the conference.
            case "conference-liveArray-join":
              // With the initial live array data from the server, you can
              // configure/subscribe to the live array.
              break;
            // This client has left the live array for the conference.
            case "conference-liveArray-part":
              // Some kind of client-side wrapup...
              break;
          }
        }
        break;
    }
  },
};

const getSessionId = function() {
  // Retrieve and, if unset, persist a random session ID for use in call
  // reconnections.
  let sessIdCookieName = `verto-session-${CONF.conferenceId}`;
  let sessionId;
  try {
    sessionId = $.cookie(sessIdCookieName);
  } catch (e) {
    console.log(e);
  }
  if (!sessionId) {
    sessionId = uuid.v4();
    try {
      $.cookie(sessIdCookieName, sessionId);
    } catch (e) {
      console.log(e);
    }
  }
  return sessionId;
}

export const connect = function() {
  // Set parameters depending on whether we want to use the mic/camera or not.
  let initOpts;
  let deviceParams;
  if (CONF.mode === "participate") {
    initOpts = {};
    deviceParams = {
      useCamera: 'any',
      useMic: 'any',
      useSpeak: 'any'
    };
  } else {
    initOpts = {skipPermCheck: true, skipDeviceCheck: true};
    deviceParams = {
      useCamera: false,
      useMic: "none",
      useSpeak: "none",
    };
  }
  $.verto.init(initOpts, () => {
    new $.verto({
      // Login as defined in '/etc/freeswitch/directory/default.xml'
      login: CONF.plenaryUsername + '@plenary.unhangout.io',
      // Password as defined in '/etc/freeswitch/directory/default.xml'
      passwd: CONF.plenaryPassword,
      // URL for the websocket as defined in /etc/freeswitch/autoload_configs/verto.conf.xml
      socketUrl: CONF.socketUrl,
      // URL for stunserver as defined in /etc/turnerver.conf
      iceServers: [{ url: CONF.stunServer },],
      // Session ID for repeated logins -- enables slightly faster call setup
      // for a reconnect.
      sessid: getSessionId(),
      // Google Chrome specific adjustments/filters for audio.
      // Official documentation is scant, best to try them out and see!
      audioParams: {
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,
        googTypingNoiseDetection: true,
        googEchoCancellation2: false,
        googAutoGainControl2: false,
      },
      // ID of HTML element to put video in, defined in views/video.pug
      tag: 'video',
      deviceParams: deviceParams
    }, callbacks);
  });
}
