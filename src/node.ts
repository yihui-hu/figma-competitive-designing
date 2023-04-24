/**
 * This file is responsible for creating the timers, source images and
 * black canvases in Figma.
 * 
 * `createTimer` returns a text node, 
 * `createSourceImage` returns a rectangle node with an image fill 
 * `createCanvas` returns a frame node.
 */

// Reference coordinates as fallback
const right_x = 1300, left_x = 0
const timer_first_y = 712, timer_gap = 1783;
const src_canvas_first_y = 965, src_canvas_gap = 1783;
function timer_y(i: number) { return timer_first_y + (i - 1) * timer_gap; }
function src_canvas_y(i: number) { return src_canvas_first_y + (i - 1) * src_canvas_gap; }

// Get playing area page
const playPage = figma.root.findChild(node => node.name === 'Play') ?? figma.currentPage;

export function createTimer(timerName: string, timerText: string, time: string,
  position: string, index: number) {

  const refNodeName: string = position === "right" ? "source-image-area-" + index.toString() : "canvas-area-" + index.toString();
  const refNode = playPage.findAll(n => n.name === refNodeName);

  const timer = figma.createText();
  timer.name = timerName;
  timer.characters = timerText + time;
  timer.x = refNode[0] !== null ? refNode[0].x : position === "right" ? right_x : left_x;
  timer.y = refNode[0] !== null ? refNode[0].y - 240 : timer_y(index);
  timer.fontSize = 100;
  timer.fills = [
    {
      blendMode: "NORMAL",
      color: { r: 1, g: 1, b: 1 },
      opacity: 1,
      type: "SOLID",
      visible: true,
    },
  ];
  playPage.appendChild(timer);

  return timer;
}

export function createSourceImage(image: Image, index: number) {
  const refNodeName: string = "source-image-area-" + index.toString()
  const refNode = playPage.findAll(n => n.name === refNodeName);

  const source_img = figma.createRectangle();
  source_img.name = "source-img-" + index.toString();
  source_img.x = refNode[0] !== null ? refNode[0].x : right_x;
  source_img.y = refNode[0] !== null ? refNode[0].y : src_canvas_y(index);
  source_img.resize(1000, 1000);
  source_img.fills = [
    {
      type: "IMAGE",
      imageHash: image.hash,
      scaleMode: "FILL",
    },
  ];
  source_img.visible = false;
  playPage.appendChild(source_img);

  return source_img;
}

export function createCanvas(index: number) {
  const refNodeName: string = "canvas-area-" + index.toString()
  const refNode = playPage.findAll(n => n.name === refNodeName);

  const canvas = figma.createFrame();
  canvas.name = "canvas-" + index.toString();
  canvas.x = refNode[0] !== null ? refNode[0].x : left_x;
  canvas.y = refNode[0] !== null ? refNode[0].y : src_canvas_y(index);
  canvas.resize(1000, 1000);
  playPage.appendChild(canvas);

  return canvas;
}