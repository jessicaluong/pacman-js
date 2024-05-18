# Pac-Man

This project is a remake of the classic Pac-Man game. It utilizes JavaScript with graphical outputs handled through HTML5 Canvas.

## How to Play

To start the game, visit [Pac-Man Game](https://jessicaluong.github.io/pacman-js/).

Control Pac-Man using the arrow keys. Dodge the ghosts while collecting all the pellets on the map. The game concludes when all pellets are collected or Pac-Man loses all three lives.

## Ghost Modes

The ghosts switch between three behavioral modes: chase, random, and frighten. The gameplay alternates between 7 seconds of random mode and 3 seconds of chase mode.

### Random

During random mode, ghosts move unpredictably around the maze.

![random](https://github.com/jessicaluong/pacman-js/assets/96930184/47596b79-473e-4fe6-9747-f0357b0449fc)

### Chase

In chase mode, the ghosts use the A\* search algorithm to find the shortest path to Pac-Man.

![chase](https://github.com/jessicaluong/pacman-js/assets/96930184/f6f1fdc1-ee72-48b7-8d96-d11ef853e91e)

### Frighten

After Pac-Man consumes a power pellet, ghosts enter frighten mode. In this mode, Pac-Man can eat the ghosts without losing a life.

![frighten](https://github.com/jessicaluong/pacman-js/assets/96930184/4f2966d6-3fd0-44be-aa1e-b95b9ce85efe)

## Game Over

The game ends either when Pac-Man collects all pellets or loses all lives. A game over screen appears with an option to restart the game.

<img width="443" alt="gameover" src="https://github.com/jessicaluong/pacman-js/assets/96930184/26abbea4-d88e-456e-bec5-436707e8ed45">

## Optimizations

To optimize performance, the walls — which are static elements — are drawn on a background canvas that is rendered only once.

## Testing

Unit tests are implemented using the Jest framework to ensure the reliability of the game mechanics. The Jest coverage report is as follows:

<img width="956" alt="jest_coverage" src="https://github.com/jessicaluong/pacman-js/assets/96930184/29a12419-ff72-4250-9005-6c6471bce796">

## Credits

The Pac-Man movement logic in this project was adapted from the following repository: [Pac-Man JS by Servet Gulnaroglu](https://github.com/servetgulnaroglu/pacman-js)
