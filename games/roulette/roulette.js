let rotate = 0;
let destination = 0;
let speed = 0;
let rotato;
let num = -1;
let color = "None";
let section = 360/38;

const red = [9, 30, 7, 32, 5, 34, 3, 36, 1, 27, 25, 12, 19, 18, 21, 16, 23, 14];
const black = [28, 26, 11, 20, 17, 22, 15, 24, 13, 10, 29, 8, 31, 6, 33, 4, 35, 2];
const numInOrder = [18,31,19,8,12,29,25,10,27,'00',1,13,36,24,3,15,34,22,5,17,32,20,7,11,30,26,9,28,0,2,14,35,23,4,16,33,21,6];


var roulette = {
 
    boot() {
    },
    
    debug() {
    document.getElementById("wheel").style.transform = "rotate(" + 2*(360/38) + "deg)";
    },

    color(val) {

        switch(val) {

            case "b":
                color = "Black";
                break;
            case "r":
                color = "Red";
                break;
            case "g":
                color = "Green";
                break;

        }
        console.log(color);

    },

    start() {
        destinationVal = this.selectVal();
        destination = 1800 + ((destinationVal*section)+(section/2));
        distance = 1;
        speed = 1;
        rotato = setInterval(this.rotateWheel, .5);
    },

    selectVal() {
        const j = Math.floor(Math.random() * 38);
        return j;
    },

    rotateWheel() {
        let mod = (destination-distance);

        console.log("Speed: " + speed + "\nDistance: " + distance + "\nDestination: " + destination + " or " + (destination%360) + " or " + (destinationVal));
        console.log(mod)

        if (distance <= destination) {
            document.getElementById("wheel").style.transform = "rotate(" + distance + "deg)";
        }else{
            console.log("Stop");
            clearInterval(rotato);
            if (color != 'None') {
                roulette.winColor();
            }else{
                roulette.winNumber();
            }
        }
        distance += 4;


    },

    winColor() {

        switch (color) {
            case 'Black':
                if ((destinationVal-1)%2 == 0 && destinationVal != numInOrder[9]) {
                    console.log("Win! 1.2x");
                }else{
                    console.log("Loss!");
                }
                break;
            case 'Red':
                if ((destinationVal)%2 == 0 && destinationVal != numInOrder[28]) {
                    console.log("Win! 1.2x");
                }else{
                    console.log("Loss!");
                }
                break;
            case 'Green':
                if (destinationVal == numInOrder[9] || destinationVal == numInOrder[28]) {
                    console.log("Win! 2x");
                }else{
                    console.log("Loss!");
                }
                break;
            default:
                console.log("Error");
                
        }
    },

    winNumber() {

        if (num == destinationVal) {
            console.log("You Win! 4x");
        }else{
            console.log("You Lose! 4x");
        }

    }

}