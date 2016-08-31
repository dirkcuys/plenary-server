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
          className={this.state.audioMuted ? 'muted' : ''}>
        {this.state.audioMuted ?  'Unmute audio' : 'Mute audio' }
      </a>
      <a href='#' onClick={(e) => this.handleMuteVideo(e)}
          className={this.state.videoMuted ? 'muted' : ''}>
        {this.state.videoMuted ?  'Unmute video' : 'Mute video' }
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
