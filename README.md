# I love hue 2
![Logo](images/logo.png)

## I love hue, but multiplayer!
Have you wanted to test your gradient-swapping skills against your friends?
Now you can! With I love hue 2 with realtime multiplayer capabilities.
Based on the original game [I love hue](http://zutgames.com/i-love-hue.php) by [Zut games](http://zutgames.com/)

The goal of this game is to solve a gradient where the colors have been swapped. Turn the board into an unadulterated 
rainbow of colors.

### Prerequisites
* NodeJS
* Git

### Clone
run 
```
git clone https://github.com/daftfox/i-love-hue-2.git

cd i-love-hue-2
git checkout develop
git pull origin develop
```
in a terminal window.
Give it a minute to complete. This game contains soundfiles that take a little while to download.

### Run
Windows: 
```
npm run start_stack_windows
```

Mac: **untested!**
```
npm run start_stack_mac
```
Two terminals should pop up setting up and starting both the client and server app. Have a cup of coffee while this
takes place. Both apps should be up and running whithin ten minutes.

### Starting a game
If you want to run a game using the default server, no custom server url has to be supplied.
It will automatically connect to `ws://timothy.fyi:8999`

When supplying your own server url, be sure to use the `ws://` (websocket) prefix.

## Sketches
![Poster](images/poster.png)
![Sketch start screen](images/sketch_start-screen.png)
![Sketch multiplayer screen](images/sketch_multiplayer.png)
![Sketch multiplayer game win](images/sketch_multiplayer-win.png)
