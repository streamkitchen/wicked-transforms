
import {} from "./index.html.mustache";
import ReactDOM from "react-dom";
import React from "react";
import {} from "normalize.css/normalize.css";

class WickedTransforms extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return <div>hi</div>;
  }
}

ReactDOM.render(<WickedTransforms />, document.querySelector("main"));
