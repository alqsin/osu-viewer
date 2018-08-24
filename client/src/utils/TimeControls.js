import React from 'react';
import styled from 'styled-components';

const PlayButton = styled.button`
    padding: 0;
    font-size: 18;
    border: 0;
    margin: 0 0;
    width: 25px;
    background: white;
    outline: none;
`

class TimeControls extends React.PureComponent {
  render() {
    const buttonStyle = {
      height: 25,
      width: 32,
    }
    return (
      <PlayButton className="button" style={buttonStyle} type="submit" onClick={this.props.toggleAutoplay}>
        <i className="material-icons">{this.props.autoplay ? "pause" : "play_arrow"}</i>
      </PlayButton>
    )
  }
}

export default TimeControls;