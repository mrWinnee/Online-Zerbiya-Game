const socket = io();

const screen = {
    width: window.innerWidth,
    height: window.innerHeight,
}

let config;

if (screen.width / screen.height > 1){
    config = {
        width: 1280,
        height: 720,
        backgroundColor: 0x000000,
        scale: {
            mode: Phaser.Scale.FIT,  // Fit the game within the screen without stretching
            autoCenter: Phaser.Scale.CENTER_BOTH  // Center the game canvas in the browser
        },
        scene: [Scene1, Scene2, Scene3]
    }
}else{
    config = {
        width: 720,
        height: 1280,
        backgroundColor: 0x000000,
        scale: {
            mode: Phaser.Scale.FIT,  // Fit the game within the screen without stretching
            autoCenter: Phaser.Scale.CENTER_BOTH  // Center the game canvas in the browser
        },
        scene: [Scene1, Scene2, Scene3]
    }
}



const game = new Phaser.Game(config);

