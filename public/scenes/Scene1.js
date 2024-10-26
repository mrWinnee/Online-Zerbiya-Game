class Scene1 extends Phaser.Scene {
    constructor(){
        super('bootGame');
    }

    preload(){

        
        //this.load.image('woodTile', "./assets/wood-tile.png");
        this.load.image('woodTile', "./assets/squareTile.png");
        this.load.image('hEdge', "./assets/hEdge.png");
        this.load.image('vEdge', "./assets/vEdge.png");
        
        this.load.image('cPB', "./assets/createPartyBtn.png");
        this.load.image('jPB', "./assets/joinPartyBtn.png");

        this.load.spritesheet('hbg', "./assets/hbg.png",{
            frameWidth: 1280,
            frameHeight: 720
        });

        this.load.spritesheet('vbg', "./assets/vbg.png",{
            frameWidth: 720,
            frameHeight: 1280
        });

        this.load.spritesheet('hSideHolder', "./assets/hSideHolder.png", {
            frameWidth: 64,
            frameHeight: 12
        });
        this.load.spritesheet('vSideHolder', "./assets/vSideHolder.png", {
            frameWidth: 12,
            frameHeight: 64
        });

        this.load.image('hRedSide', "./assets/hRedSide.png");
        this.load.image('vRedSide', "./assets/vRedSide.png");
        this.load.image('hBlueSide', "./assets/hBlueSide.png");
        this.load.image('vBlueSide', "./assets/vBlueSide.png");

        this.load.image('redPiece', "./assets/redPiece.png");
        this.load.image('bluePiece', "./assets/bluePiece.png");

        this.load.spritesheet('redTurnArea', "./assets/redTurnArea.png",{
            frameWidth : 300,
            frameHeight : 100
        });
        this.load.spritesheet('blueTurnArea', "./assets/blueTurnArea.png",{
            frameWidth : 300,
            frameHeight : 100
        });
    }

    create(){
        
        this.add.text(20, 20, "Loading game...");
        this.scene.start('createGame');
    }
}