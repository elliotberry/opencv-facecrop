import { Canvas, createCanvas, Image, ImageData, loadImage } from 'canvas';
import { JSDOM } from 'jsdom';
import { writeFileSync, existsSync, statSync } from 'fs';

export default async (file, name = 'output.jpg', type = 'image/jpeg', quality = 0.95, factor = 1, trainingSet = './node_modules/opencv-facecrop/resources/haarcascade_frontalface_default.xml') => {
  if (factor <= 0) throw new Error('Error: Scaling Factor should be greater than 0.');

  await loadOpenCV().catch(e => {
    throw new Error('Error: Loading OpenCV failed.\n' + e.message);
  });

  console.log("Loading file...");
  const image = await loadImage(file).catch(e => {
    throw new Error('Error: Loading input image failed.\n' + e.message);
  });

  const src = cv.imread(image);
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  const faces = new cv.RectVector();
  const faceCascade = new cv.CascadeClassifier();

  console.log("Loading pre-trained classifier files...");

  try {
    statSync(trainingSet);
  } catch (err) {
    throw new Error('Error: Pre-Trained Classifier file failed to load.\n' + err.message);
  }

  await faceCascade.load(trainingSet);
  console.log('Processing...');

  const mSize = new cv.Size(0, 0);
  await faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, mSize, mSize);

  for (let i = 0; i < faces.size(); ++i) {
    let point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
    let point2 = new cv.Point(faces.get(i).x + faces.get(i).width, faces.get(i).y + faces.get(i).height);
    let offset = Math.floor(faces.get(i).width * (factor - 1));

    offset = Math.min(offset, point1.x, point1.y, image.width - point2.x, image.height - point2.y);

    point1.x -= offset;
    point1.y -= offset;
    point2.x += offset;
    point2.y += offset;

    const canvas = createCanvas(point2.x - point1.x, point2.y - point1.y);
    const rect = new cv.Rect(point1.x, point1.y, point2.x - point1.x, point2.y - point1.y);

    console.log('Rendering output image...');
    const dst = src.roi(rect);
    cv.imshow(canvas, dst);

    let outputFilename = name.toString();
    if (faces.size() > 1) {
      const namePart = outputFilename.replace(/\.[^/.]+$/, '');
      outputFilename = outputFilename.replace(namePart, `${namePart}-${i + 1}`);
    }
    writeFileSync(outputFilename, canvas.toBuffer(type, { quality }));
  }
};

/**
 * Loads opencv.js.
 *
 * Installs HTML Canvas emulation to support `cv.imread()` and `cv.imshow`
 *
 * Mounts given local folder `localRootDir` in emscripten filesystem folder `rootDir`.
 * By default it will mount the local current directory in emscripten `/work` directory.
 * This means that `/work/foo.txt` will be resolved to the local file `./foo.txt`
 * @param {string} rootDir The directory in emscripten filesystem in which the local filesystem will be mount.
 * @param {string} localRootDir The local directory to mount in emscripten filesystem.
 * @returns {Promise} resolved when the library is ready to use.
 */
function loadOpenCV(rootDir = './work', localRootDir = process.cwd()) {
  if (global.Module && global.Module.onRuntimeInitialized && global.cv && global.cv.imread) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    installDOM();
    global.Module = {
      onRuntimeInitialized() {
        cv.FS.chdir(rootDir);
        resolve();
      },
      preRun() {
        const FS = global.Module.FS;
        if (!FS.analyzePath(rootDir).exists) {
          FS.mkdir(rootDir);
        }
        if (!existsSync(localRootDir)) {
          mkdirSync(localRootDir, { recursive: true });
        }
        FS.mount(FS.filesystems.NODEFS, { root: localRootDir }, rootDir);
      },
    };
    global.cv = require('opencv4js');
  });
}

function installDOM() {
  const dom = new JSDOM();
  global.document = dom.window.document;
  global.Image = Image;
  global.HTMLCanvasElement = Canvas;
  global.ImageData = ImageData;
  global.HTMLImageElement = Image;
}
