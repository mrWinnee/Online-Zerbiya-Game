class Scene2 extends Phaser.Scene {
    constructor(){
        super('createGame');
    }


    create(){
        const cPB = this.add.image(0, -50, 'cPB').setInteractive();
        const jPB = this.add.image(0, 50,'jPB').setInteractive();

        // Create a container and add both objects to it
        const container = this.add.container(0, 0, [cPB, jPB]);

        // Center the container on the screen
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        container.setPosition(centerX, centerY);

        
        
        socket.on('roomId', (roomId)=>{
            window.alert( 'Press OK to copy your room id : ' + roomId);
            navigator.clipboard.writeText(roomId);
            
        })

        this.input.on('gameobjectdown', this.createParty, this);


        socket.on('invalidId', ()=>{
            window.alert('the room Id you entered is invalid');
        })
        socket.on('validId', ()=>{
            this.scene.start('playGame');
        })
    }



    createParty(pointer, gameObject){
        if(gameObject.texture.key === 'cPB'){
            gameObject.disableInteractive();
            socket.emit('createParty');
        }
        if(gameObject.texture.key === 'jPB'){
            const prompt1 = window.prompt('enter a valid room id');
            socket.emit('checkRoomId', prompt1);
        }
    }
}