// vim: sw=2 ts=2 expandtab smartindent ft=javascript
let Date_now;

function drawScene(gl, program_info, buf, { color, scale }) {
  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = mat4.create();

  {
    const x = Math.cos(Date_now*0.001) * 6;
    const y = Math.sin(Date_now*0.001) * 6;
    mat4.lookAt(
      modelViewMatrix,
      [   x, 4.0,    y],
      [-0.0, 0.0, -0.0],
      [ 0.0, 1.0,  0.0],
    );
  }

  mat4.scale(modelViewMatrix, modelViewMatrix, scale);

  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.gpu_vrt);

    /* location, number of components, type, normalize, stride, offset */
    gl.vertexAttribPointer(program_info.a_pos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program_info.a_pos);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.gpu_idx);
  gl.useProgram(program_info.program);

  gl.uniformMatrix4fv(program_info.u_proj, false, projectionMatrix);
  gl.uniformMatrix4fv(program_info.u_model, false, modelViewMatrix);
  gl.uniform3fv(program_info.u_fill, color);

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

(function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl");

  if (gl === null) {
    alert("Unable to initialize WebGL. Your "     +
          "browser or machine may not support it.");
    return;
  }

  (window.onresize = () => {
    gl.viewport(
      0,
      0,
      canvas.width = window.innerWidth,
      canvas.height = window.innerHeight
    );
  })();

  const vsSource = `
    attribute vec4 a_pos;

    uniform mat4 u_model;
    uniform mat4 u_proj;

    void main(void) {
      gl_Position = u_proj * u_model * a_pos;
    }
  `;

  const fsSource = `
    precision mediump float;
    uniform vec3 u_fill;

    void main(void) {
      gl_FragColor = vec4(u_fill, 1.0);
    }
  `;

  let shader_program;
  {
    function load_shader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shaders: " + info);
        return null;
      }

      return shader;
    }

    const vertex_shader = load_shader(gl, gl.VERTEX_SHADER, vsSource);
    const fragment_shader = load_shader(gl, gl.FRAGMENT_SHADER, fsSource);

    shader_program = gl.createProgram();
    gl.attachShader(shader_program, vertex_shader);
    gl.attachShader(shader_program, fragment_shader);
    gl.linkProgram(shader_program);

    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
      alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          shader_program
        )}`
      );
      return null;
    }
  }

  const program_info = {
    program: shader_program,
    a_pos: gl.getAttribLocation(shader_program, "a_pos"),
    u_proj: gl.getUniformLocation(shader_program, "u_proj"),
    u_model: gl.getUniformLocation(shader_program, "u_model"),
    u_fill: gl.getUniformLocation(shader_program, "u_fill"),
  };

  const buf = {
    cpu_idx: new Uint16Array(1 << 12),
    gpu_idx: gl.createBuffer(),
    cpu_vrt: new Float32Array(1 << 12),
    gpu_vrt: gl.createBuffer(),
  };
  gl.bindBuffer(gl.ARRAY_BUFFER        , buf.gpu_vrt);
  gl.bufferData(gl.ARRAY_BUFFER        , buf.cpu_vrt.byteLength, gl.STREAM_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.gpu_idx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buf.cpu_idx.byteLength, gl.STREAM_DRAW);

  {
    const positions = [
      -1.0, 0.0,  1.0,  1.0, 0.0,  1.0,  1.0, 2.0,  1.0, -1.0, 2.0,  1.0, // Front face
      -1.0, 0.0, -1.0, -1.0, 2.0, -1.0,  1.0, 2.0, -1.0,  1.0, 0.0, -1.0, // Back face
      -1.0, 2.0, -1.0, -1.0, 2.0,  1.0,  1.0, 2.0,  1.0,  1.0, 2.0, -1.0, // Top face
      -1.0, 0.0, -1.0,  1.0, 0.0, -1.0,  1.0, 0.0,  1.0, -1.0, 0.0,  1.0, // Bottom face
       1.0, 0.0, -1.0,  1.0, 2.0, -1.0,  1.0, 2.0,  1.0,  1.0, 0.0,  1.0, // Right face
      -1.0, 0.0, -1.0, -1.0, 0.0,  1.0, -1.0, 2.0,  1.0, -1.0, 2.0, -1.0, // Left face
    ];
    buf.cpu_vrt.set(positions);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, buf.cpu_vrt);

    const indices = new Uint16Array([
       0,  1,  2,  0,  2,  3, // front
       4,  5,  6,  4,  6,  7, // back
       8,  9, 10,  8, 10, 11, // top
      12, 13, 14, 12, 14, 15, // bottom
      16, 17, 18, 16, 18, 19, // right
      20, 21, 22, 20, 22, 23, // left
    ]);
    buf.cpu_idx.set(indices);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, buf.cpu_idx);
  }


  // Draw the scene repeatedly
  requestAnimationFrame(function render(now) {
    Date_now = now;

    requestAnimationFrame(render);
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const g = 0.3;
    drawScene(gl, program_info, buf, { color: [g, g, g], scale: [2.00, 0.01, 2.00] });
    drawScene(gl, program_info, buf, { color: [0, 0, 0], scale: [1.00, 1.00, 1.00] });
    drawScene(gl, program_info, buf, { color: [1, 1, 1], scale: [0.95, 0.95, 0.95] });
  });
})();
