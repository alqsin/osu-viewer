import React from 'react';

class TimeKeeper extends React.Component {
  // props are {totalTime}
  state = {
    timeSpeed: 1.0,
    currTime: 0,
    autoplay: false,
  }

  setCurrTime = val => {this.setState({currTime: val})}
  setTimeSpeed = val => {this.setState({timeSpeed: val})}

  loop = time => {
    if (!this.state.autoplay) return;

    const elapsedTime = time - this.lastUpdate
    this.lastUpdate = time

    this.setState(({currTime, timeSpeed}) => {
        if (Math.floor(currTime / 100) >= this.props.totalTime * 10){
          cancelAnimationFrame(this.newFrame)
          return { autoplay: false }
        }

      return {currTime: currTime + timeSpeed * elapsedTime}
    })

    this.newFrame = requestAnimationFrame(this.loop)
  }

  startAutoplay = () => {
    this.lastUpdate = performance.now()
    this.newFrame = requestAnimationFrame(this.loop);
    this.setState({ autoplay: true })
  }

  stopAutoplay = () => {
    cancelAnimationFrame(this.newFrame);
    this.setState({ autoplay: false })
  }

  toggleAutoplay = () => {
    if (this.state.autoplay) this.stopAutoplay();
    else this.startAutoplay();
  }

  render() {
    const { cursorStatus } = this.props
    const renderProps = {
      currTime: this.state.currTime,
      currCursorPos: cursorStatus.posAt(this.state.currTime),
      timeControls: {
        setCurrTime: this.setCurrTime,
        setTimeSpeed: this.setTimeSpeed,
        startAutoplay: this.startAutoplay,
        stopAutoplay: this.stopAutoplay,
        toggleAutoplay: this.toggleAutoplay,
      },
      autoplay: this.state.autoplay,
      timeSpeed: this.state.timeSpeed,
    }

    return this.props.render(renderProps)
  }
}

export default TimeKeeper