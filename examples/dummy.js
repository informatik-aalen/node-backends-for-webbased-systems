const { createCanvas, loadImage } = require('/tmp/node_modules/canvas/')
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')

// Write "Awesome!"
ctx.font = '30px Impact'
ctx.rotate(0.1)
ctx.fillText('Awesome!', 50, 100)

const buf = canvas.toBuffer()
console.log(String(buf))
