var video;
var videoButton;
var snapButton;
var breadImage;
var breadURLs;

let featureExtractor;
let classifer;

// Put any asynchronous data loading in preload to complete before "setup" is run
function preload() {
  loadJSON('./breadURLs.json', function(results) {
    breadURLs = results; 
  });
  // Extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  // Create a new classifier using those features and give the video we want to use
  classifier = featureExtractor.classification();
}

function modelReady() {
  console.log('model ready');
  console.log(classifier);
  breadURLs.forEach(function(bread) {
    try {
      let img = new Image(224, 224);
      img.src = bread.url;
      img.onload = () => {
        classifier.addImage(img, bread.label, () => {
          console.log("added img");
        });
      }
    } catch (err) {
      console.log(err);
    }
  })
}

function setup() {
  // create canvas
  var c = createCanvas(710, 400);
  background(100);
  // Add an event for when a file is dropped onto the canvas
  c.drop(gotFile);
  videoButton = createButton('video');
  videoButton.mousePressed(streamVideo);
  let breadPromises = [];
  
}

function draw() {
  fill(255);
  noStroke();
  textSize(24);
  textAlign(CENTER);
  text('Drag an image file onto the canvas.', width/2, height/2);
  noLoop();
}

function gotFile(file) {
  // If it's an image file
  if (file.type === 'image') {
    // Create an image DOM element but don't show it
    var img = createImg(file.data).hide();
    // Draw the image onto the canvas
    image(img, 0, 0, width, height);
    // Set the data as the bread image to identify
    breadImage = file.data;
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
