/**
 * This file contains the main body of code that sets up, initiates and
 * clears the playing area of the associated Figma community file:
 * TODO: LINK TO FIGMA COMMUNITY FILE HERE
 */

import * as Timer from "./timer";
import * as Node from "./node";
import { TimerProps } from "./interface";

console.clear();

// Show the HTML page for the plugin as designed in ui.html
figma.showUI(__html__, { height: 385 });

// Update template colors if necessary
const colors: SolidPaint = figma.currentPage.backgrounds[0] as SolidPaint;
Node.updateColors(colors.color);

// Retrieve saved settings from Figma's clientStorage, if they exist
async function getStorage() {
  const arena_url = await figma.clientStorage.getAsync("arena_url");
  const players = await figma.clientStorage.getAsync("players");
  const memo_time = await figma.clientStorage.getAsync("memo_time");
  const playtime = await figma.clientStorage.getAsync("playtime");
  const pages = await figma.clientStorage.getAsync("pages");
  const preserve_layout = await figma.clientStorage.getAsync("preserve_layout");
  const storage = {
    arena_url: arena_url,
    players: players,
    memo_time: memo_time,
    playtime: playtime,
    pages: pages,
    preserve_layout: preserve_layout,
  };
  figma.ui.postMessage({ type: "storage", storage: storage });
}
getStorage();

// Initialize default Are.na API URL
const ARENA_API_BASE_URL = "https://api.are.na/v2";

// Get playing area page
const playPage = figma.root.findChild((node) => node.name === "Play") ?? figma.currentPage;

// Listen to messages posted from Figma plugin UI
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "play":
      playGame(msg);
      break;
    case "reset":
      resetBoard(true);
      break;
    case "updateHeader":
      updateHeader(msg.times);
      break;
    case "updateTemplates":
      updateTemplates(msg.index);
      break;
    case "updateSettings":
      updateSettings(msg.checked);
      break;
    case "cancel":
      figma.closePlugin();
      break;
    default:
      figma.closePlugin();
      break;
  }
};

// Listen to changes in templates' position & save to storage
figma.on("documentchange", async () => {
  const selectedNode = figma.currentPage.selection[0];

  if (selectedNode && /Player \d+$/.test(selectedNode.name)) {
    const currentCoordinates = { x: selectedNode.x, y: selectedNode.y };
    const player_number = selectedNode.name.split(" ")[1];
    await figma.clientStorage.setAsync(`player_${player_number}_coords`, currentCoordinates);
  }

  if (selectedNode && /player-\d+$/.test(selectedNode.name)) {
    const currentText = (selectedNode as TextNode).characters;
    const player_number = selectedNode.name.split("-")[1];
    await figma.clientStorage.setAsync(`player_${player_number}_name`, currentText);
  }

  const colors: SolidPaint = figma.currentPage.backgrounds[0] as SolidPaint;
  Node.updateColors(colors.color);
});

// Set up play area and initiate game
async function playGame(msg: any) {
  // Clear previous rounds, if any
  const nodes = playPage.findAll((node) => {
    return (
      /source-img-\d+$/.test(node.name) ||
      /canvas-\d+$/.test(node.name) ||
      node.name === "playtimer" ||
      node.name === "memotimer" ||
      node.name === "countdowntimer"
    );
  }) ?? [];
  for (const node of nodes) node.remove();

  // If starting on new, empty file, initialize board
  if (playPage.children.length === 0) {
    resetBoard(false);
  }

  // Get user params
  const memotime = msg.memotime * 1000;
  const memotime_text = msg.memotime_text;
  const playtime = msg.playtime * 1000;
  const playtime_text = msg.playtime_text;
  const num_players = parseInt(msg.num_players);
  const channelURL = msg.url.split("/");
  const channelSlug = channelURL[channelURL.length - 1];

  const loading = figma.notify("Loading...", { timeout: Infinity });

  // Get URL to random source image from specified Are.na channel
  let source_img: string;
  try {
    const storedURL = await figma.clientStorage.getAsync("arena_url");
    const pages = await figma.clientStorage.getAsync("pages");
    const page_number =
      storedURL === msg.url && pages !== undefined
        ? Math.floor(Math.random() * pages)
        : await getPageNumber(ARENA_API_BASE_URL, channelSlug);
    const response = await fetch(
      `${ARENA_API_BASE_URL}/channels/${channelSlug}/contents?page=${page_number}`
    );
    const json = await response.json();
    const images = json.contents.filter(
      (content: any) => content.class === "Image" || content.class === "Link"
    );
    console.log(images);

    // If Are.na link is valid but channel is empty, exit
    if (images.length === 0) {
      figma.ui.postMessage({
        type: "error",
        message: "Are.na channel has no images / links."
      });
      loading.cancel();
      return;
    }

    const randomIndex = Math.floor(Math.random() * images.length);
    source_img = images[randomIndex].image.large.url;
    // If Are.na link is invalid
  } catch (err) {
    figma.ui.postMessage({
      type: "error",
      message: "Are.na channel does not exist."
    });
    loading.cancel();
    return;
  }

  await figma.clientStorage.setAsync("arena_url", msg.url);
  figma.ui.hide();

  const tree = playPage;
  const src_imgs = tree.findAll((node) => { return node.name === "source-img" });
  const canvases = tree.findAll((node) => { return node.name === "canvas" });
  const memotimers = tree.findAll((node) => { return node.name === "memotimer" });
  const playtimers = tree.findAll((node) => { return node.name === "playtimer" });
  const countdowntimers = tree.findAll((node) => { return node.name === "countdowntimer" });

  // Main game loop
  figma.createImageAsync(source_img).then(async (image: Image) => {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    for (let i = 1; i < num_players + 1; i++) {
      // Create initial frames for source img, canvas and timers
      const source_img = Node.createSourceImage(image, i);
      const timerProps: TimerProps = {
        name: "countdowntimer",
        text: "Starting in: ",
        time: "0:05",
        position: "right",
        index: i,
      };
      const countdowntimer = Node.createTimer(timerProps);
      Timer.start(countdowntimer, "Starting in: ");
      src_imgs.push(source_img);
      countdowntimers.push(countdowntimer);

      loading.cancel();
    }

    // Remove countdown timer & create memo timers after countdown
    setTimeout(() => {
      for (const src_img of src_imgs) src_img.visible = true;
      for (const node of countdowntimers) node.remove();

      for (let i = 1; i < num_players + 1; i++) {
        const timerProps: TimerProps = {
          name: "memotimer",
          text: "Time left: ",
          time: memotime_text,
          position: "right",
          index: i,
        };
        const memotimer = Node.createTimer(timerProps);
        Timer.start(memotimer, "Time left: ");
        memotimers.push(memotimer);
      }
    }, 5000);

    // Hide source images, remove memo timers & create playtime timers
    setTimeout(() => {
      for (const src_img of src_imgs) src_img.visible = false;
      for (const node of memotimers) node.remove();

      for (let i = 1; i < num_players + 1; i++) {
        const timerProps: TimerProps = {
          name: "playtimer",
          text: "Time left: ",
          time: playtime_text,
          position: "left",
          index: i,
        };
        const playtimer = Node.createTimer(timerProps);
        const canvas = Node.createCanvas(i);
        canvases.push(canvas);
        Timer.start(playtimer, "Time left: ");
        playtimers.push(playtimer);
      }
    }, memotime + 5000);

    // Set timeout for game duration + show source image once round ends
    setTimeout(() => {
      for (const src_img of src_imgs) src_img.visible = true;
      for (const playtimer of playtimers) playtimer.remove();

      figma.ui.postMessage({ type: "error", message: "" });
      figma.viewport.scrollAndZoomIntoView(playPage.children);
      figma.closePlugin();

      archiveRound();
    }, playtime + memotime + 5000);

  }).catch((error: any) => {
    console.log(error);
    loading.cancel();
    sendFigmaMessage("😵‍💫 Something went wrong. Try resetting the board.", 2500);
    setTimeout(() => {
      figma.closePlugin();
    }, 3000);
  });
}

// Get random page number from Are.na channel and save page count to clientStorage
async function getPageNumber(ARENA_API_BASE_URL: string, channelSlug: string) {
  try {
    const res = await fetch(`${ARENA_API_BASE_URL}/channels/${channelSlug}`);
    const json = await res.json();
    const pages = Math.ceil(json.length / 20);
    const page_number = Math.floor(Math.random() * pages);
    await figma.clientStorage.setAsync("pages", pages);

    return page_number;
  } catch (err) {
    figma.ui.postMessage({
      type: "error",
      message: "Are.na channel does not exist.",
    });
    return;
  }
}

// Reset board
async function resetBoard(userCleared: boolean) {
  try {
    const preserveLayout = await figma.clientStorage.getAsync("preserve_layout");
    const memotime_text = (await figma.clientStorage.getAsync("memo_time_text")) ?? "30 seconds";
    const playtime_text = (await figma.clientStorage.getAsync("playtime_text")) ?? "3 minutes";

    for (const node of playPage.children) node.remove();
    await Node.createHeader(memotime_text, playtime_text);
    await Node.createTemplates(preserveLayout);

    if (userCleared) sendFigmaMessage("Board reset ✨", 1500);
  } catch (err) {
    console.log(err);
    sendFigmaMessage("Error resetting board. Please try again.", 1500);
  }
}

// Update header information based on memorization & play time
async function updateHeader(times: {
  memotime: string;
  playtime: string;
  memotime_index: number;
  playtime_index: number;
}) {
  try {
    const header = playPage.findChild((n) => n.type === "TEXT" && n.name === "Header") as TextNode;
    if (header !== null) {
      await figma.loadFontAsync({ family: "IBM Plex Mono", style: "SemiBold" });
      header.characters = `You will have ${times.memotime} to memorize\nthe design and ${times.playtime} to replicate it.`;
    } else {
      await Node.createHeader(times.memotime, times.playtime);
    }

    // Save settings for timers
    await figma.clientStorage.setAsync("memo_time", times.memotime_index);
    await figma.clientStorage.setAsync("memo_time_text", times.memotime);
    await figma.clientStorage.setAsync("playtime", times.playtime_index);
    await figma.clientStorage.setAsync("playtime_text", times.playtime);
  } catch (err) {
    console.log(err);
    sendFigmaMessage("😵‍💫 Something went wrong. Try resetting the board.", 2500);
  }
}

// Update templates visibilities based on number of players
async function updateTemplates(index: number) {
  try {
    await figma.clientStorage.setAsync("players", index - 1);

    for (let i = 1; i <= 5; i++) {
      const templateName = "Player " + i.toString();
      const template = playPage.findOne((n) => n.name === templateName);
      if (template !== null) {
        template.visible = i <= index ? true : false;
      } else {
        throw new Error("No corresponding template found.");
      }
    }
  } catch (err) {
    console.log(err);
    sendFigmaMessage("😵‍💫 Something went wrong. Try resetting the board.", 2500);
  }
}

async function updateSettings(preserveLayout: boolean) {
  await figma.clientStorage.setAsync("preserve_layout", preserveLayout);
}

// Make copy of play area once round ends and move to Archive page
function archiveRound() {
  try {
    const nodes = playPage.children ?? [];
    let archive = figma.root.findChild((node) => node.name === "Archive");
    
    // Create Archive page if not already present
    if (archive === null) {
      archive = figma.createPage();
      archive.name = "Archive";
    }

    nodes.forEach((node) => archive?.appendChild(node.clone()));

    // Create Archived Rounds auto-layout element if not already present
    let archivedRounds = archive?.findChild((node) => node.name === "Archived Rounds");
    if (archivedRounds === null) {
      const frame = Node.createArchivedRounds();
      archive?.appendChild(frame);
      archivedRounds = frame;
    }

    // Move round to Archive Page, group, then add to auto-layout element
    const clonedNodes: SceneNode[] = archive?.findChildren((node) => {
      return node.name !== "Archived Rounds";
    });
    const groupedNodes = figma.group(clonedNodes, archive ?? figma.currentPage);
    groupedNodes.name = "Archived Round";
    (archivedRounds as FrameNode).insertChild(0, groupedNodes);
  } catch (err) {
    console.log(err);
    sendFigmaMessage("😔 Error archiving round.", 1500);
  }
}

function sendFigmaMessage(message: string, time: number) {
  figma.notify(message, {
    timeout: time,
    button: { text: "✕", action: () => { return true } },
  });
}
