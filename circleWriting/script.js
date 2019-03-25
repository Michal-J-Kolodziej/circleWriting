const div = document.querySelector('.canvases');
const canvasText = document.createElement('canvas');
canvasText.width = window.innerWidth;
canvasText.height = window.innerHeight;
canvasText.classList.add('canvasText');
let text = 'm i c h a l'.toUpperCase();
let textSize = 150;

div.appendChild(canvasText);

const cText = canvasText.getContext('2d');

cText.font = `normal ${textSize}px sans-serif`;
cText.textAlign = 'center';
cText.textBaseline = 'middle';
cText.fillText(text, canvasText.width / 2, canvasText.height / 2 );

const canvasCircles = document.createElement('canvas');
canvasCircles.width = window.innerWidth;
canvasCircles.height = window.innerHeight;
canvasCircles.classList.add('canvasCircles');

div.appendChild(canvasCircles);

const cCirc = canvasCircles.getContext('2d');

class Circle {
    constructor(x, y, color, id){
        this.x = x;
        this.y = y;
        this.r = 1;
        this.color = color;
        this.id = id;
        this.draw();
        this.canUpdate = true;
        this.velX = 0;
        this.velY = 0;
    }

    draw() {
        cCirc.beginPath();
        cCirc.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        cCirc.fillStyle = this.color;
        cCirc.fill();
        
    }

    moveCircle() {
        this.x += this.velX;
        this.y += this.velY;
        if(this.velX !== 0){
            this.velX += -(this.velX * 0.03);
            if(this.velX <= 1 && this.velX >= -1) this.velX = 0;
        }
        if(this.velY !== 0){
            this.velY += -(this.velY * 0.03);
            if(this.velY <= 1 && this.velY >= -1) this.velY = 0;
        }
    }

    update() {
        if(!this.canUpdate) return;
        this.r += 0.2;
        
    }

    static checkIfHaveSpace(circ, circlesList){
        let haveSpace = true;
        circlesList.forEach( circle => {
            if(circ.id === circle.id) return;
            if(Circle.isInteract(circ, circle)) haveSpace = false;
        });

        return haveSpace;
    }

    static isInteract = (point, dot, rOffset = 2) => {
        const distanceBetweenCirclesOrigin = Math.sqrt((point.x-dot.x) ** 2 + (point.y - dot.y) ** 2);
        if(point.r === undefined){
            if(distanceBetweenCirclesOrigin  < dot.r + rOffset) return true;
            else return false;
        }
        
        else if(point.r !== undefined){
            if(distanceBetweenCirclesOrigin < dot.r + point.r) return true;
            else return false;
        }
    }
}

const pixels = cText.getImageData(0, 0, canvasText.width, canvasText.height);
let textPixels = [];
const chunkArray = (myArray, chunk_size) =>{
    const arrayLength = myArray.length;
    let tempArray = [];

    
    for (let index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        tempArray.push(myChunk);

    }
    let x = 0;
    let y = 0;

    let tempArray2 = tempArray.map( (pixel, index) => {
        if(x === canvasText.width){
            x = 0;
            y++;
        }
        let tab = [pixel[0], pixel[1], pixel[2], pixel[3], index, {x: x, y: y}]

        x++;
        return tab;
    });

    return tempArray2;
}
textPixels = chunkArray(pixels.data, 4);
textPixels = textPixels.filter( pixel => {
    if(pixel[3] === 255) return true;
    else return false;
});
let pixelsToDraw = textPixels.map(pixel => {
    return pixel[5];
});

let circlesArray = [];

const addCircle = () => {

    const getRandomCoordinates = () => {
        let randomIndex = Math.floor(Math.random() * pixelsToDraw.length);

        return pixelsToDraw[randomIndex];
    }

    const point = getRandomCoordinates();

    if(cText.getImageData(point.x, point.y, 1, 1).data[3] === 255){
        if(circlesArray.length === 0) circlesArray.push(new Circle(point.x, point.y, '#ffa357', circlesArray.length));
        else if(Circle.checkIfHaveSpace(point, circlesArray)) circlesArray.push(new Circle(point.x, point.y, '#ffa357', circlesArray.length));
    }
}

const addCirclesInterval = setInterval( addCircle, 0.0001);
setTimeout(() => {
    clearInterval(addCirclesInterval);
}, 10000);


// window.addEventListener('click', (e) => {
//     console.log(cText.getImageData(e.x, e.y, 5, 5));
// });

const moveCircles = (e) => {
    const mouseCoords = {
        x: e.clientX,
        y: e.clientY
    }

    circlesArray.forEach( circle => {
        if(Circle.isInteract(mouseCoords, circle, 15)){
            let velX = 20;
            let velY = 20;
            if(mouseCoords.x > circle.x) velX = -velX;
            if(mouseCoords.y > circle.y) velY = -velY;

            circle.velX = velX;
            circle.velY = velY;
        }
    });
}

window.addEventListener('mousemove', (e) => moveCircles(e));

const animate = () => {
    cCirc.clearRect(0, 0, canvasCircles.width, canvasCircles.height);

    if(circlesArray.length){
        circlesArray.forEach( circle => {
            if(!Circle.checkIfHaveSpace(circle, circlesArray)) circle.canUpdate = false;
            circle.update();
            circle.moveCircle();
            circle.draw();
        })
    }
    window.requestAnimationFrame(animate);
}

animate();