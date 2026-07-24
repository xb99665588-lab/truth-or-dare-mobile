import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TruthOrDareApp } from "./TruthOrDareApp";

describe("draw controls", () => {
  it("renders permanent truth, random, and dare controls in order", () => {
    const html = renderToStaticMarkup(<TruthOrDareApp />);
    const truth = html.indexOf(">真心话<");
    const random = html.indexOf(">随机<");
    const dare = html.indexOf(">大冒险<");

    expect(truth).toBeGreaterThan(-1);
    expect(random).toBeGreaterThan(truth);
    expect(dare).toBeGreaterThan(random);
    expect(html).not.toContain("随机来一个");
    expect(html).not.toContain("换一个");
    expect(html).not.toContain("完成了");
  });
});
