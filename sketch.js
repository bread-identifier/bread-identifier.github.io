var video;
var videoButton;
var snapButton;
var breadImage;
var breadURLs;
var label = "";

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

function modelReady() {
  console.log('model ready');
  console.log(classifier);
  let breadPromises = breadURLs.map(function(bread) {
    return trainOnBread(bread);
  });
  Promise.all(breadPromises).then((val) => {
    console.log("At the end of promises");
    console.log(val);
    // Retrain the network
    classifier.train(function(lossValue) {
      console.log('Loss is', lossValue)
    });
  });
}

function trainOnBread(bread) {
  const imgPromise = new Promise((resolve, reject) => {
    let img = new Image(224, 224);
    // When image is loaded, resolve the promise
    img.addEventListener('load', function imgOnLoad() {
      console.log(bread);
      classifier.addImage(this, bread.name, () => {
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

// function gotFile(file) {
//   // If it's an image file
//   if (file.type === 'image') {
//     // Create an image DOM element but don't show it
//     var img = createImg(file.data).hide();
//     // Draw the image onto the canvas
//     image(img, 0, 0, width, height);
//     // Set the data as the bread image to identify
//     breadImage = file.data;
//   } else {
//     println('Not an image file!');
//   }
// }

function gotFile(file) {
  // If it's an image file
  if (file.type === 'image') {
    // Create an image DOM element but don't show it
    var img = createImg(file.data).hide();
    var domImg = new Image(224, 224);
    domImg.onload = () => {
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

    domImg.src = file.data;

    // Draw the image onto the canvas

  } else {
    println('Not an image file!');
  }
}

// function classifyImage(url, labelName) {
//   return new Promise(function (resolve, reject) {

//     var img = new Image(224, 224);
//     img.onload = () => {
//       classifier.classify(img, (err, results) => {
//         console.log(results);
//         resolve(url)
//       });
//       // this might need to be moved
//     }
//     img.onerror = () => reject(url);

//     img.src = url;
//   })
// }


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
