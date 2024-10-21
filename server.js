const express = require('express')
const app = express()
const server = require('http').createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)
const { v4: uuidv4 } = require('uuid')

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html')
})


let rooms = {
    /*uuid: {
        yweugfyuwef: {
            squaresOwned: 0,
            color: 
        },
        
    }*/
};

let roomsPogress = {
    //uuid : {
        //totalSides : Number,
        //turn : 'Red' || 'Blue,
        //squares : {
            //sqaureName : 2,
            //...
        //}  
        //sidesPicked: Number}
};

function findRoomFromSocket(socketOfPlayer){
    let socketRooms = [];
    for( const room of socketOfPlayer.rooms.values()){
        socketRooms.push(room);
    }
    //return roomsPogress[socketRooms[1]];
    return socketRooms[1];
}

function getUser(socketOfPlayer, index){
    const specifiedRoom = findRoomFromSocket(socketOfPlayer);
    const users = Object.keys(rooms[specifiedRoom]);
    return users[index];
    
}

function getSquaresFromSide(sideName){
    const unformatedCorrespendantSquares = sideName.split('|');
    let formatedCorrespendantSquares = [];
        for(let i = 0; i < unformatedCorrespendantSquares.length; i++){
            const squareName = unformatedCorrespendantSquares[i].substring(0, unformatedCorrespendantSquares[i].length - 2);
            formatedCorrespendantSquares.push(squareName);
        }
        return formatedCorrespendantSquares; 
}

function getCoordinatesFromSquareName(squareName){
    const x = squareName.slice(1, 2);
    const y = squareName.slice(3, 4);
    return {x, y};
}

function getClientsInRoom(room) {
    const roomInfo = io.sockets.adapter.rooms.get(room);
    return roomInfo ? Array.from(roomInfo) : [];
}



io.on('connection', (socket) => {
    console.log('we have a connection !');


    socket.on('createParty', ()=>{
        const idHex = uuidv4().replace(/-/g, '').slice(0, 6);
        const roomId = idHex;
        
        if (!rooms[roomId]) {
            rooms[roomId] = {};
        }
        rooms[roomId][socket.id] = {
            squaresOwned: 0,
            color: 'Red'
        }

        socket.join(roomId);

        socket.emit('roomId', roomId);
    })

    socket.on('checkRoomId', (enteredRoomId)=>{
        const roomsKeys = Object.keys(rooms);
        let playersInRoom;
        
        let isValidId = false;
        roomsKeys.map((roomKey)=>{
            if (roomKey == enteredRoomId){
                playersInRoom = Object.keys(rooms[roomKey]);
                if(playersInRoom.length <= 1){
                    rooms[roomKey][socket.id] = {
                        squaresOwned: 0,
                        color: 'Blue'
                    }
                    isValidId = true;
                }
            }
        })

        if(isValidId){
            socket.join(enteredRoomId);
            roomsPogress[enteredRoomId] = {};
            roomsPogress[enteredRoomId]['squares'] = {};
            io.to(enteredRoomId).emit('validId');
        }else{
            socket.emit('invalidId');
        }
    })

    socket.on('sendSquares', (squares)=>{
        const specifiedRoom = findRoomFromSocket(socket);
        roomsPogress[specifiedRoom]['squares'] = squares;
        //console.log( specifiedRoom.squares);
        roomsPogress[specifiedRoom]['sidesPicked'] = 0;
        roomsPogress[specifiedRoom]['turn'] = 'Red';
    })

    socket.on('gameSize', (gameSize)=>{
        const specifiedRoom = findRoomFromSocket(socket);
        roomsPogress[specifiedRoom]['totalSides'] = ((gameSize - 1)/2) * ((gameSize - 1)/2) * 4;
    })

    socket.on('sideClicked', ({sideName, x, y})=>{
        const specifiedRoom = findRoomFromSocket(socket);
        roomsPogress[specifiedRoom]['sidesPicked']++;
        //console.log(specifiedRoom);
        const turn = roomsPogress[specifiedRoom].turn;
        
        io.to(specifiedRoom).emit('sideClickedVerified', {sideName, x, y, turn});

        const squares = getSquaresFromSide(sideName);

        squares.map((square)=>{
            const squareCoordinates = getCoordinatesFromSquareName(square);
            roomsPogress[specifiedRoom]['squares'][square]++;
            if(roomsPogress[specifiedRoom]['squares'][square] == 4){
                rooms[specifiedRoom][socket.id].squaresOwned++;
                io.to(specifiedRoom).emit('confirmedSquare', {turn, x: squareCoordinates.x, y: squareCoordinates.y});
                
                // update score of player

                const score = {
                    redPlayer : rooms[specifiedRoom][getUser(socket, 0)].squaresOwned,
                    bluePlayer : rooms[specifiedRoom][getUser(socket, 1)].squaresOwned,
                    nextTurn : turn  == 'Red' ? 'Blue' : 'Red'
                }
                io.to(specifiedRoom).emit('updateScore', score);
            }
        })


        // check if the game ended and return the winner
        if(roomsPogress[specifiedRoom].totalSides == roomsPogress[specifiedRoom].sidesPicked){
            const clients = getClientsInRoom(specifiedRoom);
            // works only for 2 players
            if(rooms[specifiedRoom][clients[0]].squaresOwned > rooms[specifiedRoom][clients[1]].squaresOwned){
                setTimeout(()=>{
                    io.to(clients[0]).emit('youWin');
                    io.to(clients[1]).emit('youLose');
                }, 1000 
                )
            }else{
                setTimeout(()=>{
                    io.to(clients[1]).emit('youWin');
                    io.to(clients[0]).emit('youLose');
                }, 1000 
                )
            }
            
            
        }

        
        roomsPogress[specifiedRoom].turn = turn  == 'Red' ? 'Blue' : 'Red';

        socket.to(specifiedRoom).emit('yourTurn');
    })


    socket.on('turn', ()=>{
        io.to(getUser(socket, 0)).emit('yourTurn');
    })

    socket.on('leaveCurrentRoom', ()=>{
        const specifiedRoom = findRoomFromSocket(socket);
        socket.leave(specifiedRoom);
    })

    socket.on('disconnecting', ()=>{
        
        const specifiedRoom = findRoomFromSocket(socket);
        delete rooms[specifiedRoom];
        delete roomsPogress[specifiedRoom];
        socket.to(specifiedRoom).emit('matchupDisconnection');
    })
    


})


server.listen(port, ()=>{
    console.log('listening on port '+ port)
})
