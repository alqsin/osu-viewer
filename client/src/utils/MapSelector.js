import React from 'react';
import Viewer from './Viewer.js';
import Select, {Option} from 'rc-select';
import 'rc-select/assets/index.css';

async function getPlayers(beatmapId) {
  const response = await fetch('api/scores/' + beatmapId);
  const body = await response.json();

  if (response.status !== 200) throw new Error(body.message);

  return body;
}

class MapSelector extends React.Component {
  state = {
    beatmapList: null,
    beatmapId: null,
    player: null,
    playerList: null,
    errorOccurred: false,
    beatmapSelected: false,
    playerSelected: false,
  }
  getBeatmaps = async () => {
    const response = await fetch('api/beatmaps');
    const body = await response.json();

    if (response.status !== 200) throw new Error(body.message);

    return body;
  }
  selectBeatmap = (value, option) => {
    getPlayers(value)
      .then(res => {
        const players = [];
        for (let i=0;i<res.length;i++) {
          players.push(res[i].username);
        }
        this.setState({beatmapId: value, playerList: players, beatmapSelected: true});
      })
      .catch(err => {
        console.log(err);
        this.setState({errorOccurred: true});
      })
  }
  selectPlayer = (value, option) => {
    this.setState({player: value, playerSelected: true})
  }
  componentDidMount() {
    this.getBeatmaps()
      .then(res => {
        this.setState({beatmapList: res});
      })
      .catch(err => {
        console.log(err);
        this.setState({errorOccurred: true});
      })
  }
  render() {
    if (this.state.errorOccurred) {
      return(
        <div>
          Some error occured, please try again.
        </div>
      )
    }
    if (this.state.beatmapList == null) {
      return(
        <div>
          Loading beatmaps...
        </div>
      )
    }
    if (!this.state.beatmapSelected) {
      return(
        <div style={{ width: 300 }}>
          Please select a beatmap from the list:<br></br>
          <Select
            onSelect={this.selectBeatmap}
            value=""
            combobox
            style={{ width: 500 }}
          >
            {this.state.beatmapList.map(x => (
              <Option key={x.id}>{x.name}</Option>
            ))}
          </Select>
        </div>
      )
    }
    if (!this.state.playerSelected) {
      return(
        <div style={{ width: 300 }}>
          Please select a player from the list.<br></br>
          <Select
            onSelect={this.selectPlayer}
            value=""
            combobox
            style={{ width: 300 }}
          >
            {this.state.playerList.map(x => (
              <Option key={x}>{x}</Option>
            ))}
          </Select>
        </div>
      )
    }
    console.log("Loading " + this.state.player + "'s play on beatmap with id " + this.state.beatmapId);
    return(
      <Viewer 
        beatmapId={this.state.beatmapId}
        player={this.state.player}
      />
    )

  }
}

export default MapSelector;