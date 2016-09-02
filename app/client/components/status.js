import React from 'react';

export class ConnectionStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hide: false};
    this.fade();
  }

  componentWillReceiveProps(newProps) {
    this.fade();
  }

  componentDidMount() {
    this.fade();
  }

  fade() {
    setTimeout(() => {
      let parsed = this.parseStatus();
      if (parsed.temporary) {
        this.setState({hide: true})
      }
    }, 2000);
  }

  handleReload() {
    document.location.href = document.location.href;
  }

  parseStatus(status) {
    switch (this.props.status) {
      case "active":
        return {
          message: "Connected!",
          temporary: true,
          level: "info"
        }
      case "new":
      case "loading":
      case "requesting":
      case "trying":
      case "recovering":
      case "ringing":
      case "answering":
      case "early":
      case "held":
        return {
          message: <div>
              <p>Connecting...</p>
              <button onClick={this.handleReload}>
                <i className='mdi mdi-reload'></i>
                Force reconnect
              </button>
            </div>,
          temporary: false,
          spinner: true,
          level: "warning"
        }
      case "hangup":
      case "destroy":
      case "purge":
        return {
          message: <div>
              <p>Disconnected!</p>
              <button onClick={this.handleReload}>
                <i className='mdi mdi-reload'></i>
                Force reconnect
              </button>
            </div>,
          temporary: false,
          level: "error"
        }
      default:
        return {
          message: "",
          temporary: false,
          level: "hidden"
        }
    }
  }

  render() {
    let opts = this.parseStatus();
    return <div className={`status ${opts.level} ${this.state.hide ? "hidden" : ""}`} title={this.props.status}>
      {opts.message}
    </div>
  }
}

export class PresentCount extends React.Component {
  render() {
    return <div className='present-count' title='Connected users'>
      <i className='mdi mdi-face'></i>
      <span className='sr-only'>Connected users</span>
      <span className='count'>{this.props.count}</span>
    </div>
  }
}
