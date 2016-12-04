
import WickedScene from "../src/wicked-scene";

describe("WickedScene", () => {

  it("should reduce fractions", () => {
    const [num, den] = WickedScene.prototype._reduce(10, 5);
    expect(num).toBe(2);
    expect(den).toBe(1);
  });

  it("should produce the same ref for the same scene", () => {
    const params = {
      width: 100,
      height: 100,
      regions: [{
        x: 0,
        y: 0,
        width: 50,
        height: 100,
      }, {
        x: 50,
        y: 0,
        width: 50,
        height: 100,
      }]
    };
    const scene1 = new WickedScene(params);
    const scene2 = new WickedScene(params);
    expect(scene1 === scene2).toBe(true);
  });
});
