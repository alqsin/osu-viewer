import React from 'react';
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css';

class TimeSlider extends React.PureComponent {
  render() {
    const { value, onChange, totalTime } = this.props

    return (
      <Slider
        min={0}
        max={totalTime * 1000}
        step={100}
        onChange={onChange}
        value={value}
      />
    )
  }
}

export default TimeSlider