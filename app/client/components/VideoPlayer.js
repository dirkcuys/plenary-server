import React from 'react';
import {ConnectionStatus} from './status';
//import {default as videojs} from '../videojs-compat.js';

class ImmutableVideo extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  hasFlash() {
    // from http://stackoverflow.com/a/20095467
    let hasFlash = false;
    try {
      let fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (fo) {
        hasFlash = true;
      }
    } catch (e) {
      if (navigator.mimeTypes
            && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
            && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
        hasFlash = true;
      }
    }
    return hasFlash;
  }

  hasMSE() {
    return 'MediaSource' in window && Hls.isSupported();
  }

  componentDidMount() {
    this.loadVideo();
  }

  getVideoPathName() {
    return [
      this.props.conf.dialplanDestinationNumberPrefix,
      this.props.conf.conferenceId
    ].join("");
  }

  getHlsUrl() {
    return `https://${this.props.conf.videoServerHostname}/hls/${this.getVideoPathName()}/index.m3u8`;
  }

  loadVideo() {
    let hlsUrl = this.getHlsUrl()
    let handleError = () => {
      this.props.setWaiting(true);
      setTimeout(() => this.loadVideo(), 1000);
    }

    fetch(hlsUrl)
    .then((res) => {
      if (res.status !== 200 && res.status !== 304) {
        return handleError();
      } else {
        this.props.setWaiting(false);
      }
      if (this.hasFlash()) {
        this.refs.plenaryVideo.className = "video-js vjs-default-skin";
        let rtmpUrl = `rtmp://${this.props.conf.videoServerHostname}/stream/${this.getVideoPathName()}`;
        videojs(this.refs.plenaryVideo.id, {controls: true}, function() {
          let player = this;
          player.src({type: 'rtmp/mp4', src: rtmpUrl});
          player.play();
        });
      } else if (this.hasMSE()) {
        var hls = new Hls({
          liveSyncDuration: 3,
          liveMaxLatencyDuration: 6,
          startFragPrefetch: true,
        });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("PLAY!");
          this.refs.plenaryVideo.play().catch((err) => {
            console.log(err);
            if (err && err.message) {
              if (err.message.indexOf("no supported source") !== -1) {
                this.props.setError({error: "UNSUPPORTED"});
              } else if (err.message.indexOf("play() can only be initiated by a user gesture") !== -1) {
                // TODO: Display a big prominent play button?
              }
            } else if (err && err.message) {
              this.props.setError({error: "UNKNOWN", message: err.message})
            } else {
              this.props.setError({error: "UNKNOWN"});
            }
          });
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.log("Hls.Events.ERROR", event, data);
          if (data.fatal) {
            switch(data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
              // try to recover network error
                console.log("fatal network error encountered, try to recover");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("fatal media error encountered, try to recover");
                hls.recoverMediaError();
                break;
              default:
              // cannot recover
                hls.destroy();
                this.props.setError({error: "UNKNOWN", message: JSON.stringify(data)});
                break;
            }
          }
        });
        hls.attachMedia(this.refs.plenaryVideo);
        hls.loadSource(hlsUrl);
      }
    })
    .catch((err) => {
      console.log("Handled", err);
      handleError()
    });
  }
  render() {
    // Options are:
    // 1. Flash: use video.js + rtmp. Load src in componentDidMount.
    // 2. MSE: hls.js. (Should cover all but iOS). Load src in
    //    componentDidMount. If the browser doesn't support h264 (eg.
    //    Chromium), display an error message.
    // 3. No MSE or flash: must be iOS? Pray for HLS via native video element.
    let hlsUrl = `https://${this.props.conf.videoServerHostname}/hls/${this.getVideoPathName()}/index.m3u8`;
    return <div className='video-container' ref='videoContainer'>
      <video controls ref="plenaryVideo" id={`${this.props.conf.tag}-video`}>
        { !this.hasFlash() && !this.hasMSE() ?
          <source src={hlsUrl} type='application/vnd.apple.mpegURL' />
        : ""}
      </video>
    </div>
  }
}

export class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {};
  }

  render() {
    if (this.state.error) {
      return <div className='error'>
        {
          this.state.error.error === "UNSUPPORTED" ?
            <span>Aw, snap. Your browser doesn't support any available video format.</span>
          : <div>A fatal error occurred. <pre>{this.state.error.message}</pre></div>
        }
      </div>
    }
    
    return <div className='video-container'>
      { this.state.waiting ?  <div>Waiting for video to start</div> : "" }
      <ImmutableVideo
        setWaiting={(waiting) => this.setState({waiting})}
        setError={(error) => this.setState({error})}
        {...this.props} />
    </div>
  }
}
