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
    loadJSON('./breadSmallURLs.json', function(results) {
      breadURLs = results; 
      display.loading.img = loadImage("/data/baguette/5.jpg");
      display.training.img = loadImage("/data/baguette/5.jpg");
      display.ready.img = loadImage("/data/baguette/5.jpg");
    });
  } else {
    display.loading.img = loadImage("/data/baguette/5.jpg");
    display.training.img = loadImage("/data/baguette/5.jpg");
    display.ready.img = loadImage("/data/baguette/5.jpg");
  }  
}

function setup() {
  c = createCanvas(600, 400);
  background(100);
  video = createCapture(VIDEO);
  video.hide();
  background(0);
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  classifier = featureExtractor.classification(video, videoReady);
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
    image(video, 140, 80, 320, 240);
    fill(255);
    textSize(16);
    text(label, width/2, height/2);
  }
}

function videoReady() {
  console.log('Video is ready!!!');
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
    classifier.train(whileTraining);
  });
}

function trainOnBread(bread) {
  const imgPromise = new Promise((resolve, reject) => {
    let img = new Image(224, 224);
    // When image is loaded, resolve the promise
    img.addEventListener('load', function imgOnLoad() {
      classifier.addImage(this, bread.name, () => {
          trainingCounter++;
          //console.log("adding bread : "+trainingCounter);
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

function whileTraining(loss) {
  if (loss == null) {
    console.log('Training Complete');
    loadState = 'ready';
    classifier.classify(gotResults);
  } else {
    console.log(loss);
  }
}

function gotResults(error, result) {
  if (error) {
    console.error(error);
  } else {
    label = result;
    classifier.classify(gotResults);
  }
}
