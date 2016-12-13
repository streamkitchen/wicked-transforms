
import * as defaultScenes from "./default-scenes";

export function getScene(regions) {
  const possibleScenes = Object.keys(defaultScenes)
    .map(sName => defaultScenes[sName])
    .filter(s => s.regions.length === regions.length);
  if (possibleScenes.length === 0) {
    return null;
  }
  const scene = possibleScenes[Math.floor(Math.random() * possibleScenes.length)];
  // Return a version of the scene with the locations overridden by our provided one
  return {
    ...scene,
    regions: scene.regions.map((r, i) => {
      return {
        ...regions[i],
        ...scene.regions[i],
      }
    }),
  }
}
