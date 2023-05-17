/**
 * This file is responsible for creating the live timers in Figma. 
 * start() takes a TextNode and a string as input, extracts a time value from 
 * the TextNode's characters, converts it to seconds, and then starts a timer 
 * that updates the TextNode's chars every second until the timer reaches zero.
 * 
 * Timer code adapted from: https://github.com/lennet/Figma-Timer
 */

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const secondsSet = [86400, 3600, 60, 1];

function start(node: TextNode, text: string) {
  var timeString = node.characters;
  timeString = timeString.replace(text, "");
  var seconds = getRemainingSeconds(timeString);
  var template = getTemplateFromString(timeString);

  startTimer(node, seconds, template, text);
}

function getRemainingSeconds(timeString: string): number {
  var seconds = 0;
  var components = timeString.split(":");
  secondsSet.reverse();

  components.reverse().forEach((element, index) => {
    var factor = secondsSet[index];
    seconds += factor * Number(element);
  });

  secondsSet.reverse();

  return seconds;
}

function getTemplateFromString(timeString: string): string {
  var result = "";
  for (const c of timeString) {
    if (c == ":") {
      result += c;
    } else {
      result += "0";
    }
  }
  return result;
}

async function startTimer(node: TextNode, seconds: number,
  template: string, text: string) {
  await figma.loadFontAsync(node.fontName as FontName);

  var keepItRunning = true;
  var secondsToGo = seconds;
  var newText = "";

  // this loop updates all timers every second
  while (keepItRunning) {
    if (secondsToGo > 0) {
      newText = fillUpTimeStringWithTemplate(secondsToInterval(secondsToGo), template);
    } else {
      newText = "Done"
    }
    node.characters = text + newText;
    secondsToGo -= 1;
    await delay(1000);
  }
}

function secondsToInterval(seconds: number): string {
  var result = "";
  var secondsToGo = seconds;
  secondsSet.forEach((element) => {
    var count = Math.floor(secondsToGo / element);
    if (count > 0 || result.length > 0) {
      secondsToGo -= count * element;
      if (result.length > 0) {
        result += ":";
        if (count < 10) {
          result += "0";
        }
      }
      result += String(count);
    }
  })
  return result;
}

function fillUpTimeStringWithTemplate(timeString: string, template: string): string {
  const trimmedTemplate = template.substring(0, template.length - timeString.length)
  return trimmedTemplate + timeString;
}

export {
  start,
  getRemainingSeconds,
  getTemplateFromString,
  startTimer,
  secondsToInterval,
  fillUpTimeStringWithTemplate
}
