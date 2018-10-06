let mobilenet;
let classifer;
let sourceImage;
let img;

function setup() {
  createCanvas(600, 600);
  sourceImage = ("bp.jpg");
  mobilenet = ml5.featureExtractor("MobileNet", modelReady);
  img = loadImage("./downloads/muffin/2.jpg");



  console.log(classifer);




}

function draw() {
  background(0);


  image(img, 0, 0, 255, 255);

}

function modelReady() {
  console.log('model ready');
  classifer = mobilenet.classification();
  trainOnBread();
}

function trainOnBread() {
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


  // for (let i = 1; i <= 200; i++) {

  // 	try {
  // 		let img = new Image(224, 224);
  // 		img.src = "./downloads/muffin/" + i + ".jpg";

  // 		// console.log(img);
  // 		classifer.addImage(img, "muffin");

  // 	} catch (err) {
  // 		console.log(err);
  // 	}

  // }




  breadTypes.forEach(bread => {

    for (let i = 1; i <= 100; i++) {
      let URL = './downloads/' + bread.urlName + '/' + i + ".jpg";

      console.log("about to load and add image")

      try {
        let img = new Image(224, 224);
        img.src = URL;
        console.log(img);
        console.log("image added");

        img.onload = () => {
          classifer.addImage(img, bread.labelName, () => {
            console.log("classifier")
          });
        }


      } catch (err) {
        // console.log(err);
      }

    }

  });

}