#!/usr/bin/env node
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import facecrop from './index.js';

await yargs(hideBin(process.argv))
  .scriptName('opencv-facecrop')
  .usage('$0 <input> [options]', 'Detect faces in an image and crop them out', yargs => yargs
    .positional('input', {
      describe: 'Path to the input image',
      type: 'string',
    })
    .option('output', {
      alias: 'o',
      describe: 'Output file name. If several faces are found, -1, -2, ... is added to each name',
      type: 'string',
      default: 'output.jpg',
    })
    .option('type', {
      alias: 't',
      describe: 'Output image format',
      choices: ['image/jpeg', 'image/png'],
      default: 'image/jpeg',
    })
    .option('quality', {
      alias: 'q',
      describe: 'JPEG quality from 0 to 1 (1 = no reduction in quality)',
      type: 'number',
      default: 0.95,
    })
    .option('factor', {
      alias: 'f',
      describe: 'Scaling factor for the crop around each face (1 = tight crop, 1.5 = 50% more around it)',
      type: 'number',
      default: 1,
    })
    .option('classifier', {
      alias: 'c',
      describe: 'Path to a Haar cascade classifier XML file (defaults to the bundled frontal face classifier)',
      type: 'string',
    })
    .check(argv => {
      if (!(argv.quality >= 0 && argv.quality <= 1)) throw new Error('--quality must be a number between 0 and 1');
      if (!(argv.factor > 0)) throw new Error('--factor must be greater than 0');
      return true;
    })
    .example('$0 photo.jpg', 'Crop faces from photo.jpg into output.jpg')
    .example('$0 photo.jpg -o faces/face.png -t image/png -f 1.5', 'Write PNGs with 50% extra margin'),
    async argv => {
      try {
        // An undefined classifier falls through to the module's default
        await facecrop(argv.input, argv.output, argv.type, argv.quality, argv.factor, argv.classifier);
      } catch (err) {
        console.error(err?.message ?? String(err));
        process.exitCode = 1;
      }
    })
  .strict()
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .parseAsync();
