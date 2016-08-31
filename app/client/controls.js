import React from 'react';

export class ParticipantControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioMuted: false,
      videoMuted: false,
    }
  }

  handleMuteAudio(event) {
    event && event.preventDefault();
    this.props.dialog.dtmf('0');
    this.setState({audioMuted: !this.state.audioMuted});
  }

  handleMuteVideo(event) {
    event && event.preventDefault();
    this.props.dialog.dtmf('*0');
    this.setState({videoMuted: !this.state.videoMuted});
  }

  render() {
    return <div className='controls'>
      <a href='#' onClick={(e) => this.handleMuteAudio(e)}
          title={this.state.videoMuted ? 'Unmute microphone' : 'Mute microphone'}
          className={"audio-mute" + (this.state.audioMuted ? ' muted' : '')}>
        <span className='sr-only'>
          {this.state.audioMuted ?  'Unmute audio' : 'Mute audio' }
        </span>
      </a>
      <a href='#' onClick={(e) => this.handleMuteVideo(e)}
          title={this.state.videoMuted ? 'Unmute video' : 'Mute video'}
          className={"video-mute" + (this.state.videoMuted ? ' muted' : '')}>
        <span className='sr-only'>
          {this.state.videoMuted ?  'Unmute video' : 'Mute video' }
        </span>
      </a>
    </div>
  }
}

export class ListenerControls extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className='controls'></div>
  }
}
