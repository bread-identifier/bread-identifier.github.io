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
    img: ''
  },
  ready: {
    text: 'drop bread here',
    img: ''
  }
};

// Put any asynchronous data loading in preload to complete before "setup" is run
function preload() {
  loadJSON('./breadURLs.json', function(results) {
    breadURLs = results; 
    display.loading.img = loadImage(breadURLs[Math.floor(Math.random()*breadURLs.length)].url);
    display.training.img = loadImage(breadURLs[Math.floor(Math.random()*breadURLs.length)].url);
    display.ready.img = loadImage(breadURLs[Math.floor(Math.random()*breadURLs.length)].url);
  });
  // Extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  // Create a new classifier using those features and give the video we want to use
  classifier = featureExtractor.classification();
}

function setup() {
  // create canvas
  var c = createCanvas(600, 600);
  background(100);
  // Add an event for when a file is dropped onto the canvas
  c.drop(gotFile);
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
  text(display[loadState].text, width/2, height/2);
  if (loadState == 'loading') {
    //draw a loading bar
    stroke("white");
    noFill();
    strokeWeight(1);
    rect(200, 320, 200, 15);

    noStroke();
    fill("lightblue");
    let percent = map(trainingCounter, 0, 1760, 0, 1);
    rect(202, 322, 190 * percent, 12);
  } else if (loadState == 'training') {

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
      console.log('Loss is', lossValue)
      loadState = 'ready';
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
          console.log("adding bread");
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

function gotFile(file) {
  // If it's an image file
  if (file.type === 'image') {
    // Create an image DOM element but don't show it
    var classImg = new Image(224, 224);
    classImg.onload = () => {
      classifier.classify(domImg, (err, results) => {
        label = results;
        console.log(results);
        background(0);
        image(img, 0, 0, width, height);

        noStroke();
        fill("red")
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
  video = createCapture(VIDEO);
  video.size(320, 240);
  snapButton = createButton('identify');
  snapButton.mousePressed(takeSnap);
}

function takeSnap() {
  var p5Img = video.get();
  console.log(p5Img);
}
