/**
 * This file is responsible for creating the timers, source images and
 * blank canvases, templates, etc. in Figma.
 * 
 */

// Reference coordinates as fallback
const right_x = 1300, left_x = 0
const timer_first_y = 712, timer_gap = 1783;
const src_canvas_first_y = 965, src_canvas_gap = 1783;
function timer_y(i: number) { return timer_first_y + (i - 1) * timer_gap; }
function src_canvas_y(i: number) { return src_canvas_first_y + (i - 1) * src_canvas_gap; }

// Get playing area page
const playPage = figma.root.findChild(node => node.name === 'Play') ?? figma.currentPage;
const colors: SolidPaint = playPage.backgrounds[0] as SolidPaint;

function createTimer(
  timerName: string, 
  timerText: string, 
  time: string,
  position: string, 
  index: number
) {
  const refNodeName: string = position === "right" ? "source-image-area-" + index.toString() : "canvas-area-" + index.toString();
  const refNode = playPage.findAll(n => n.name === refNodeName);
  const isLightMode = checkLightMode(colors.color);

  const timer = figma.createText();
  timer.name = timerName;
  timer.characters = timerText + time;
  timer.x = refNode[0] !== null ? refNode[0].x : position === "right" ? right_x : left_x;
  timer.y = refNode[0] !== null ? refNode[0].y - 240 : timer_y(index);
  timer.fontSize = 100;
  timer.fills = [
    {
      blendMode: "NORMAL",
      color: isLightMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1},
      opacity: 0.9,
      type: "SOLID",
      visible: true,
    },
  ];

  playPage.appendChild(timer);

  return timer;
}

function createSourceImage(image: Image, index: number) {
  const refNodeName: string = "source-image-area-" + index.toString();
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

function createCanvas(index: number) {
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

async function createHeader(memotime: string, playtime: string) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "IBM Plex Mono", style: "SemiBold" });
  const isLightMode = checkLightMode(colors.color);

  const header = figma.createText();
  header.fontName = { family: "IBM Plex Mono", style: "SemiBold" }
  header.name = "Header";
  header.characters = `You will have ${memotime} to memorize\nthe design and ${playtime} to replicate it.`
  header.x = 0;
  header.y = 50;
  header.fontSize = 100;
  header.fills = [
    {
      blendMode: "NORMAL",
      color: isLightMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 },
      opacity: 0.9,
      type: "SOLID",
      visible: true,
    },
  ];
  header.locked = true;
  playPage.appendChild(header);
}

async function createTemplates(preserveLayout: boolean) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  const players = await figma.clientStorage.getAsync("players") ?? 5;

  try {
    // Create templates for 5 players
    for (let i = 1; i <= 5; i++) {
      const templateLabel = createTemplateLabel(i);
      const templateCanvas = createTemplateCanvas(i);
      const templateSourceImage = createTemplateSourceImage(i);
      const groupedNodes = figma.group([templateLabel, templateCanvas, templateSourceImage], playPage);
      groupedNodes.visible = false;
      groupedNodes.name = "Player " + i.toString();

      // Position templates accordingly
      if (preserveLayout) {
        const coordinates = await figma.clientStorage.getAsync(`player_${i}_coords`);
        groupedNodes.x = coordinates === undefined ? i >= 4 ? 3300 : -400 : coordinates.x;
        groupedNodes.y = coordinates === undefined ? 965 + (1783 * (i >= 4 ? (i - 4) : (i - 1))) : coordinates.y;
      } else {
        await figma.clientStorage.deleteAsync(`player_${i}_coords`);
        groupedNodes.x = i >= 4 ? 3300 : -400;
        groupedNodes.y = 965 + (1783 * (i >= 4 ? (i - 4) : (i - 1)));
      }

      // Hide extra templates given player count
      if (i <= players + 1) {
        groupedNodes.visible = true;
      }
    }
  } catch (err) {
    console.log(err);
    figma.notify("Error resetting board. Please duplicate the community file again.", {
      timeout: 1500,
      button: { text: "✕", action: () => { return true } }
    });
  }
}

function createTemplateLabel(num: number) {
  const isLightMode = checkLightMode(colors.color);
  
  const templateNumberBg = figma.createRectangle();
  templateNumberBg.name = "number-bg-" + num.toString();
  templateNumberBg.resize(200, 200);
  templateNumberBg.cornerRadius = 100;
  templateNumberBg.x = -400;
  templateNumberBg.y = 965;
  templateNumberBg.isMask = true;

  const templateNumberLabel = figma.createText();
  templateNumberLabel.fontName = { family: "Inter", style: "Bold" }
  templateNumberLabel.name = num.toString();
  templateNumberLabel.characters = num.toString();
  templateNumberLabel.x = -330;
  templateNumberLabel.y = 1004;
  templateNumberLabel.fontSize = 100;

  const subtraction = figma.subtract([templateNumberLabel, templateNumberBg], playPage);
  subtraction.name = "number-group";
  subtraction.fills = [
    {
      blendMode: "NORMAL",
      color: isLightMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 },
      opacity: 0.9,
      type: "SOLID",
      visible: true,
    },
  ];
  playPage.appendChild(subtraction);
  return subtraction;
}

function createTemplateCanvas(num: number) {
  const isLightMode = checkLightMode(colors.color);

  const templateCanvas = figma.createRectangle();
  templateCanvas.name = "canvas-area-" + num.toString();
  templateCanvas.resize(1000, 1000);
  templateCanvas.fills = [];
  templateCanvas.strokes = [
    { 
      type: 'SOLID', 
      color: isLightMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 }, 
      opacity: 0.9
    }
  ];
  templateCanvas.dashPattern = [100, 100];
  templateCanvas.x = 0;
  templateCanvas.y = 965;
  templateCanvas.strokeWeight = 10;
  templateCanvas.strokeCap = "ROUND";
  templateCanvas.strokeJoin = "ROUND";

  const templateCanvasLabel = figma.createText();
  templateCanvasLabel.name = "Canvas";
  templateCanvasLabel.characters = "Canvas";
  templateCanvasLabel.x = 326;
  templateCanvasLabel.y = 1405;
  templateCanvasLabel.fontSize = 100;
  templateCanvasLabel.fills = [
    {
      blendMode: "NORMAL",
      color: isLightMode ? { r: 0, g: 0, b: 0} : { r: 1, g: 1, b: 1 },
      opacity: 1,
      type: "SOLID",
      visible: true,
    },
  ];

  playPage.appendChild(templateCanvas);
  playPage.appendChild(templateCanvasLabel);
  const groupedNodes = figma.group([templateCanvas, templateCanvasLabel], playPage);
  groupedNodes.name = "canvas-group";
  return groupedNodes;
}

function createTemplateSourceImage(num: number) {
  const isLightMode = checkLightMode(colors.color);

  const templateSourceImage = figma.createRectangle();
  templateSourceImage.name = "source-image-area-" + num.toString();
  templateSourceImage.resize(1000, 1000);
  templateSourceImage.fills = [];
  templateSourceImage.strokes = [
    { 
      type: 'SOLID', 
      color: isLightMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 }, 
      opacity: 0.3 
    }
  ];
  templateSourceImage.dashPattern = [100, 100];
  templateSourceImage.x = 1300;
  templateSourceImage.y = 965;
  templateSourceImage.strokeWeight = 10;
  templateSourceImage.strokeCap = "ROUND";
  templateSourceImage.strokeJoin = "ROUND";

  const templateSourceImageLabel = figma.createText();
  templateSourceImageLabel.name = "Screenshot";
  templateSourceImageLabel.characters = "Screenshot";
  templateSourceImageLabel.x = 1531;
  templateSourceImageLabel.y = 1405;
  templateSourceImageLabel.fontSize = 100;
  templateSourceImageLabel.fills = [
    {
      blendMode: "NORMAL",
      color: isLightMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 },
      opacity: 0.3,
      type: "SOLID",
      visible: true,
    },
  ];

  playPage.appendChild(templateSourceImage);
  playPage.appendChild(templateSourceImageLabel);
  const groupedNodes = figma.group([templateSourceImage, templateSourceImageLabel], playPage);
  groupedNodes.name = "source-image-group";
  return groupedNodes;
}

function createArchivedRounds() {
  const frame = figma.createFrame();
  frame.x = 0;
  frame.y = 0;
  frame.fills = [];
  frame.layoutPositioning = "AUTO";
  frame.layoutMode = "HORIZONTAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.verticalPadding = 500;
  frame.itemSpacing = 1000;
  frame.name = "Archived Rounds";
  return frame;
}

// To determine element colors in light / dark mode
// https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
function checkLightMode(color: { r: number, g: number, b: number }) {
  const luma = 0.2126 * 255 * color.r + 0.7152 * 255 * color.g + 0.0722 * 255 *  color.b;
  return luma > 40;
}

export {
  createTimer,
  createSourceImage,
  createCanvas,
  createHeader,
  createTemplates,
  createTemplateLabel,
  createTemplateCanvas,
  createTemplateSourceImage,
  createArchivedRounds
}