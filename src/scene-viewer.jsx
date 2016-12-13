
import React from "react";
import style from "./scene-viewer.scss";
import throttle from "lodash.throttle";

export default class SceneViewer extends React.Component{
  constructor() {
    super();
    // Need a starting parent width/height for the initial render
    this.state = {
      parentWidth: 1,
      parentHeight: 1,
    };
    this.resize = throttle(::this.resize, 25);
  }

  ref(ref) {
    this.container = ref;
  }

  componentDidMount() {
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
  }

  resize() {
    if (!this.container) {
      return;
    }
    const {width, height} = this.container.parentNode.getClientRects()[0];
    this.setState({
      parentWidth: width,
      parentHeight: height,
    });
  }

  getSize() {
    const containerAspect = this.state.parentWidth / this.state.parentHeight;
    // const sceneAspect = this.props.scene.width / this.props.scene.height;
    // Maybe dynamic somday, but for now...
    const sceneAspect = 16 / 9;
    let width;
    let height;
    if (containerAspect > sceneAspect) {
      width = this.state.parentHeight * sceneAspect;
      height = this.state.parentHeight;
    }
    else {
      width = this.state.parentWidth;
      height = (1 / sceneAspect) * this.state.parentWidth;
    }
    return {
      width: `${width}px`,
      height: `${height}px`,
      left: "50%",
      marginLeft: `-${width / 2}px`,
      top: "50%",
      marginTop: `-${height / 2}px`,
    };
  }

  renderRegion(r) {
    const {width, height} = this.props.scene;
    const myStyle = {
      left: `${r.x / width * 100}%`,
      top: `${r.y / height * 100}%`,
      width: `${r.width / width * 100}%`,
      height: `${r.height / height * 100}%`,
    };
    const child = this.props.children.find(c => c.key === r.key);
    return (
      <div style={myStyle} key={r.key} className={style.Region}>
        {child}
      </div>
    );
  }

  render() {
    const size = this.getSize();
    return (
      <div style={{height: size.height}} ref={::this.ref} className={style.SceneViewerContainer}>
        <div style={size} className={style.SceneViewer}>
          {this.props.scene.regions.map(::this.renderRegion)}
        </div>
      </div>
    );
  }
}

SceneViewer.propTypes = {
  "scene": React.PropTypes.object.isRequired,
  "transitions": React.PropTypes.array.isRequired,
};
