# TRY.js (Beta) environment {DRAFT}

A click on the ```Environment``` menu item will open an editor with a property editor to change the current environment meta data. In this view ***you do not need to write code*** manually.  
Simply change properties in the property editor and you can see the results in realtime.
Press `Document / New` to create a new Google Drive document.  

### A simple JSON file declares a TRY.js environment


### Environment Objects

#### Robot
 - ...
 - position

#### Walls
 - geometry
 - position
 - movable

#### Flowers
 - position

#### Stations
 - type
  - energy: gives the robot the possibility to [charge](robot.MD#robotcharge) the battery
  - teleport: gives the robot the possibility to [teleport](robot.MD#robotteleport) to any location 
  - fuel: gives the robot the possibility to [refuel](robot.MD#robotrefuel) the jet pack
 - position