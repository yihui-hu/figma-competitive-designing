// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// optimizing node traversals
figma.skipInvisibleInstanceChildren = true

// initialize are.na api URL
const ARENA_API_BASE_URL = "https://api.are.na/v2";

// TO-DO:
// error handling for empty channels (just check if images array is empty)
// handle pagination
// allow user input of custom channel slugs via URL
// specify number of players --> create that number of canvases/src imgs

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async msg => {
  // get random image from are.na channel
  const channelSlug = "humans-and-machines"
  const response = await fetch(`${ARENA_API_BASE_URL}/channels/${channelSlug}/contents`);
  const json = await response.json();
  const images = json.contents.filter((content: any) => content.class === "Image" || content.class === "Link");

  if (images.length === 0) {
    // do something here
  }

  const randomIndex = Math.floor(Math.random() * images.length);
  const source = images[randomIndex].image.large.url;

  if (msg.type === 'get-source') {
    const imageNode = figma.createImageAsync(
      source
    ).then(async (image: Image) => {
      // Create node
      const node = figma.createRectangle()
      node.name = "source-img";

      // Resize the node to match the image's width and height
      const { width, height } = await image.getSizeAsync()
      node.resize(width, height)

      // Set the fill on the node
      node.fills = [
        {
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FILL'
        }
      ]

      figma.currentPage.appendChild(node);
      nodes.push(node);
    }).catch((error: any) => {
      console.log(error)
    })

    // const nodes: SceneNode[] = [];
    // for (let i = 0; i < msg.count; i++) {
    //   const rect = figma.createRectangle();
    //   rect.x = i * 150;
    //   rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];

    //   rect.name = "Rectangle";

    //   figma.currentPage.appendChild(rect);
    //   nodes.push(rect);
    // }
    // figma.currentPage.selection = nodes;
    // figma.viewport.scrollAndZoomIntoView(nodes);

    const tree = figma.currentPage;

    const nodes = tree.findAll(node => {
      return node.name === "source-img"
    })
  
    setTimeout(() => {
      try {
        for (const node of nodes) {
          node.remove()
        }
      } catch (err) {
        console.log(err);
      }
    }, 5000);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
};
