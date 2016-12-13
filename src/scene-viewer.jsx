
import React from "react";
import style from "./scene-viewer.scss";
import throttle from "lodash.throttle";

const nextFrame = function(cb) {
  window.requestAnimationFrame(function() {
    window.requestAnimationFrame(cb);
  });
};

export default class SceneViewer extends React.Component{
  constructor(props) {
    super(props);
    // Need a starting parent width/height for the initial render
    this.state = {
      parentWidth: 1,
      parentHeight: 1,
      scene: props.scene,
    };
    this.sceneQueue = [];
    this.resize = throttle(::this.resize, 25);
    this.queueTimeout = null;
  }

  ref(ref) {
    this.container = ref;
  }

  componentWillReceiveProps(nextProps) {
    this.sceneQueue.push(...nextProps.transitions);
    this.processQueue();
  }

  processQueue() {
    if (this.queueTimeout) {
      // We're already in the midst of a transition, wait your turn
      return;
    }
    this._processQueue();
  }

  _processQueue() {
    this.queueTimeout = null;
    if (this.sceneQueue.length === 0) {
      // We're done! Set state to the current state.
      this.setState({scene: this.props.scene});
      return;
    }
    const {scene, transition} = this.sceneQueue.shift();
    this.queueTimeout = true;
    nextFrame(() => {
      this.setState({scene});
      this.queueTimeout = setTimeout(::this._processQueue, transition.duration);
    });
  }

  componentDidMount() {
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
    if (this.queueTimeout && this.queueTimeout !== true) {
      clearTimeout(this.queueTimeout);
    }
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
    const {width, height} = this.state.scene;
    const myStyle = {
      left: `${r.x / width * 100}%`,
      top: `${r.y / height * 100}%`,
      width: `${r.width / width * 100}%`,
      height: `${r.height / height * 100}%`,
      zIndex: r.zIndex || 5,
      transitionDelay: "0s",
      transitionProperty: "all",
      transitionTimingFunction: "ease",
      transitionDuration: `300ms`,
    };
    const Component = this.props.component;
    return (
      <div style={myStyle} key={r.key} className={style.Region}>
        <Component region={r} {...this.props.regionProps} />
      </div>
    );
  }

  getSortedRegions() {
    const regions = [...this.state.scene.regions];
    return regions.sort((r1, r2) => {
      return r1.key > r2.key ? -1 : 1;
    });
  }

  render() {
    const size = this.getSize();
    const regions = this.getSortedRegions();
    return (
      <div style={{height: size.height}} ref={::this.ref} className={style.SceneViewerContainer}>
        <div style={size} className={style.SceneViewer}>
          {regions.map(::this.renderRegion)}
        </div>
      </div>
    );
  }
}

SceneViewer.propTypes = {
  "scene": React.PropTypes.object.isRequired,
  "transitions": React.PropTypes.array.isRequired,
  "component": React.PropTypes.func.isRequired,
  "regionProps": React.PropTypes.object,
};
