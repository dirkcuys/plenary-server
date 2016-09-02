import queryString from 'query-string';
import $ from './jquery';
import ReactDOM from 'react-dom';
import React from 'react';

/**
 * Execute the verto speed test, set verto video constraints based on the
 * results, and return a promise resolving with the results.
 * @param {Object} verto - A (the?) verto object
 * @return {Promise<data>} - The results of the bandwidth test.
 */
export const setVideoParamsByBandwidth = function(verto, conf) {
  return new Promise((resolve, reject) => {
    verto.rpcClient.speedTest(1024*256, function(event, data) {
      let up = Math.ceil(data.upKPS);
      let down = Math.ceil(data.downKPS);

      // maximum parameters
      let videoParams = {};
      Object.assign(videoParams, conf.maxVideoParams);
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
export const startCall = function(verto, conf, bandwidthTestData) {
  let participating = conf.mode === "participate";
  verto.newCall({
    destination_number: conf.dialplanDestinationNumber,
    caller_id_name: conf.displayName,
    caller_id_number: conf.plenaryUsername,
    useVideo: true,
    useCamera: participating ? 'any' : false,
    useMic: participating ? 'any' : 'none',
    useSpeak: 'any',
    // Data returned from the bandwidth test can be used to set these params,
    // which will be used to calculate the best strategy for sending/receiving
    // video within these bandwidth limits.
    outgoingBandwidth: bandwidthTestData ? bandwidthTestData.upKPS : undefined,
    incomingBandwidth: bandwidthTestData ? bandwidthTestData.downKPS : undefined,
    // Use a dedicated outbound encoder for this user's video.
    // NOTE: This is generally only needed if the user has some kind of
    // non-standard video setup, and is not recommended to use, as it
    // dramatically increases the CPU usage for the conference.
    dedEnc: false,
    // You can pass any application/call specific variables here, and they will
    // be available as a dialplan variable, prefixed with 'verto_dvar_'.
    userVariables: {
      // Shows up as a 'verto_dvar_conference_id' dialplan variable
      conference_id: conf.conferenceId,
    },
    useStereo: true,
    mirrorInput: participating
  });
};

/**
 * Connect to FreeSWITCH, attach event listeners, and begin the call.
 */
export const connect = function(conf, videoTagId, callbacks) {
  console.log("[connect]");
  // Set parameters depending on whether we want to use the mic/camera or not.
  let initOpts;
  let deviceParams;
  if (conf.mode === "participate") {
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
      login: conf.plenaryUsername,
      // Password as defined in '/etc/freeswitch/directory/default.xml'
      passwd: conf.plenaryPassword,
      // URL for the websocket as defined in /etc/freeswitch/autoload_configs/verto.conf.xml
      socketUrl: conf.socketUrl,
      // URL for stunserver as defined in /etc/turnerver.conf
      iceServers: [{ url: conf.stunServer || "stun:stun.l.google.com:19302" },],

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
      videoParams: conf.maxVideoParams,
      // ID of HTML element to put video in, defined in views/video.pug
      tag: videoTagId,
      deviceParams: deviceParams
    }, callbacks);
  });
}
