import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

function createPNG(width, height, isMaskable = false) {
  // RGBA buffer: width * 4 per row + 1 filter byte per row
  const rowBytes = width * 4 + 1
  const rawData = Buffer.alloc(rowBytes * height)

  const plum = [0x5B, 0x21, 0x4C, 0xFF]
  const darkPlum = [0x3D, 0x12, 0x32, 0xFF]
  const red = [0xE5, 0x39, 0x45, 0xFF]
  const white = [0xFF, 0xFF, 0xFF, 0xFF]

  const cx = width / 2
  const cy = height / 2
  const rOuter = (width / 2) * (isMaskable ? 0.95 : 0.85)

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes
    rawData[rowOffset] = 0 // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Base background gradient
      const gradT = (x + y) / (width + height)
      let r = Math.round(plum[0] * (1 - gradT) + darkPlum[0] * gradT)
      let g = Math.round(plum[1] * (1 - gradT) + darkPlum[1] * gradT)
      let b = Math.round(plum[2] * (1 - gradT) + darkPlum[2] * gradT)
      let a = 0xFF

      // Shield boundary
      const normY = (y - (cy - height * 0.28)) / (height * 0.56)
      const normX = Math.abs(x - cx) / (width * 0.28)
      
      if (normY >= 0 && normY <= 1) {
        let shieldEdge = 1.0
        if (normY > 0.3) {
          // taper down to point
          shieldEdge = 1.0 - (normY - 0.3) * 1.4
        }
        if (normX <= shieldEdge && shieldEdge > 0) {
          // Inside shield
          r = white[0]
          g = white[1]
          b = white[2]

          // Inner emblem: emergency red heart/cross
          const heartDx = (x - cx) / (width * 0.16)
          const heartDy = (y - (cy - height * 0.05)) / (height * 0.16)
          const heartDist = Math.sqrt(heartDx * heartDx + heartDy * heartDy)
          if (heartDist < 0.65 || (Math.abs(x - cx) < width * 0.04 && Math.abs(y - cy) < height * 0.14) || (Math.abs(y - cy) < height * 0.04 && Math.abs(x - cx) < width * 0.14)) {
            r = red[0]
            g = red[1]
            b = red[2]
          }
        }
      }

      // Decorative outer circle ring
      if (Math.abs(dist - rOuter) < 2) {
        r = 0xFF
        g = 0xFF
        b = 0xFF
      }

      rawData[pxOffset] = r
      rawData[pxOffset + 1] = g
      rawData[pxOffset + 2] = b
      rawData[pxOffset + 3] = a
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData)

  // PNG structure
  function makeChunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const typeBuf = Buffer.from(type, 'ascii')
    const typeAndData = Buffer.concat([typeBuf, data])
    
    // CRC32 calculation
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(typeAndData), 0)

    return Buffer.concat([len, typeBuf, data, crc])
  }

  // CRC32 implementation
  function crc32(buf) {
    let c = 0xFFFFFFFF
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i]
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (0xEDB88320 & -(c & 1))
      }
    }
    return (c ^ 0xFFFFFFFF) >>> 0
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  return Buffer.concat([
    header,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ])
}

const iconsDir = path.resolve('public/icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), createPNG(192, 192, false))
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), createPNG(512, 512, false))
fs.writeFileSync(path.join(iconsDir, 'icon-512x512-maskable.png'), createPNG(512, 512, true))

// Also write favicon.ico and apple-touch-icon.png
fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), createPNG(180, 180, false))
fs.writeFileSync(path.resolve('public/favicon.ico'), createPNG(64, 64, false))

console.log('Successfully generated all PWA icons & favicons!')
