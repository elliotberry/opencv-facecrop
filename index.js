import {createCanvas, loadImage} from 'canvas';
import {writeFileSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// Bundled classifier, resolved relative to this file so it works wherever the package is installed.
const DEFAULT_TRAINING_SET = fileURLToPath(new URL('./resources/haarcascade_frontalface_default.xml', import.meta.url));

export default async (file, name = 'output.jpg', type = 'image/jpeg', quality = 0.95, factor = 1, trainingSet = DEFAULT_TRAINING_SET) => {
  let image, src, gray, faces, faceCascade;

    if (factor <= 0) throw new Error('Error: Scaling Factor passed is too low, should be greater than 0.');

    const {cv} = await loadOpenCV().catch(e => {
      throw new Error('Error: Loading OpenCV failed.\n' + e.message);
    });
    console.log("Loading file...");
    image = await loadImage(file).catch(e => {
      throw new Error('Error: Loading input image failed.\n' + e.message);
    });
    // Draw the image onto a canvas to read its RGBA pixels, then hand them to OpenCV.
    const inputContext = createCanvas(image.width, image.height).getContext('2d');
    inputContext.drawImage(image, 0, 0);
    src = cv.matFromImageData(inputContext.getImageData(0, 0, image.width, image.height));
    gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    faces = new cv.RectVector();
    faceCascade = new cv.CascadeClassifier();

    console.log("Loading pre-trained classifier files...");

    let classifierData;
    try {
      classifierData = readFileSync(trainingSet);
    } catch (err) {
      throw new Error('Error: Pre-Trained Classifier file failed to load.\n' + err.message);
    }

    // OpenCV reads from its own in-memory filesystem, not the host's, so copy the classifier in
    // rather than passing the host path, which may be absolute or outside the cwd.
    const virtualClassifierName = 'facecrop-classifier.xml';
    let classifierLoaded;
    try {
      cv.FS_unlink('/' + virtualClassifierName);
    } catch {
      // nothing left over from a previous run
    }
    cv.FS_createDataFile('/', virtualClassifierName, new Uint8Array(classifierData), true, false, false);
    try {
      classifierLoaded = faceCascade.load('/' + virtualClassifierName);
    } catch {
      // OpenCV throws a raw C++ exception pointer (not an Error) when the file is not a cascade.
      classifierLoaded = false;
    } finally {
      cv.FS_unlink('/' + virtualClassifierName);
    }
    if (!classifierLoaded) throw new Error('Error: Pre-Trained Classifier file failed to load.\nNot a valid cascade classifier: ' + trainingSet);

    console.log('Processing...');
    let mSize = new cv.Size(0, 0);
    await faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, mSize, mSize);

    let point1, point2;

    for (let i = 0; i < faces.size(); ++i) {
      //   if( i < (faces.size() -1 ) ){
      //     continue;
      //     //only use last image
      //   }
      point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
      point2 = new cv.Point(faces.get(i).x + faces.get(i).width, faces.get(i).y + faces.get(i).height);

      let offset = Math.floor(faces.get(i).width * (factor - 1)); //get offset pixels from factor, width=height

      //console.log([point1,point2]);
      console.log("offset set to"+offset);

      if (point1.x < offset) {
        offset = point1.x;
        console.log("offset adjusted to "+offset);
      }

      if (point1.y < offset) {
        offset = point1.y;
        console.log("offset adjusted to "+offset);
      }

      if (image.height < point2.y + offset) {
        offset = image.height - point2.y;
        console.log("offset2 adjusted to "+offset);
      }

      if (image.width < point2.x + offset) {
        offset = image.width - point2.x;
        console.log("offset2 adjusted to "+offset);
      }

      point1.x = point1.x - offset;
      point1.y = point1.y - offset;

      point2.x = point2.x + offset;
      point2.y = point2.y + offset;

      //console.log([point1,point2]);

      const width = point2.x - point1.x;
      const height = point2.y - point1.y;
      const canvas = createCanvas(width, height);

      console.log('Rendering output image...');
      // Crop by copying the face rectangle of the source image onto the output canvas.
      canvas.getContext('2d').drawImage(image, point1.x, point1.y, width, height, 0, 0, width, height);

      let outputFilename = name.toString();

      if (faces.size() > 1) {
        let name = outputFilename.replace(/\.[^/.]+$/, '');
        outputFilename = outputFilename.replace(name, name + `-${i + 1}`);
      }

      writeFileSync(outputFilename, canvas.toBuffer(type, {quality: quality}));
      //console.log(outputFilename + ' created successfully.');
    }
    
};

let openCV;

/**
 * Loads opencv.js (once) and resolves with `{cv}` when it is ready to use.
 *
 * opencv4js initialises itself on import and needs no DOM, so there is nothing to emulate.
 * It is imported lazily so that importing this module (e.g. for `--help`) stays fast.
 *
 * The result is wrapped in an object on purpose: `cv` is a thenable (it has a `then` method that
 * calls back with `cv` itself), so resolving a promise with `cv` directly would never settle.
 *
 * @returns {Promise<{cv: object}>}
 */
function loadOpenCV() {
  openCV ??= import('opencv4js').then(({default: cv}) => new Promise(resolve => {
    cv.then(() => resolve({cv}));
  }));
  return openCV;
}
