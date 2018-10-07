var video;
var videoButton;
var snapButton;
var breadImage;
var c;
var label = "";

let mobilenet;
let classifer;
let sourceImage;
let img;
let promisesArray = [];

let totalBreadImages = 1600;
let seenCounter = 0;

let loadState = 1;

let modelTrained = false;

let breadTypes = [{
    urlName: 'baguette',
    labelName: 'Baguette'
  },
  {
    urlName: 'challah\ bread',
    labelName: 'Challah Bread'
  },
  {
    urlName: 'croissant',
    labelName: 'Croissant'
  },
  {
    urlName: 'loaf\ of\ bread',
    labelName: 'Loaf of Bread'
  },
  {
    urlName: 'mantou',
    labelName: 'Mantou'
  },
  {
    urlName: 'muffin',
    labelName: 'Muffin'
  },
  {
    urlName: 'naan\ bread',
    labelName: 'Naan Bread'
  },
  {
    urlName: 'plain\ bagel',
    labelName: 'Bagel',
  },
  {
    urlName: 'pretzel',
    labelName: 'Pretzel'
  },
  {
    urlName: 'southern\ biscuit',
    labelName: 'Southern Biscuit'
  },
  {
    urlName: 'toast',
    labelName: 'Toast'
  }
];



function setup() {
  c = createCanvas(600, 600);
  sourceImage = ("bp.jpg");
  mobilenet = ml5.featureExtractor("MobileNet", modelReady);
  img = loadImage("./downloads/muffin/2.jpg");



  videoButton = createButton('video');
  videoButton.mousePressed(streamVideo);


  console.log(classifier);


}

function draw() {
  background(0);

  noStroke();
  fill("white")
  textSize(14);
  textAlign(CENTER, CENTER);

  if (loadState == 1) {
    text("LOOKING AT PICTURES OF BREAD", 300, 300);

    //draw a loading bar
    stroke("white");
    noFill();
    strokeWeight(1);
    rect(200, 320, 200, 15);

    noStroke();
    fill("lightblue");
    let percent = map(seenCounter, 0, 1760, 0, 1);
    rect(202, 322, 190 * percent, 12);

  } else if (loadState == 2) {
    text("THINKING ABOUT THOSE PICTURES OF BREAD I SAW", 300, 300);
  } else if (loadState == 3) {
    text("SHOW ME WHAT YOU THINK IS BREAD", 300, 300);

    c.drop(gotFile);
    fill(255);
    noStroke();
    textSize(24);
    textAlign(CENTER);
    text('Drag an image file onto the canvas.', width / 2, height / 4);
    noLoop();
  }



}

function modelReady() {
  console.log('model ready');
  classifier = mobilenet.classification();
  trainOnBread();
}


function loadAndAddImage(url, labelName) {
  return new Promise(function (resolve, reject) {

    var img = new Image(224, 224);
    img.onload = () => {
      classifier.addImage(img, labelName, () => {
        // console.log("done");
        seenCounter++;
        resolve(url)
      });
      // this might need to be moved
    }
    img.onerror = () => reject(url);

    img.src = url;

  })
}


function trainOnBread() {

  breadTypes.forEach(bread => {

    for (let i = 1; i <= 160; i++) {
      let URL = './downloads/' + bread.urlName + '/' + i + ".jpg";

      try {
        let urlTest = loadImage(URL);
        promisesArray.push(loadAndAddImage(URL, bread.labelName));
      } catch (err) {
        console.log("no find file");
      }

    }

  });

  console.log('loop done');
  Promise.all(promisesArray).then(() => {
    console.log("PROMISES DONE")
    loadState = 2;
    classifier.train(whileTraining);
  });
}

function whileTraining(loss) {
  if (loss == null) {
    console.log('training complete');
    loadState = 3;

    classifyImage("bp.jpg")

  } else {
    console.log(loss);
  }
}


function classifyImage(url, labelName) {
  return new Promise(function (resolve, reject) {

    var img = new Image(224, 224);
    img.onload = () => {
      classifier.classify(img, (err, results) => {
        console.log(results);
        resolve(url)
      });
      // this might need to be moved
    }
    img.onerror = () => reject(url);

    img.src = url;
  })
}


/////////////////


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


    // Set the data as the bread image to identify
    // breadImage = file.data;


  } else {
    println('Not an image file!');
  }
}

function streamVideo() {
  video = createCapture(VIDEO);
  video.size(320, 240);
  snapButton = createButton('identify');
  snapButton.mousePressed(takeSnap);
}

function takeSnap() {
  var p5Img = video.get();
  console.log(p5Img);
}