import { GlContext } from './core/gl-context';
import { initShaderProgram } from './core/gl-shader';
import { PyramidScene } from './scenes/pyramid/pyramid-scene';

const canvas: HTMLCanvasElement = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;
document.body.appendChild(canvas);

const angles = [0, 0, 0];
function rotateHandler(axis: number) {
  angles[axis] += 10;
  if (angles[axis] > 360) {
    angles[axis] = 0;
  }
  scene.drawScene(...angles);  
}


const btnX: HTMLButtonElement = document.createElement('button');
btnX.innerHTML = `Rotate X`;
btnX.addEventListener('click', () => {
  rotateHandler(0);
});
document.body.appendChild(btnX);

const btnY: HTMLButtonElement = document.createElement('button');
btnY.innerHTML = `Rotate Y`;
btnY.addEventListener('click', () => {
  rotateHandler(1);
});
document.body.appendChild(btnY);

const btnZ: HTMLButtonElement = document.createElement('button');
btnZ.innerHTML = `Rotate Z`;
btnZ.addEventListener('click', () => {
  rotateHandler(2);
});
document.body.appendChild(btnZ);

const glContext: GlContext = new GlContext('canvas');

if (glContext.gl === null) {
  throw new Error('Gl context hasn\'t been found');
}

const scene = new PyramidScene(glContext.gl);
scene.drawScene();
