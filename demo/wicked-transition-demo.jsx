
import React from "react";
import ReactDOM from "react-dom";
import {} from "normalize.css";
import {} from "./index.html.mustache";
import style from "./wicked-transition-demo.scss";
import SceneViewer from "../src/scene-viewer";
import {getScene} from "../src/wicked";
import leftPad from "left-pad";

let _id = 0;
const uid = function() {
  const ret = `thingy-${leftPad(_id, 4, "0")}`;
  _id += 1;
  return ret;
};

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
      this.setState({scene});
    }
  }

  // Rendering

  renderStyle(r) {
    return {
      backgroundColor: r.backgroundColor
    }
  }

  renderRegion(r) {
    return (
      <div className={style.Region} onClick={this.removeRegion.bind(this, r.key)} style={this.renderStyle(r)} key={r.key}>
        <span>{r.key}</span>
      </div>
    );
  }

  render () {
    return (
      <div className={style.Container}>
        <div className={style.SceneWrapper}>
          <SceneViewer scene={this.state.scene} transitions={this.state.transitions}>
            {this.state.scene.regions.map(r => this.renderRegion(r))}
          </SceneViewer>
        </div>
        <div className={style.Buttons}>
          <button onClick={::this.addRegion} className={style.PlusButton}>+</button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<WickedTransitionDemo />, document.querySelector("main"));
