# Pac-Man

This project is a remake of the classic Pac-Man game. It utilizes JavaScript with graphical outputs handled through HTML5 Canvas.

## How to Play

To start the game, visit [Pac-Man Game](https://jessicaluong.github.io/pacman-js/).

Control Pac-Man using the arrow keys. Dodge the ghosts while collecting all the pellets on the map. The game concludes when all pellets are collected or Pac-Man loses all three lives.

## Ghost Modes

The ghosts switch between three behavioral modes: chase, random, and frighten. The gameplay alternates between 7 seconds of random mode and 3 seconds of chase mode.

### Random

During random mode, ghosts move unpredictably around the maze.

[insert gif]

### Chase

In chase mode, the ghosts use the A\* search algorithm to find the shortest path to Pac-Man.

[insert gif]

### Frighten

After Pac-Man consumes a power pellet, ghosts enter frighten mode. In this mode, Pac-Man can eat the ghosts without losing a life.

[insert gif]

## Game Over

The game ends either when Pac-Man collects all pellets or loses all lives. A game over screen appears with an option to restart the game.

[insert image]

## Optimizations

To optimize performance, the walls — which are static elements — are drawn on a background canvas that is rendered only once.

## Testing

Unit tests are implemented using the Jest framework to ensure the reliability of the game mechanics. The Jest coverage report is as follows:

[insert image]

## Credits

The Pac-Man movement logic in this project was adapted from the following repository: [Pac-Man JS by Servet Gulnaroglu](https://github.com/servetgulnaroglu/pacman-js)
