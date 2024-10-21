const socket = io();


const config = {
    width: 48 * 9 + 8,
    height: (48 * 9 + 8) + 48 * 3,
    backgroundColor: 0x000000,
    scene: [Scene1, Scene2, Scene3]
}

const game = new Phaser.Game(config);

