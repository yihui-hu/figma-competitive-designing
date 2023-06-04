/**
 * This file contains the interfaces for clientStorage and arguments passed 
 * into the createTimer function in node.ts
 */

/**
 * Settings in storage
 * 
 * @param arena_url URL to Are.na channel
 * @param pages number of pages of Are.na channel
 * @param memo_time amount of time for memorization in seconds
 * @param memo_time_text amount of time for memorization in text format
 * @param playtime amount of time to replicate design in seconds
 * @param playtime_text amount of time to replicate design in text fomrat
 * @param preserve_layout toggle to preserve layout on reset
 * @param player_x_coords for preserving layout of templates on reset
 * 
 */
export interface clientStorage {
  arena_url: string,
  pages: number,
  memo_time: string,
  memo_time_text: string,
  playtime: string,
  playtime_text: string,
  players: number,
  preserve_layout: boolean,
  player_1_coords: { x: number, y: number },
  player_2_coords: { x: number, y: number },
  player_3_coords: { x: number, y: number },
  player_4_coords: { x: number, y: number },
  player_5_coords: { x: number, y: number },
}

/**
 * Arguments passed into createTimer
 * 
 * @param name name of Timer node
 * @param text prefix text e.g. "Time left: "
 * @param time time in string format e.g. "0:30"
 * @param position whether to display Timer on top of the left or right FrameNode
 * @param index to determine position of Timer based on num of players
 * 
 */
export interface TimerProps {
  name: string,
  text: string,
  time: string,
  position: string,
  index: number,
}