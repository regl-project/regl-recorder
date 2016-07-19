var createReglRecorder = require('../index')
const normals = require('angle-normals')
const mat4 = require('gl-mat4')
const bunny = require('bunny')

const VIDEO_WIDTH = 3840 * 0.1
const VIDEO_HEIGHT = 2160 * 0.1

const regl = require('regl')(require('gl')(VIDEO_WIDTH, VIDEO_HEIGHT))
var recorder = createReglRecorder(regl, 150)

const drawBunny = regl({
  vert: `
  precision mediump float;

  attribute vec3 position;
  attribute vec3 normal;

  varying vec3 vNormal;

  uniform mat4 view, projection;

  void main() {
    vNormal = normal;
    gl_Position = projection * view * vec4(position, 1);
  }`,

  frag: `
  precision mediump float;

  varying vec3 vNormal;

  void main() {
    vec3 color = vec3(0.6, 0.0, 0.0);
    vec3 lightDir = vec3(0.39, 0.87, 0.29);
    vec3 ambient = 0.3 * color;
    vec3 diffuse = 0.7 * color * clamp( dot(vNormal, lightDir), 0.0, 1.0 );
    gl_FragColor = vec4(ambient + diffuse, 1.0);
  }`,

  attributes: {
    position: bunny.positions,
    normal: normals(bunny.cells, bunny.positions)
  },

  elements: bunny.cells,

  uniforms: {
    view: ({tick}) => {
      const t = 0.01 * (tick + 100)
      return mat4.lookAt([],
                         [30 * Math.cos(t), 10.5, 30 * Math.sin(t)],
                         [0, 2.5, 0],
                         [0, 1, 0])
    },
    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective([],
                       Math.PI / 4,
                       viewportWidth / viewportHeight,
                       0.01,
                       1000)
  }
})

regl.frame(({viewportWidth, viewportHeight}) => {
  regl.clear({
    depth: 1,
    color: [0, 0, 0, 1]
  })
  drawBunny()

  recorder.frame(viewportWidth, viewportHeight)
})
