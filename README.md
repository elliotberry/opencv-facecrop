# OpenCv - Face Crop : Autodetect & crop faces out of an image (Node.js)

<!-- ![CI](https://github.com/arghyadeep-k/vanes/workflows/CI/badge.svg?branch=master)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=arghyadeep-k_opencv-facecrop&metric=alert_status)](https://sonarcloud.io/dashboard?id=arghyadeep-k_opencv-facecrop) -->

![npm](https://img.shields.io/npm/v/opencv-facecrop)
![npm bundle size](https://img.shields.io/bundlephobia/min/opencv-facecrop)
![Libraries.io SourceRank](https://img.shields.io/librariesio/sourcerank/npm/opencv-facecrop)
![Depfu](https://img.shields.io/depfu/arghyadeep-k/opencv-facecrop)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/opencv-facecrop)
![npm](https://img.shields.io/npm/dt/opencv-facecrop)
![NPM](https://img.shields.io/npm/l/opencv-facecrop?color=blue)


This package helps you to auto-detect faces in a picture and crop them out.

## Installation

[![NPM](https://nodei.co/npm/opencv-facecrop.png)](https://nodei.co/npm/opencv-facecrop/)

**Install from command line:**

`npm install --save opencv-facecrop`



## Basic Usage
```javascript
const facecrop = require('opencv-facecrop');

facecrop('./image-file.jpg', {name: 'output.jpg', type: "image/jpeg", quality: 0.95 })

//Outputs image named output.jpg with only face cropped out in root folder
```

## API
**vanes(input_filename, {name: String, type: String, quality: float})**

- **input_filename**: input String containing file name with relative/absolute filepath

- **name**: Requires a string value which will contains the output file name.

- **type**: Requires String value which will tell the format of the output image.

- **quality**: Requires a float value between 0 to 1 which stands for the quality index of the output file compares to the input file. Set 1 for no reduction in quality.

Multiple key-value pairs can be sent separated by comma.

<!-- ## Defaults -->



## License

OpenCv - Face Crop is published under the Unlicense. For more information, see the accompanying LICENSE file. 

<br>

---

<br>

P.S. - This is a pre-release version. More updates with refinements coming soon.
