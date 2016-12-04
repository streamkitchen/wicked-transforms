
import WickedTransition from "../src/wicked-transition";
import {state1x1, state1x2, state2x1} from "../src/default-states";

describe("WickedTransition", () => {

  it("should find paths through the abyss", () => {
    const path = WickedTransition.findPath(state1x2, state2x1);
    expect(path.length).toBe(2);
    const [t1, t2] = path;
    expect(t1.name).toBe("1x1 --> 1x2 (reversed)");
    expect(t2.name).toBe("1x1 --> 2x1");
  });

});
