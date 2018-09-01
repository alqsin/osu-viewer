import React from 'react';
import Sound from 'react-sound';

class SongPlayer extends React.Component {
  state = {
    position: 0
  }
  render() {
    return (
      <Sound
        url={'api/songs/' + this.props.beatmapId + '.mp3'}
        position={this.state.position}
        playStatus={this.props.autoplay ? Sound.status.PLAYING : Sound.status.PAUSED}
        volume={this.props.volume}
        onPlaying={({ position }) => {
          if (Math.abs(this.props.currTime - position) > 100) this.setState({ position: this.props.currTime })
          else this.setState({position});
        }}
        onLoad={this.props.timeControls.startAutoplay}
        onPause={() => this.setState({position: this.props.currTime})}
        autoLoad={true}
        playbackRate={this.props.timeSpeed}
      />
    )
  }
}

export default SongPlayer;
