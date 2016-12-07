
import {} from "./index.html.mustache";
import ReactDOM from "react-dom";
import React from "react";
import {} from "normalize.css/normalize.css";
import style from "./demo.scss";
import wicked from "./wicked-transitions.js";
import SceneQueue from "./scene-queue";
import {ANIM_DURATION} from "./constants";
import * as defaultScenes from "./default-scenes";
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
      scene: {
        regions: [],
        width: 16,
        height: 9,
      }
    };
  }

  rand255() {
    return Math.floor(Math.random() * 255);
  }

  randomColor() {
    return `rgb(${this.rand255()}, ${this.rand255()}, ${this.rand255()})`;
  }

  addRegion() {
    if (this.state.scene.regions.length >= MAX_REGIONS) {
      return;
    }
    let regions = this.state.scene.regions.concat([{
      key: uid(),
      backgroundColor: this.randomColor(),
    }]);
    this.resetRegions(regions);
  }

  removeRegion(key) {
    const regions = this.state.scene.regions.filter(r => r.key !== key);
    this.resetRegions(regions);
  }

  resetRegions(newRegions) {
    const sceneKey = Object.keys(defaultScenes).find((key) => {
      return defaultScenes[key].regions.length === newRegions.length;
    });
    if (!sceneKey) {
      return;
    }
    log(`Selecting scene ${sceneKey}`);
    const scene = defaultScenes[sceneKey];
    const regions = newRegions.map((r, i) => {
      return {...r, ...scene.regions[i]};
    });
    this.setState({scene: {
      width: scene.width,
      height: scene.height,
      regions: regions
    }});
  }

  render() {
    return (
      <div className={style.Container}>
        <TVScreen onRemoveRegion={::this.removeRegion} scene={this.state.scene} />
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
    this.state = {};
    this.sceneQueue = new SceneQueue();
    this.sceneQueue.on("scene", (scene) => {
      this.setState(scene);
    });
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {scene} = nextProps;
    this.sceneQueue.pushScene(scene);
  }

  handleTransition(transition) {

  }

  removeRegion(id) {
    this.props.onRemoveRegion(id);
  }

  renderRegions() {
    if (!this.state.regions) {
      return [];
    }
    return this.state.regions.sort((r1, r2) => {
      return r1.key > r2.key ? 1 : -1;
    }).map((region) => {
      return <Region onClick={this.removeRegion.bind(this, region.key)} id={region.key} key={region.key} region={region} scene={this.state} />;
    });
  }

  render() {
    return (
      <div className={style.TVScreen}>
        {this.renderRegions()}
      </div>
    );
  }
}

class Region extends React.Component {
  pct(float) {
    return `${float * 100}%`;
  }

  getStyle() {
    // This should be in the library obviously
    const {scene, region} = this.props;
    return {
      left: `${region.x / scene.width * 100}%`,
      top: `${region.y / scene.height * 100}%`,
      width: `${region.width / scene.width * 100}%`,
      height: `${region.height / scene.height * 100}%`,
      zIndex: region.zIndex || 5,
      backgroundColor: this.props.region.backgroundColor,
      transitionDelay: "0s",
      transitionProperty: "all",
      transitionTimingFunction: "ease",
      transitionDuration: `${ANIM_DURATION}ms`,
    }
  }

  render() {
    const myStyle = this.getStyle();
    return (
      <div onClick={this.props.onClick} style={myStyle} className={style.Region}></div>
    );
  }
}

ReactDOM.render(<WickedTransforms />, document.querySelector("main"));
