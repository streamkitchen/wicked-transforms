
import {} from "./index.html.mustache";
import ReactDOM from "react-dom";
import React from "react";
import {} from "normalize.css/normalize.css";
import style from "./demo.scss";
import wicked from "./wicked-transitions.js";
import getPositions from "./get-positions";
import debug from "debug";

const log = debug("sk:wicked-transitions-demo");

const MAX_REGIONS = 4;

let _id = 0;
const uid = function() {
  const ret = `thingy-${_id}`;
  _id += 1;
  return ret;
};

class WickedTransforms extends React.Component {
  constructor() {
    super();
    this.state = {
      regions: [],
      scene: {
        width: 1920,
        height: 1080,
      },
    };
  }

  rand255() {
    return Math.floor(Math.random() * 255);
  }

  randomColor() {
    return `rgb(${this.rand255()}, ${this.rand255()}, ${this.rand255()})`;
  }

  addRegion() {
    if (this.state.regions.length >= MAX_REGIONS) {
      return;
    }
    let regions = this.state.regions.concat([{
      id: uid(),
      backgroundColor: this.randomColor(),
    }]);
    this.resetRegions(regions);
  }

  removeRegion(id) {
    const regions = this.state.regions.filter(r => r.id !== id);
    this.resetRegions(regions);
  }

  resetRegions(newRegions) {
    const positions = getPositions({count: newRegions.length});
    const regions = newRegions.map((r, i) => {
      return {...r, ...positions[i]};
    });
    this.setState({regions});
  }

  render() {
    return (
      <div className={style.Container}>
        <TVScreen onRemoveRegion={::this.removeRegion} regions={this.state.regions} scene={this.state.scene} />
        <div className={style.Buttons}>
          <button onClick={::this.addRegion} className={style.PlusButton}>+</button>
        </div>
      </div>
    );
  }
}

class TVScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      regions: []
    };
  }

  componentWillMount() {
    this.setState({regions: this.props.regions});
  }

  componentWillReceiveProps(nextProps) {
    return this.setState({regions: nextProps.regions});
  }

  handleTransition(transition) {
    const next = transition.getNext();
    if (!next) {
      return;
    }
    next.then((state) => {
      log(`Got state ${JSON.stringify(state)}`);
      this.setState({regions: state});
      this.handleTransition(transition);
    })
    .catch(console.error.bind(console));
  }

  removeRegion(id) {
    this.props.onRemoveRegion(id);
  }

  rengerRegions() {
    return this.state.regions.map((region, i) => {
      return <Region onClick={this.removeRegion.bind(this, region.id)} key={region.id} scene={this.props.scene} region={region} position={region} />;
    });
  }

  render() {
    return (
      <div className={style.TVScreen}>
        {this.rengerRegions()}
      </div>
    );
  }
}

class Region extends React.Component {
  pct(float) {
    return `${float * 100}%`;
  }

  getStyle() {
    const style = wicked.getStateCss(this.props.position);
    const backgroundColor = this.props.region.backgroundColor;
    const transitionDelay = "0s";
    const transitionProperty = "all";
    const transitionTimingFunction = "ease";

    return {...style, backgroundColor, transitionDelay, transitionProperty, transitionTimingFunction};
  }

  render() {
    const myStyle = this.getStyle();
    return (
      <div onClick={this.props.onClick} style={myStyle} className={style.Region}></div>
    );
  }
}

ReactDOM.render(<WickedTransforms />, document.querySelector("main"));
