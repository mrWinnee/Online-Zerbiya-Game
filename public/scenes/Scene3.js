class Scene3 extends Phaser.Scene {
  constructor() {
    super("playGame");
    this.bg;
    this.gameSize = 9;
    this.squareTiles = {};
    this.playableSides;
  }

  create() {
    this.input.on("gameobjectup", this.countSide, this);

    ////////////////////////////////////////////////////
    /*                  the game                     */

    this.drawPattern(this.gameSize);

    const redPlayerScore = this.add.text(0, 0, `player : Red \n score : 0`);
    const bluePlayerScore = this.add.text(300, 0, `player : Blue \n socre : 0`);
    const turnIndicator = this.add.text(
      config.width / 2 - 48,
      config.height - 96,
      `Red Turn`
    );

    socket.on("updateScore", (score) => {
      redPlayerScore.setText(`player : Red \n score : ${score.redPlayer}`);
      bluePlayerScore.setText(`player : Blue \n score : ${score.bluePlayer}`);
      turnIndicator.setText(`${score.nextTurn} Turn`);
    });

    //send game squares and sides to the backend to prevent playing with them
    socket.emit("sendSquares", this.squareTiles);
    socket.emit("gameSize", this.gameSize);

    socket.on("checkForTurnServer", (data) => {
      //console.log(data.gameObject);
      //data.gameObject.disableInteractive();
      this.playableSides.map((playableSide) => {
        if (data.name == playableSide.name) {
          playableSide.disableInteractive();
        }
      });
      socket.emit("sideClicked", data);
    });

    //listening to the server response after pressing a side
    socket.on("sideClickedVerified", ({ sideName, x, y, turn }) => {
      if (sideName.includes("P1")) {
        // check if the side is horizontal or vertical
        //theObject.destroy();
        switch (turn) {
          case "Red":
            this.add.image(x, y, "hRedSide").setOrigin(0);
            this.bg.play('shiftToBlue');
            break;
          case "Blue":
            this.add.image(x, y, "hBlueSide").setOrigin(0);
            this.bg.play('shiftToRed');
            break;
        }
      } else {
        //theObject.destroy();
        switch (turn) {
          case "Red":
            this.add.image(x, y, "vRedSide").setOrigin(0);
            this.bg.play('shiftToBlue');
            break;
          case "Blue":
            this.add.image(x, y, "vBlueSide").setOrigin(0);
            this.bg.play('shiftToRed');
            break;
        }
      }


    });

    socket.on("confirmedSquare", ({ turn, x, y }) => {
      switch (turn) {
        case "Red":
          this.add.image(x * 48 + 4, y * 48 + 4, "redPiece").setOrigin(0);
          break;
        case "Blue":
          this.add.image(x * 48 + 4, y * 48 + 4, "bluePiece").setOrigin(0);
          break;
      }
    });

    socket.on("youWin", () => {
      window.alert("you won");
      this.scene.start("createGame");
    });
    socket.on("youLose", () => {
      window.alert("you lost");
      this.scene.start("createGame");
    });

    socket.on("matchupDisconnection", () => {
      socket.emit("leaveCurrentRoom");
      window.alert("the player against u has been disconnected!");
      this.scene.start("createGame");
    });
  }

  /*               squares pattern                    */
  gamePattern(size) {
    const array = [];

    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        // Condition to determine where the 1s and 0s should go
        const mid = Math.floor(size / 2);
        const value = Math.abs(i - mid) + Math.abs(j - mid) <= mid ? 1 : 0;
        row.push(value);
      }
      array.push(row);
    }

    return array;
  }

  /*              horizontal edges pattern                 */
  hEdgesPattern(size) {
    const array = [];
    const mid = Math.floor(size / 2); // Middle index of the grid

    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const distance = Math.abs(i - mid) + Math.abs(j - mid);

        // Place 1 only at the edges of the diamond
        const value = distance === mid ? 1 : 0;
        row.push(value);
      }
      array.push(row);

      // Duplicate the middle row when encountered
      if (i === mid) {
        array.push([...row]);
      }
    }
    return array;
  }

  /*                     verical edges pattern                       */
  vEdgesPattern(hEdgesPattern) {
    const size = hEdgesPattern.length;
    const rotated = Array.from({ length: size }, () => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        rotated[j][size - 1 - i] = hEdgesPattern[i][j]; // Rotate 90 degrees
      }
    }
    rotated.pop();
    return rotated;
  }

  hTilePattern(size) {
    const mid = Math.floor(size / 2); // Middle index
    const pattern = [];

    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const distance = Math.abs(i - mid) + Math.abs(j - mid);

        // Only place 1 inside the diamond, leave edges as 0
        const value = distance <= mid ? 1 : 0;
        row.push(value);
      }
      pattern.push(row);

      // Duplicate the middle row exactly once
      if (i === mid) {
        pattern.push([...row]);
      }
    }

    return pattern;
  }

  vTilePattern(size) {
    return this.vEdgesPattern(this.hTilePattern(size));
  }

  /*                     horizontal sides pattern                       */
  hSidePattern(size) {
    const matrix1 = this.hTilePattern(size);
    const matrix2 = this.hEdgesPattern(size);
    const rows = matrix1.length;
    const cols = matrix1[0].length;

    // Initialize the result matrix with the same dimensions
    const result = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Iterate through both matrices and apply the logic
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val1 = matrix1[i][j];
        const val2 = matrix2[i][j];

        // Apply the combination rule
        if (val1 === 1 && val2 === 1) {
          result[i][j] = 0;
        } else if (val1 === 0 && val2 === 0) {
          result[i][j] = 0;
        } else {
          result[i][j] = 1;
        }
      }
    }
    return result;
  }

  /*                     vertical sides pattern                       */
  vSidePattern(size) {
    const matrix1 = this.vTilePattern(size);
    const matrix2 = this.vEdgesPattern(this.hEdgesPattern(size));
    const rows = matrix1.length;
    const cols = matrix1[0].length;

    // Initialize the result matrix with the same dimensions
    const result = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Iterate through both matrices and apply the logic
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val1 = matrix1[i][j];
        const val2 = matrix2[i][j];

        // Apply the combination rule
        if (val1 === 1 && val2 === 1) {
          result[i][j] = 0;
        } else if (val1 === 0 && val2 === 0) {
          result[i][j] = 0;
        } else {
          result[i][j] = 1;
        }
      }
    }
    return result;
  }

  ////////////////////////////////////////////////////////
  /*                  drawing function                 */
  drawWoodTile(x, y) {
    this.add.image(x * 48 + 4, y * 48 + 4, "woodTile").setOrigin(0, 0);
  }
  drawHEdgeTile(x, y) {
    this.add.image(x * 48 + 4, y * 48, "hEdge").setOrigin(0);
  }
  drawVEdgeTile(x, y) {
    this.add.image(x * 48, y * 48 + 4, "vEdge").setOrigin(0);
  }
  drawHSideTile(x, y, name) {
    const hSideTile = this.add.sprite(x * 48 + 4, y * 48, "hSide", 1);
    hSideTile.setOrigin(0);
    //hSideTile.play('playableHSide');
    hSideTile.setInteractive();
    hSideTile.name = name;
  }
  drawVSideTile(x, y, name) {
    const vSideTile = this.add.sprite(x * 48, y * 48 + 4, "vSide", 1);
    vSideTile.setOrigin(0);
    //vSideTile.play('playableVSide');
    vSideTile.setInteractive();
    vSideTile.name = name;
  }

  ///////////////////////////////////////////////////////////
  /*                draw pre loaded game                  */
  drawPattern(size) {
    const gamePattern = this.gamePattern(size); // Generate the pattern
    const hEdgesPattern = this.hEdgesPattern(size); // Generate the pattern
    const vEdgesPattern = this.vEdgesPattern(hEdgesPattern); // Generate the pattern
    const hSidePattern = this.hSidePattern(size); // Generate the pattern
    const vSidePattern = this.vSidePattern(size); // Generate the pattern

    //draw game pattern
    for (let i = 0; i < gamePattern.length; i++) {
      for (let j = 0; j < gamePattern[i].length; j++) {
        if (gamePattern[i][j] === 1) {
          this.drawWoodTile(j, i); // Draw at (x, y) where the value is 1
          this.squareTiles["X" + j + "Y" + i] = 0;
        }
      }
    }

    //draw horizontal Edges pattern
    for (let i = 0; i < hEdgesPattern.length; i++) {
      for (let j = 0; j < hEdgesPattern[i].length; j++) {
        if (hEdgesPattern[i][j] === 1) {
          this.drawHEdgeTile(j, i); // Draw at (x, y) where the value is 1

          if (i <= Math.floor(size / 2)) {
            this.squareTiles["X" + j + "Y" + i]++;
          } else {
            this.squareTiles["X" + j + "Y" + (i - 1)]++;
          }
        }
      }
    }

    //draw vertical Edges pattern
    for (let i = 0; i < vEdgesPattern.length; i++) {
      for (let j = 0; j < vEdgesPattern[i].length; j++) {
        if (vEdgesPattern[i][j] === 1) {
          this.drawVEdgeTile(j, i); // Draw at (x, y) where the value is 1

          if (j <= Math.floor(size / 2)) {
            this.squareTiles["X" + j + "Y" + i]++;
          } else {
            this.squareTiles["X" + (j - 1) + "Y" + i]++;
          }
        }
      }
    }

    //draw horizonal Sides pattern
    for (let i = 0; i < hSidePattern.length; i++) {
      for (let j = 0; j < hSidePattern[i].length; j++) {
        if (hSidePattern[i][j] === 1) {
          const name =
            "X" + j + "Y" + (i - 1) + "P3" + "|" + "X" + j + "Y" + i + "P1";
          this.drawHSideTile(j, i, name); // Draw at (x, y) where the value is 1
        }
      }
    }

    //draw vertical Sides pattern
    for (let i = 0; i < vSidePattern.length; i++) {
      for (let j = 0; j < vSidePattern[i].length; j++) {
        if (vSidePattern[i][j] === 1) {
          const name =
            "X" + (j - 1) + "Y" + i + "P4" + "|" + "X" + j + "Y" + i + "P2";
          this.drawVSideTile(j, i, name); // Draw at (x, y) where the value is 1
        }
      }
    }

    this.bg = this.add.sprite(config.width/2, config.height/2, 'bg', 0).setDepth(-1);

    this.playableSides = this.children.list.filter(
      (obj) => obj instanceof Phaser.GameObjects.Sprite
    );
  }

  //////////////////////////////////////////////////////////
  /*               count side on click function          */
  countSide(pointer, gameObject, event) {
    event.stopPropagation();
    //gameObject.disableInteractive();
    //send to the server a click event to check if it's valid turn based on the turn of the player sent it
    const data = {
      sideName: gameObject.name,
      x: gameObject.x,
      y: gameObject.y,
    };
    socket.emit("checkForTurnClient", data);
    //console.log(data.gameObject);
  }

  update() {}
}
