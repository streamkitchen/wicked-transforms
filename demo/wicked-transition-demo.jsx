
import React from "react";
import ReactDOM from "react-dom";
import {} from "normalize.css";
import {} from "./index.html.mustache";
import style from "./wicked-transition-demo.scss";
import SceneViewer from "../src/scene-viewer";
import {getScene, getTransition} from "../src/wicked";
import leftPad from "left-pad";

let _id = 0;
const uid = function() {
  const ret = `thingy-${leftPad(_id, 4, "0")}`;
  _id += 1;
  return ret;
};

class Region extends React.Component {
  constructor(props) {
    super(props);
  }

  // Rendering
  renderStyle() {
    return {
      backgroundColor: this.props.region.backgroundColor
    }
  }

  render() {
    // onClick={this.removeRegion.bind(this, r.key)}
    return (
      <div onClick={() => this.props.onClick(this.props.region.key)} className={style.Region} style={this.renderStyle()}>
        <span>{this.props.region.key}</span>
      </div>
    );
  }
}

export default class WickedTransitionDemo extends React.Component {
  constructor() {
    super();
    this.state = {
      scene: getScene([]),
      transitions: [],
    };
  }

  rand255() {
    return Math.floor(Math.random() * 255);
  }

  randomColor() {
    return `rgb(${this.rand255()}, ${this.rand255()}, ${this.rand255()})`;
  }

  addRegion() {
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
    const scene = getScene(newRegions);
    if (scene) {
      const transitions = getTransition(this.state.scene, scene);
      this.setState({scene, transitions});
    }
  }

  render () {
    const regionProps = {
      onClick: ::this.removeRegion
    };
    return (
      <div className={style.Container}>
        <div className={style.SceneWrapper}>
          <SceneViewer scene={this.state.scene} transitions={this.state.transitions} regionProps={regionProps} component={Region} />
        </div>
        <div className={style.Buttons}>
          <button onClick={::this.addRegion} className={style.PlusButton}>+</button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<WickedTransitionDemo />, document.querySelector("main"));
