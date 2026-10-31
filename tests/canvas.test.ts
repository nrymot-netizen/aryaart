import { describe, expect, it } from "vitest";
import {
  clampBrushSize,
  clampZoom,
  fitCanvasZoom,
  createLayer,
  drawingToDemoFile,
  emptyDrawingMessage,
  estimateDataUrlBytes,
  floodFillRgba,
  hexToRgba,
  isInlineArtworkSrc,
  isJpegDataUrl,
  latestFileOfKind,
  mirrorPoint,
  rgbaToHex,
  stabilizePoint,
} from "@/lib/domain/canvas";

describe("canvas helpers", () => {
  it("detects inline artwork sources used by the demo store", () => {
    expect(isInlineArtworkSrc("data:image/jpeg;base64,abc")).toBe(true);
    expect(isInlineArtworkSrc("blob:http://localhost/1")).toBe(true);
    expect(isInlineArtworkSrc("/art/moon-garden.svg")).toBe(false);
  });

  it("rejects empty drawings and accepts marks", () => {
    expect(emptyDrawingMessage(false)).toMatch(/Draw something/);
    expect(emptyDrawingMessage(true)).toBeNull();
  });

  it("clamps brush size to the studio range", () => {
    expect(clampBrushSize(1)).toBe(2);
    expect(clampBrushSize(18)).toBe(18);
    expect(clampBrushSize(200)).toBe(128);
  });

  it("maps an exported drawing to a canvas-sourced demo file", () => {
    const dataUrl = "data:image/jpeg;base64,aaaa";
    const file = drawingToDemoFile(
      { dataUrl, byteLength: estimateDataUrlBytes(dataUrl), width: 720, height: 900, paperColor: "#fffdf8" },
      "sketch",
      "sketch.jpg",
      "2026-08-17T20:00:00Z",
    );
    expect(file.source).toBe("arya-canvas");
    expect(file.kind).toBe("sketch");
    expect(file.preview).toBe(dataUrl);
    expect(isJpegDataUrl(file.preview ?? "")).toBe(true);
  });

  it("fills a closed empty region and leaves a different color alone", () => {
    const width = 4;
    const height = 4;
    const data = new Uint8ClampedArray(width * height * 4);
    data.set([255, 0, 0, 255], 0);
    const filled = floodFillRgba(data, width, height, 1, 0, [0, 0, 255, 255]);
    expect(filled).toBeGreaterThan(0);
    expect([data[4], data[5], data[6], data[7]]).toEqual([0, 0, 255, 255]);
    expect([data[0], data[1], data[2], data[3]]).toEqual([255, 0, 0, 255]);
  });

  it("converts hex colors for fill", () => {
    expect(hexToRgba("#6941c6")).toEqual([105, 65, 198, 255]);
    expect(rgbaToHex(105, 65, 198)).toBe("#6941c6");
  });

  it("returns the latest file of a kind", () => {
    expect(latestFileOfKind([
      { kind: "sketch", createdAt: "1" },
      { kind: "final", createdAt: "2" },
      { kind: "sketch", createdAt: "3" },
    ], "sketch")?.createdAt).toBe("3");
  });

  it("stabilizes, mirrors, zooms, and names layers for the power studio", () => {
    expect(stabilizePoint({ x: 0, y: 0, p: 1 }, { x: 10, y: 0, p: 1 }, 0.5)).toEqual({ x: 5, y: 0, p: 1 });
    expect(mirrorPoint({ x: 120, y: 10, p: 1 }, 720).x).toBe(600);
    expect(clampZoom(9)).toBe(4);
    expect(clampZoom(0.1)).toBe(0.25);
    expect(fitCanvasZoom(360)).toBe(0.5);
    expect(fitCanvasZoom(288)).toBe(0.4);
    expect(createLayer(0).id).toBe("layer-1");
  });
});
