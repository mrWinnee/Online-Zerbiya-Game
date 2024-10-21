class Scene2 extends Phaser.Scene {
    constructor(){
        super('createGame');
    }


    create(){
        const cPB = this.add.image(10, 10, 'cPB').setOrigin(0).setInteractive();
        this.add.image(10, (cPB.height + 20) ,'jPB').setOrigin(0).setInteractive();
        
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