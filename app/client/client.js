import uuid from 'node-uuid';
import queryString from 'query-string';
import $ from './jquery';

// Global state provided by the host HTML
const CONF = window.VERTO_CONF;
// Parameters from the query string
const QUERY_STRING = queryString.parse(location.search);

const MAX_VIDEO_PARAMS = {
  maxWidth: 640, maxHeight: 480,
  minWidth: 160, minHeight: 120,
  minFrameRate: 15,
  vertoBestFramerate: 30
};

// Verto doesn't give us a simple state indication of whether a call is
// currently active or not, and if we call in twice, we get video doubling (or
// tripppling, etc) as verto recovers past call sessions and also starts new
// ones.  Track `callIsActive` state based on calls to the `onWSDialog`
// callback, and use this to avoid placing duplicate calls.
let callIsActive = false;

/**
 * Execute the verto speed test, set verto video constraints based on the
 * results, and return a promise resolving with the results.
 * @param {Object} verto - A (the?) verto object
 * @return {Promise<data>} - The results of the bandwidth test.
 */
const setVideoParamsByBandwidth = function(verto) {
  return new Promise((resolve, reject) => {
    verto.rpcClient.speedTest(1024*256, function(event, data) {
      let up = Math.ceil(data.upKPS);
      let down = Math.ceil(data.downKPS);

      // maximum parameters
      let videoParams = {};
      Object.assign(videoParams, MAX_VIDEO_PARAMS);
      // reduce as needed based on bandwidth
      if (up < 1024) {
        videoParams.maxWidth = 640;
        videoParams.maxHeight = 480;
      } else if (up < 512) {
        videoParams.maxWidth = 320;
        videoParams.maxHeight = 240;
      } else if (up < 256) {
        videoParams.maxWidth = 160;
        videoParams.maxHeight = 120;
      }
      console.log("[Setting video params]", videoParams);
      verto.videoParams(videoParams);
      resolve(data);
    });
  });
};

/**
 * Maybe start a new call with verto.  If the module-level `callIsActive` is
 * true, no-op.
 * @param {Object} verto - Verto object on which to place a call
 */
const startCall = function(verto) {
  console.log("[startCall]", verto);
  if (callIsActive) {
    console.log("... not starting new call, callIsActive is true");
    return;
  }

  let name = QUERY_STRING.name || "Anonymous";
  let participating = CONF.mode === "participate";
  verto.newCall({
    destination_number: CONF.dialplanDestinationNumber,
    caller_id_name: name,
    caller_id_number: CONF.plenaryUsername,
    useVideo: true,
    useCamera: participating ? 'any' : false,
    useMic: participating ? 'any' : 'none',
    useSpeak: 'any',
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
};

/**
 * Given a verto `dialog` (the state frame passed to `onDialogState`), attach
 * event listeners for call control buttons (mute, etc) to that frame.
 * @param {Object} dialog - the state frame as received by `onDialogState`
 */
const attachEventListeners = function(dialog) {
  // Setup callbacks for mute controls
  $('#mute-audio').on('click', (e) => {
    e.preventDefault();
    if (dialog) {
      $(e.currentTarget).toggleClass("muted");
      dialog.dtmf('0');
    }
  });
  $('#mute-video').on('click', (e) => {
    e.preventDefault();
    if (dialog) {
      $(e.currentTarget).toggleClass("muted");
      dialog.dtmf('*0');
    }
  });
}

/**
 * Object containing callbacks to pass to verto initialization.
 */
const callbacks = {
  // Websocket connection to FreeSWITCH authenticated
  onWSLogin: function(verto, success) {
    console.log("[onWSLogin]", verto, success);
    if (success) {
      setVideoParamsByBandwidth(verto).then(() => startCall(verto));
    }
  },
  // Websocket connection to FreeSWITCH closed
  onWSClose: function(verto, success) {
    console.log("[onWSClose]", verto, success);
    callIsActive = false;
  },
  // Receives call state messages from FreeSWITCH
  onDialogState: function(dialog) {
    console.log("[onDialogState]", dialog.state.name, dialog);
    switch (dialog.state.name) {
      case "new":
      case "requesting":
      case "trying":
      case "recovering":
      case "ringing":
      case "answering":
      case "early":
      case "held":
        // Just set 'callIsActive' to prevent call doubling.
        callIsActive = true;
        break;
      case "active":
        // Set 'callIsActive' and also attach event listeners, as we now have a
        // functioning call.
        callIsActive = true;
        attachEventListeners(dialog);
        break;
      case "hangup":
        callIsActive = false;
        alert("Call ended with cause: " + dialog.cause);
        console.log("Call ended with cause: " + dialog.cause);
        break;
      case "destroy":
      case "purge":
        callIsActive = false;
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

/**
 * Connect to FreeSWITCH, attach event listeners, and begin the call.
 */
export const connect = function() {
  console.log("[connect]");
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
      useSpeak: "any",
    };
  }
  console.log("[$.verto.init]");
  $.verto.init(initOpts, () => {
    console.log("[new $.verto()]");
    new $.verto({
      // Login as defined in '/etc/freeswitch/directory/default.xml'
      login: CONF.plenaryUsername,
      // Password as defined in '/etc/freeswitch/directory/default.xml'
      passwd: CONF.plenaryPassword,
      // URL for the websocket as defined in /etc/freeswitch/autoload_configs/verto.conf.xml
      socketUrl: CONF.socketUrl,
      // URL for stunserver as defined in /etc/turnerver.conf
      iceServers: [{ url: CONF.stunServer || "stun:stun.l.google.com:19302" },],

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
      videoParams: MAX_VIDEO_PARAMS,
      // ID of HTML element to put video in, defined in views/video.pug
      tag: 'video',
      deviceParams: deviceParams
    }, callbacks);
  });
}
