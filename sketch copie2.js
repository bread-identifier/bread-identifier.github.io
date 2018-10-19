var c;
var video;
var videoButton;
var snapButton;
var breadImage;
var breadURLs;
var label = "";
var loadState = 'loading';
var displayText = '';
var displayImg;
var trainingCounter = 0;

let featureExtractor;
let classifer;


const display = {
  loading: {
    text: 'loading...',
    img: ''
  },
  training: {
    text: 'thinking about bread...',
    img: '/data/baguette/5.jpg'
  },
  ready: {
    text: 'drop bread here',
    img: '/data/baguette/5.jpg'
  }
};

// Put any asynchronous data loading in preload to complete before "setup" is run
function preload() {
  if(loadState=="loading"){
    loadJSON('./breadURLs.json', function(results) {
      breadURLs = results; 
      display.loading.img = loadImage("/data/baguette/5.jpg");
      display.training.img = loadImage("/data/baguette/5.jpg");
      display.ready.img = loadImage("/data/baguette/5.jpg");
    });
    // Extract the already learned features from MobileNet
    featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
    // Create a new classifier using those features and give the video we want to use
    classifier = featureExtractor.classification();
  } else {
    display.loading.img = loadImage("/data/baguette/5.jpg");
    display.training.img = loadImage("/data/baguette/5.jpg");
    display.ready.img = loadImage("/data/baguette/5.jpg");
  }
  
}

function setup() {
  
  // create canvas
  c = createCanvas(600, 400);
  background(100);
  // Add an event for when a file is dropped onto the canvas
  //c.drop(gotFile);
  videoButton = createButton('video');
  videoButton.mousePressed(streamVideo); 
}

function draw() {
  fill("red")
  noStroke();
  //var stateImg = loadImg(display[loadState.img]);
  textSize(24);
  textAlign(CENTER, CENTER);
  // Displays the image at its actual size at point (0,0)
  image(display[loadState].img, 0, 0);
  
  if (loadState == 'loading') {
    text(display[loadState].text, width/2, height/2);
    //draw a loading bar
    stroke("white");
    noFill();
    strokeWeight(1);
    rect(200, 248, 200, 15);
    noStroke();
    fill("lightblue");
    let percent = map(trainingCounter, 0, 176, 0, 1);
    rect(202, 250, 190 * percent, 12);
  } else if (loadState == 'training') {
    text(display[loadState].text, width/2, height/2);
  } else if (loadState == 'ready') {
    c.drop(gotFile);
    fill(255);
    noStroke();
    textSize(24);
    textAlign(CENTER);
    noLoop();
  }
}

function modelReady() {
  console.log('model ready');
  console.log(classifier);
  let breadPromises = breadURLs.map(function(bread) {
    return trainOnBread(bread);
  });
  Promise.all(breadPromises).then((val) => {
    console.log("At the end of promises");
    console.log(val);
    loadState = 'training';
    // Retrain the network
    classifier.train(function(lossValue) {
      console.log('Loss is', lossValue);
      if(lossValue==null){
        loadState = 'ready';
      }
    });
  });
}

function trainOnBread(bread) {
  const imgPromise = new Promise((resolve, reject) => {
    let img = new Image(224, 224);
    // When image is loaded, resolve the promise
    img.addEventListener('load', function imgOnLoad() {
      classifier.addImage(this, bread.name, () => {
          trainingCounter++;
          console.log("adding bread : "+trainingCounter);
          resolve("Success: " + this.src);
        });
    });

    // When there's an error during load, reject the promise
    img.addEventListener('error', function imgOnError() {
        console.log("oh no");
        resolve("Error occured: " + this.src);
    });

    img.src = bread.url;
  });

  return imgPromise;
} 
var domImg;
function gotFile(file) {
  // If it's an image file
  if (file.type === 'image') {
    // Create an image DOM element but don't show it
    var classImg = new Image(224, 224);
    
    classImg.onload = () => {
      domImg = this;
      classifier.classify(domImg, (err, results) => {
        label = results;
        console.log(results);
        background(0);
        image(domImg, 0, 0, width, height);
        noStroke();
        fill("red");
        textSize(28);
        textAlign(CENTER, CENTER);
        text(label, 300, 300);
      });
    }    

    classImg.src = file.data;
    // Draw the image onto the canvas

  } else {
    println('Not an image file!');
  }
}



function streamVideo () {
  if(!video){

    video = createCapture(VIDEO);
    video.size(600, 400);
    video.hide();
    snapButton = createButton('identify');
    snapButton.mousePressed(takeSnap);
  }
}

function takeSnap() {
  tint(255, 255, 255);
  var p5Img = video.get();
  image(p5Img, 10, 10, 580, 380);
  //console.log(p5Img);
}
