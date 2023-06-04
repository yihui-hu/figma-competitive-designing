# Todo List

## Design & UI/UX

- [x] About modal
- [x] Styled error messages
- [x] Select number of players via clicking player headshots
- [x] Clear board notification using figma.notify()
- [x] Make window size constant
- [x] Hide / show templates based on player count
- [x] Message for successfully resetting board
- [x] Link to Are.na competitive design repo in info modal
- [x] Update modal design
- [x] Design favicon
- [x] Light and dark mode 
- [ ] Figma community file
- [ ] Design Play & Archive pages default state

## Functionality

- [x] Error handling for empty & private channels
- [x] Show timer while playing
- [x] Sync timing with appearance / disappearance of images & canvas
- [x] Handle pagination with Are.na API
- [x] Implement 5 second timer before game starts
- [x] Coordinate timing for starting + memorization + play time
- [x] Implement clientStorage to save user settings
    - [x] Better coordinate storage syncing with UI
- [x] Attach node creation to template layers
- [x] Store page count in clientStorage to reduce fetch requests
- [x] Reset board (with option to preserve layout)
- [x] Create Archived Rounds auto-layout if not present while archiving
- [x] if file is empty / playing for first time, automatically reset board + create archive?
- [x] delay appearance of canvas until after the screenshot disappears 
- [x] Center template number labels using auto layout
- [ ] Reset settings to default in modal (then do we need to preserve layout?)
- [ ] Cache image links / page number / index (better for no repeats)

## Bugs

- [x] Fix grouping issue when plugin is open in another page other than Play
- [ ] Test + handle behaviour when templates are missing

## Features

- [x] Ability to specify custom Are.na channel
- [x] Specify amount of time for each phase of the game
- [x] Specify number of players
- [x] Clear board (user directed / when new round begins)
- [x] Automatically archive rounds to new page
- [x] Templates adapt to light / dark mode

## Documentation / Code

- [x] Webpack bundling
- [x] Tags in GitHub repo
- [x] Document clientStorage
- [ ] Complete README
- [ ] Remove console.logs
- [ ] Reduce / remove magic numbers
- [ ] Clean up CSS
    - [ ] Minify CSS
    - [ ] Consolidate CSS in css/styles.css
- [ ] Modularize code with webpack
- [ ] Standardize variable names

##  To check / think about:

- [ ] Test custom fonts in Figma (IBM Plex Mono, etc.)
- [x] Finalize (default) timings for memorization and play time
- [x] Have player names in templates (for archival purposes)