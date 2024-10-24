class Scene1 extends Phaser.Scene {
    constructor(){
        super('bootGame');
    }

    preload(){

        
        this.load.image('woodTile', "./assets/wood-tile.png");
        this.load.image('hEdge', "./assets/hEdge.png");
        this.load.image('vEdge', "./assets/vEdge.png");
        
        this.load.image('cPB', "./assets/createPartyBtn.png");
        this.load.image('jPB', "./assets/joinPartyBtn.png");

        this.load.spritesheet('bg', "./assets/bgSprite.png",{
            frameWidth: 500,
            frameHeight: 900
        });

        this.load.spritesheet('hSide', "./assets/hSide.png", {
            frameWidth: 48,
            frameHeight: 8
        });
        this.load.spritesheet('vSide', "./assets/vSide.png", {
            frameWidth: 8,
            frameHeight: 48
        });

        this.load.image('hRedSide', "./assets/hRedSide.png");
        this.load.image('vRedSide', "./assets/vRedSide.png");
        this.load.image('hBlueSide', "./assets/hBlueSide.png");
        this.load.image('vBlueSide', "./assets/vBlueSide.png");

        this.load.image('redPiece', "./assets/redPiece.png");
        this.load.image('bluePiece', "./assets/bluePiece.png");
    }

    create(){

        
        this.anims.create({
            key: 'shiftToBlue',
            frames: this.anims.generateFrameNumbers('bg', { start: 0, end: 4 }),
            frameRate: 15,
            repeat: 0
        });

        this.anims.create({
            key: 'shiftToRed',
            frames: this.anims.generateFrameNumbers('bg', { start: 4, end: 8 }),
            frameRate: 15,
            repeat: 0
        });


        this.anims.create({
            key: 'playableHSide',
            frames: this.anims.generateFrameNumbers('hSide'),
            frameRate: 2,
            repeat: -1
        });
        this.anims.create({
            key: 'playableVSide',
            frames: this.anims.generateFrameNumbers('vSide'),
            frameRate: 2,
            repeat: -1
        });
        
        this.add.text(20, 20, "Loading game...");
        this.scene.start('createGame');
    }
}