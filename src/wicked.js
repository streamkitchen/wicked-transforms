
import * as defaultScenes from "./default-scenes";
import WickedTransition, {instantScene} from "./wicked-transition";
import debug from "debug";

const log = debug("sk:wicked");

export function getScene(regions) {
  const possibleScenes = Object.keys(defaultScenes)
    .map(sName => defaultScenes[sName])
    .filter(s => s.regions.length === regions.length);
  if (possibleScenes.length === 0) {
    return null;
  }
  const scene = possibleScenes[0];
  // Return a version of the scene with the locations overridden by our provided one
  return {
    ...scene,
    regions: scene.regions.map((r, i) => {
      return {
        ...regions[i],
        ...scene.regions[i],
      };
    }),
  };
}

export function getTransition(scene, newScene) {
  let result = WickedTransition.findPath(scene, newScene);
  if (!result) {
    result = {
      transitions: [],
      scenePath: [],
    };
  }
  let {transitions, scenePath} = result;
  let currentScene = scene;
  log(`Applying path: [${transitions.map(t => t.name).join(", ")}]`);
  const queue = [];
  transitions.forEach((transition, i) => {
    const stubScene = transition.go(currentScene, scenePath[i]);
    currentScene = scenePath[i];
    queue.push(...stubScene);
    // queue.push(instantScene(currentScene));
  });
  queue.push(instantScene(newScene));
  return queue;
}
