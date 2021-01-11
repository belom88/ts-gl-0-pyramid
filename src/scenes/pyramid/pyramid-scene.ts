import { GlMatrix } from '../../core/gl-matrix';
import { initShaderProgram } from '../../core/gl-shader';
import { ProgramInfo } from '../../types/program-info';

export class PyramidScene {
  private vsSource: string = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;
  private fsSource: string = `
  varying lowp vec4 vColor;
    void main(void) {
      gl_FragColor = vColor;
    }
  `;
  private positions: number[] = [
    0.5, -0.25, 0.25, // 1
    0.0, 0.25, 0.00, // 2
    -0.5, -0.25, 0.25, // 3

    -0.5, -0.25, 0.25, // 3
    0.0, 0.25, 0.00, // 2
    0.0, -0.25, -0.50, // 4

    0.0, -0.25, -0.50, // 4
    0.0, 0.25, 0.00, // 2
    0.5, -0.25, 0.25, // 1

    0.0, -0.25, -0.50, // 4
    0.5, -0.25, 0.25,  // 1
    -0.5, -0.25, 0.25 // 3
  ];
  private colors: number[] = [
    0.3, 0.0, 0.3, 1.0,    // purple
    0.3, 0.0, 0.3, 1.0,    // purple
    0.3, 0.0, 0.3, 1.0,    // purple
    1.0, 0.0, 0.0, 1.0,    // red
    1.0, 0.0, 0.0, 1.0,    // red
    1.0, 0.0, 0.0, 1.0,    // red
    0.0, 0.5, 0.0, 1.0,    // green
    0.0, 0.5, 0.0, 1.0,    // green
    0.0, 0.5, 0.0, 1.0,    // green
    0.0, 0.0, 1.0, 1.0,    // blue
    0.0, 0.0, 1.0, 1.0,    // blue
    0.0, 0.0, 1.0, 1.0    // blue
  ]

  private programInfo: ProgramInfo | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;

  constructor(public gl: WebGLRenderingContext) {
    const program = initShaderProgram(gl, this.vsSource, this.fsSource);
    if (!program) {
      return;
    }
    this.programInfo = {
      program,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(program, 'aVertexColor'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
      }
    }
    this.initBuffers();
  }

  private initBuffers() {
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);

    this.colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);
  }

  public drawScene(angleX: number = 0, angleY: number = 0, angleZ: number = 0) {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);                 // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    if (!this.programInfo) {
      throw Error('Shaders haven\'t been compiled correctly');
    }

    const fieldOfView = 45;
    const aspect = this.gl.canvas.width / this.gl.canvas.height;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = new GlMatrix().perspective(fieldOfView, aspect, zNear, zFar);
    const modelViewMatrix = new GlMatrix()
      .rotate(angleX, 1, 0, 0)
      .rotate(angleY, 0, 1, 0)
      .rotate(angleZ, 0, 0, 1)
      .translate(-0.0, -0.0, -2.0);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
      this.gl.vertexAttribPointer(
        this.programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      this.gl.enableVertexAttribArray(
        this.programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
      const numComponents = 4;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
      this.gl.vertexAttribPointer(
        this.programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      this.gl.enableVertexAttribArray(
        this.programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL to use our program when drawing

    this.gl.useProgram(this.programInfo.program);

    // Set the shader uniforms

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix.m);
    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix.m);

    {
      const offset = 0;
      const vertexCount = 12;
      this.gl.drawArrays(this.gl.TRIANGLES, offset, vertexCount);
    }
  }

}