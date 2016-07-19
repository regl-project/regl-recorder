var jpeg = require('jpeg-js')
var fs = require('fs')
const crypto = require('crypto')

module.exports = function (regl, frames) {
  if (!regl) {
    throw new Error('regl-recorder: you must specify a regl context')
  }

  if (typeof frames !== 'number' || frames <= 0) {
    throw new Error('regl-recorder: `frames` must be a positive integer')
  }
  var frameCount = 0

  // output directory name is generated randomly
  var rand = crypto.randomBytes(10).toString('hex')
  var outputDir = 'video-' + rand

  // we want to record at 30FPS, so we skip every other frame
  // (since regl by default is 60FPS)
  var skipFrame = 0

  // create output directory.
  try {
    fs.mkdirSync(outputDir)
  } catch (e) {
    if (e.code !== 'EEXIST') throw e
  }

  function pad (number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number
  }

  function frame (viewportWidth, viewportHeight) {
    if (frameCount === frames) {
      console.log('Done! Output frames to directory ' + outputDir)
      process.exit(0)
    } else if (skipFrame === 0) {
      var pixelBuffer = new Buffer(regl.read())
      var rawImageData = {
        data: pixelBuffer,
        width: viewportWidth,
        height: viewportHeight
      }
      var jpegImageData = jpeg.encode(rawImageData, 100)

      const PAD = 8
      fs.writeFileSync(outputDir + '/frame' + pad(frameCount, PAD) + '.jpg', jpegImageData.data)
      console.log('frame: ', pad(frameCount, PAD) + '/' + pad(frames, PAD))

      frameCount++
    }
    skipFrame = (skipFrame + 1) % 2
  }

  return {
    frame: frame
  }
}
