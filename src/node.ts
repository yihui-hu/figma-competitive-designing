/**
 * This file is responsible for creating the timers, source images and
 * blank canvases, templates, etc. in the Figma file.
 * 
 */

import { TimerProps } from "./interface";

// Reference coordinates as fallback
const right_x = 1300, left_x = 0
const timer_first_y = 712, timer_gap = 1783;
const src_canvas_first_y = 965, src_canvas_gap = 1783;
function timer_y(i: number) { return timer_first_y + (i - 1) * timer_gap; }
function src_canvas_y(i: number) { return src_canvas_first_y + (i - 1) * src_canvas_gap; }

// Get playing area page
const playPage = figma.root.findChild(node => node.name === 'Play') ?? figma.currentPage;
const colors: SolidPaint = playPage.backgrounds[0] as SolidPaint;

function createTimer(t: TimerProps) {
  const refNodeName: string = t.position === "right" ? "source-image-area-" + t.index.toString() : "canvas-area-" + t.index.toString();
  const refNode = playPage.findAll(n => n.name === refNodeName);
  const colors: SolidPaint = playPage.backgrounds[0] as SolidPaint;
  const isLightMode = checkLightMode(colors.color);

  const timer = figma.createText();
  timer.name = t.name;
  timer.characters = t.text + t.time;
  timer.x = refNode[0] !== null ? refNode[0].x : t.position === "right" ? right_x : left_x;
  timer.y = refNode[0] !== null ? refNode[0].y - 240 : timer_y(t.index);
  timer.fontSize = 100;
  timer.fills = fill(isLightMode, 0.9);

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

function createPlayerLabel(index: number, playerName: string) {
  const refNodeName: string = "source-image-area-" + index.toString();
  const refNode = playPage.findAll(n => n.name === refNodeName);
  const isLightMode = checkLightMode(colors.color);

  const playerLabel = figma.createText();
  playerLabel.name = "player-" + index.toString();
  playerLabel.x = left_x;
  playerLabel.y = refNode[0].y + 1100;
  playerLabel.characters = playerName ?? "Player " + index.toString();
  playerLabel.fontSize = 70;
  playerLabel.fills = fill(isLightMode, 0.9);

  playPage.appendChild(playerLabel);

  return playerLabel;
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
  header.y = 40;
  header.fontSize = 100;
  header.fills = fill(isLightMode, 0.9);
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
      const playerName = await figma.clientStorage.getAsync(`player_${i}_name`);
      const templateLabel = createTemplateLabel(i);
      const templateCanvas = createTemplateCanvas(i);
      const templateSourceImage = createTemplateSourceImage(i);
      const templatePlayerLabel = createPlayerLabel(i, playerName);
      const groupedNodes = figma.group([templateLabel, templateCanvas, templateSourceImage, templatePlayerLabel], playPage);
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
  templateNumberBg.name = "label-bg-" + num.toString();
  templateNumberBg.resize(200, 200);
  templateNumberBg.cornerRadius = 100;
  templateNumberBg.x = -400;
  templateNumberBg.y = 965;
  templateNumberBg.isMask = true;

  const templateNumberLabel = figma.createText();
  templateNumberLabel.fontName = { family: "Inter", style: "Bold" }
  templateNumberLabel.name = num.toString();
  templateNumberLabel.characters = num.toString();
  templateNumberLabel.resize(200, 200);
  templateNumberLabel.textAlignHorizontal = "CENTER";
  templateNumberLabel.textAlignVertical = "CENTER";
  templateNumberLabel.x = -400;
  templateNumberLabel.y = 965;
  templateNumberLabel.fontSize = 100;

  const subtraction = figma.subtract([templateNumberLabel, templateNumberBg], playPage);
  subtraction.name = "label-group-" + num.toString();
  subtraction.fills = fill(isLightMode, 0.9);
  playPage.appendChild(subtraction);
  return subtraction;
}

function createTemplateCanvas(num: number) {
  const isLightMode = checkLightMode(colors.color);

  const templateCanvas = figma.createRectangle();
  templateCanvas.name = "canvas-area-" + num.toString();
  templateCanvas.resize(1000, 1000);
  templateCanvas.fills = [];
  templateCanvas.strokes = strokes(isLightMode, 0.9);
  templateCanvas.dashPattern = [100, 100];
  templateCanvas.x = 0;
  templateCanvas.y = 965;
  templateCanvas.strokeWeight = 10;
  templateCanvas.strokeCap = "ROUND";
  templateCanvas.strokeJoin = "ROUND";

  const templateCanvasLabel = figma.createText();
  templateCanvasLabel.name = "canvas-text-" + num.toString();
  templateCanvasLabel.characters = "Canvas";
  templateCanvasLabel.x = 326;
  templateCanvasLabel.y = 1405;
  templateCanvasLabel.fontSize = 100;
  templateCanvasLabel.fills = fill(isLightMode, 0.9);

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
  templateSourceImage.strokes = strokes(isLightMode, 0.3)
  templateSourceImage.dashPattern = [100, 100];
  templateSourceImage.x = 1300;
  templateSourceImage.y = 965;
  templateSourceImage.strokeWeight = 10;
  templateSourceImage.strokeCap = "ROUND";
  templateSourceImage.strokeJoin = "ROUND";

  const templateSourceImageLabel = figma.createText();
  templateSourceImageLabel.name = "source-image-text-" + num.toString();
  templateSourceImageLabel.characters = "Screenshot";
  templateSourceImageLabel.x = 1531;
  templateSourceImageLabel.y = 1405;
  templateSourceImageLabel.fontSize = 100;
  templateSourceImageLabel.fills = fill(isLightMode, 0.3);

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

// Update template colors when background of page changes
function updateColors(colors: { r: number, g: number, b: number }) {
  const isLightMode = checkLightMode(colors);

  for (let i = 1; i <= 5; i++) {
    const index = i.toString();
    const canvasNodes = figma.currentPage.findAll(n => n.name === "canvas-area-" + index) as RectangleNode[];
    const canvasTexts = figma.currentPage.findAll(n => n.name === "canvas-text-" + index) as TextNode[];
    const sourceNodes = figma.currentPage.findAll(n => n.name === "source-image-area-" + index) as RectangleNode[];
    const sourceTexts = figma.currentPage.findAll(n => n.name === "source-image-text-" + index) as TextNode[];
    const playerLabels = figma.currentPage.findAll(n => n.name === "player-" + index) as TextNode[];
    const templateLabels = figma.currentPage.findAll(n => n.name === "label-group-" + index) as FrameNode[];

    if (canvasNodes === undefined || 
        canvasTexts === undefined ||
        sourceNodes === undefined ||
        sourceTexts === undefined || 
        playerLabels === undefined ||
        templateLabels === undefined) {
      return;
    }

    for (let canvasNode of canvasNodes) canvasNode.strokes = strokes(isLightMode, 0.9);
    for (let canvasText of canvasTexts) canvasText.fills = fill(isLightMode, 0.9);
    for (let sourceNode of sourceNodes) sourceNode.strokes = strokes(isLightMode, 0.9);
    for (let sourceText of sourceTexts) sourceText.fills = fill(isLightMode, 0.9);
    for (let playerLabel of playerLabels) playerLabel.fills = fill(isLightMode, 0.9);
    for (let templateLabel of templateLabels) templateLabel.fills = fill(isLightMode, 0.9);
  }

  const headers = figma.currentPage.findAll(n => n.name === "Header") as TextNode[];
  if (headers === undefined) return;
  for (let header of headers) header.fills = fill(isLightMode, 0.9);
}

function fill(isLightMode: boolean, opacity: number) {
  return [
    {
      blendMode: "NORMAL",
      color: isLightMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 },
      opacity: opacity,
      type: "SOLID",
      visible: true,
    },
  ] as SolidPaint[];
}

function strokes(isLightMode: boolean, opacity: number) {
  return [
    { 
      type: "SOLID", 
      color: isLightMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 }, 
      opacity: opacity
    }
  ] as SolidPaint[];
}

// To determine element colors in light / dark mode, code adapted from
// https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
function checkLightMode(color: { r: number, g: number, b: number }) {
  const luma = 0.2126 * 255 * color.r + 0.7152 * 255 * color.g + 0.0722 * 255 *  color.b;
  return luma > 60;
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
  createArchivedRounds,
  updateColors
}