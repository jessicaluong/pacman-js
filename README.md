# Pac-Man

This project is a remake of the classic Pac-Man game.

## How to Play

To start the game, visit [Pac-Man Game](https://jessicaluong.github.io/pacman-js/).

Control Pac-Man using the arrow keys. Dodge the ghosts while collecting all the pellets on the map. The game ends when all pellets are collected or Pac-Man loses all three lives.

## Technologies Used

### Front End

![Front end technologies used](https://skillicons.dev/icons?i=js)

The front end is developed using JavaScript, with graphical outputs handled through HTML5 Canvas. All front-end files are located at the root of the repository for easy deployment to GitHub Pages.

### Back End

![Back end technologies used](https://skillicons.dev/icons?i=nodejs,express,mongodb)

The back end uses Node.js and Express, with MongoDB serving as the database to manage a persistent leaderboard. This setup ensures that player scores are stored and retrieved efficiently.

## Features

### Ghost Modes

The ghosts switch between three behavioral modes: chase, random, and frighten. The gameplay alternates between 7 seconds of random mode and 3 seconds of chase mode.

#### Random

During random mode, ghosts move unpredictably around the maze.

<img alt="random_mode" src="https://github.com/jessicaluong/pacman-js/assets/96930184/47596b79-473e-4fe6-9747-f0357b0449fc" width="696">

#### Chase

In chase mode, the ghosts use the A\* search algorithm to find the shortest path to Pac-Man.

<img alt="chase_mode" src="https://github.com/jessicaluong/pacman-js/assets/96930184/f6f1fdc1-ee72-48b7-8d96-d11ef853e91e" width="696">

#### Frighten

After Pac-Man consumes a power pellet, ghosts enter frighten mode for a total of 10 seconds. They start blinking in the last 2 seconds of this mode. During frighten mode, Pac-Man can eat the ghosts without losing a life.

<img alt="frighten_mode" src="https://github.com/jessicaluong/pacman-js/assets/96930184/4f2966d6-3fd0-44be-aa1e-b95b9ce85efe" width="696">

### Leaderboard

Players achieving a score within the top 10, provided their score exceeds zero, are given the opportunity to enter their initials on the leaderboard:

<insert image>

Following this, the leaderboard will display their score among the top entries:

<insert image>

### Game Over

Players whose scores do not rank within the top 10 will encounter a Game Over screen. In the event of server response delays, the following screen will be displayed:

<insert image>

Otherwise, a standard Game Over screen will appear, offering players the options to restart the game or view the leaderboard:

<insert image>

<img width="696" alt="gameover3" src="https://github.com/jessicaluong/pacman-js/assets/96930184/0e0ba8e2-7ddf-454c-931f-83b5e50147ba">

## Optimizations

To optimize performance, the walls — which are static elements — are drawn on a background canvas that is rendered only once.

## Testing

### Running Tests

Unit tests have only been written for the front end. They are implemented using the Jest framework and can be run by following these steps:

1. Clone the repository:

   ```
   git clone https://github.com/jessicaluong/pacman-js.git
   ```

2. Install the required dependencies:

   ```
   cd pacman-js
   npm install
   ```

3. Execute the tests:
   ```
   npx jest
   ```

### Coverage

The Jest coverage report shows over 96% coverage in branches and functions, and over 99% in statements and lines:

<img width="956" alt="jest_coverage" src="https://github.com/jessicaluong/pacman-js/assets/96930184/294581ac-0031-4607-94e8-ef44ef1a46ad">

## Credits

The Pac-Man movement logic in this project was adapted from the following repository: [Pac-Man JS by Servet Gulnaroglu](https://github.com/servetgulnaroglu/pacman-js).  
The library used for A\* pathfinding is from [PathFinding.js](https://github.com/qiao/PathFinding.js/).
