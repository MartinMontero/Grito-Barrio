// Generate branded PNG app icons (no external deps). Red background + white
// circle + red "!" → an emergency/alert glyph. Produces standard + maskable.
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buf){let c=~0;for(let i=0;i<buf.length;i++){c^=buf[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return ~c>>>0;}
function chunk(type,data){const t=Buffer.from(type,'ascii');const len=Buffer.alloc(4);len.writeUInt32BE(data.length,0);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data])),0);return Buffer.concat([len,t,data,crc]);}

function png(size, opts){
  const {maskable=false} = opts||{};
  const cx=size/2, cy=size/2;
  // background red #dc2626
  const bg=[0xdc,0x26,0x26], white=[0xff,0xff,0xff];
  const circleR = (maskable?0.34:0.40)*size;
  const stemHalf = 0.045*size;
  const stemTop = cy-0.20*size, stemBot = cy+0.06*size;
  const dotCy = cy+0.155*size, dotR=0.055*size;
  // raw image: each row prefixed with filter byte 0
  const stride = size*3;
  const raw = Buffer.alloc((stride+1)*size);
  for(let y=0;y<size;y++){
    raw[y*(stride+1)]=0;
    for(let x=0;x<size;x++){
      const dx=x-cx, dy=y-cy;
      const inCircle = (dx*dx+dy*dy) <= circleR*circleR;
      let col = bg;
      if(inCircle){
        col = white;
        // red "!" glyph carved out of the white circle
        const inStem = (x>=cx-stemHalf && x<=cx+stemHalf && y>=stemTop && y<=stemBot);
        const ddx=x-cx, ddy=y-dotCy;
        const inDot = (ddx*ddx+ddy*ddy)<=dotR*dotR;
        if(inStem||inDot) col = bg;
      }
      const off=y*(stride+1)+1+x*3;
      raw[off]=col[0]; raw[off+1]=col[1]; raw[off+2]=col[2];
    }
  }
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(size,0); ihdr.writeUInt32BE(size,4);
  ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0; // 8-bit RGB
  const idat=zlib.deflateSync(raw,{level:9});
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR',ihdr),
    chunk('IDAT',idat),
    chunk('IEND',Buffer.alloc(0)),
  ]);
}

const pub=path.join(__dirname,'..','public');
fs.writeFileSync(path.join(pub,'pwa-192x192.png'), png(192,{}));
fs.writeFileSync(path.join(pub,'pwa-512x512.png'), png(512,{}));
fs.writeFileSync(path.join(pub,'maskable-512x512.png'), png(512,{maskable:true}));
fs.writeFileSync(path.join(pub,'apple-touch-icon.png'), png(180,{}));
fs.writeFileSync(path.join(pub,'favicon-32x32.png'), png(32,{}));
console.log('icons generated');
