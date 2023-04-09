// vim: sw=2 ts=2 expandtab smartindent ft=javascript
let Date_now;

function dot3(x, y) {
  return (x[0]*y[0] + x[1]*y[1] + x[2]*y[2]);
}
function mag3(vec) { return Math.sqrt(dot3(vec, vec)); }
function norm3(vec) {
  const mag = mag3(vec);
  if (mag > 0) {
    vec[0] /= mag;
    vec[1] /= mag;
    vec[2] /= mag;
  }
  return vec;
}
function add3(l, r) {
  return [l[0] + r[0],
          l[1] + r[1],
          l[2] + r[2]];
}
function sub3(l, r) {
  return [l[0] - r[0],
          l[1] - r[1],
          l[2] - r[2]];
}
function mul3_f(v, f) {
  return [v[0] * f, v[1] * f, v[2] * f];
}
function ray_hit_plane(plane_p, plane_n, ray_p, ray_d) {
  const d = dot3(plane_p, mul3_f(plane_n, -1));
  const t = -(d + dot3(ray_p, plane_n)) / dot3(ray_d, plane_n);
  return [ray_p[0] + t * ray_d[0],
          ray_p[1] + t * ray_d[1],
          ray_p[2] + t * ray_d[2]];
}

const CUBE = {
  vrt: new Float32Array([
    -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0, // Front face
    -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0, // Back face
    -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0, // Top face
    -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0, // Bottom face
     1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0, // Right face
    -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, // Left face
  ]),
  idx: new Uint16Array([
     0,  1,  2,  0,  2,  3, // front
     4,  5,  6,  4,  6,  7, // back
     8,  9, 10,  8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
  ])
};
const SPHERE = {
  vrt: new Float32Array([
    0.0, 0.0, -1.0, 0.72, -0.52, -0.44, -0.27, -0.85, -0.44, -0.89, 0.0, -0.44, -0.27, 0.85, -0.44,
    0.72, 0.52, -0.44, 0.27, -0.85, 0.44, -0.72, -0.52, 0.44, -0.72, 0.52, 0.44, 0.27, 0.85, 0.44,
    0.89, 0.0, 0.44, 0.0, 0.0, 1.0, -0.23, -0.71, -0.65, -0.16, -0.49, -0.85, -0.07, -0.23, -0.96,
    0.2, -0.14, -0.96, 0.42, -0.3, -0.85, 0.6, -0.44, -0.65, 0.53, -0.68, -0.5, 0.26, -0.8, -0.52,
    -0.02, -0.86, -0.5, 0.81, 0.29, -0.5, 0.85, 0.0, -0.52, 0.81, -0.29, -0.5, 0.2, 0.14, -0.96,
    0.42, 0.3, -0.85, 0.6, 0.44, -0.65, -0.75, 0.0, -0.65, -0.52, 0.0, -0.85, -0.25, 0.0, -0.96,
    -0.48, -0.71, -0.5, -0.68, -0.49, -0.52, -0.83, -0.23, -0.5, -0.23, 0.71, -0.65, -0.16, 0.49, -0.85,
    -0.07, 0.23, -0.96, -0.83, 0.23, -0.5, -0.68, 0.49, -0.52, -0.48, 0.71, -0.5, -0.02, 0.86, -0.5,
    0.26, 0.8, -0.52, 0.53, 0.68, -0.5, 0.95, -0.14, 0.25, 0.95, -0.3, 0.0, 0.86, -0.44, -0.25,
    0.86, 0.44, -0.25, 0.95, 0.3, 0.0, 0.95, 0.14, 0.25, 0.15, -0.95, 0.25, 0.0, -0.99, 0.0,
    -0.15, -0.95, -0.25, 0.68, -0.68, -0.25, 0.58, -0.8, 0.0, 0.43, -0.86, 0.25, -0.86, -0.44, 0.25,
    -0.95, -0.3, 0.0, -0.95, -0.14, -0.25, -0.43, -0.86, -0.25, -0.58, -0.8, 0.0, -0.68, -0.68, 0.25,
    -0.68, 0.68, 0.25, -0.58, 0.8, 0.0, -0.43, 0.86, -0.25, -0.95, 0.14, -0.25, -0.95, 0.3, 0.0,
    -0.86, 0.44, 0.25, 0.43, 0.86, 0.25, 0.58, 0.8, 0.0, 0.68, 0.68, -0.25, -0.15, 0.95, -0.25,
    0.0, 0.99, 0.0, 0.15, 0.95, 0.25, 0.83, -0.23, 0.5, 0.68, -0.49, 0.52, 0.48, -0.71, 0.5,
    0.02, -0.86, 0.5, -0.26, -0.8, 0.52, -0.53, -0.68, 0.5, -0.81, -0.29, 0.5, -0.85, 0.0, 0.52,
    -0.81, 0.29, 0.5, -0.53, 0.68, 0.5, -0.26, 0.8, 0.52, 0.02, 0.86, 0.5, 0.48, 0.71, 0.5,
    0.68, 0.49, 0.52, 0.83, 0.23, 0.5, 0.07, -0.23, 0.96, 0.16, -0.49, 0.85, 0.23, -0.71, 0.65,
    0.75, 0.0, 0.65, 0.52, 0.0, 0.85, 0.25, 0.0, 0.96, -0.2, -0.14, 0.96, -0.42, -0.3, 0.85,
    -0.6, -0.44, 0.65, -0.2, 0.14, 0.96, -0.42, 0.3, 0.85, -0.6, 0.44, 0.65, 0.07, 0.23, 0.96,
    0.16, 0.49, 0.85, 0.23, 0.71, 0.65, 0.36, 0.26, 0.89, 0.63, 0.26, 0.72, 0.44, 0.52, 0.72,
    -0.13, 0.42, 0.89, -0.05, 0.68, 0.72, -0.36, 0.58, 0.72, -0.44, 0.0, 0.89, -0.67, 0.16, 0.72,
    -0.67, -0.16, 0.72, -0.13, -0.42, 0.89, -0.36, -0.58, 0.72, -0.05, -0.68, 0.72, 0.36, -0.26, 0.89,
    0.44, -0.52, 0.72, 0.63, -0.26, 0.72, 0.86, 0.42, 0.27, 0.8, 0.58, 0.0, 0.67, 0.68, 0.27,
    -0.13, 0.95, 0.27, -0.3, 0.95, 0.0, -0.44, 0.85, 0.27, -0.94, 0.16, 0.27, -0.99, 0.0, 0.0,
    -0.94, -0.16, 0.27, -0.44, -0.85, 0.27, -0.3, -0.95, 0.0, -0.13, -0.95, 0.27, 0.67, -0.68, 0.27,
    0.8, -0.58, 0.0, 0.86, -0.42, 0.27, 0.3, 0.95, 0.0, 0.44, 0.85, -0.27, 0.13, 0.95, -0.27,
    -0.8, 0.58, 0.0, -0.67, 0.68, -0.27, -0.86, 0.42, -0.27, -0.8, -0.58, 0.0, -0.86, -0.42, -0.27,
    -0.67, -0.68, -0.27, 0.3, -0.95, 0.0, 0.13, -0.95, -0.27, 0.44, -0.85, -0.27, 1.0, 0.0, 0.0,
    0.94, -0.16, -0.27, 0.94, 0.16, -0.27, 0.36, 0.58, -0.72, 0.13, 0.42, -0.89, 0.05, 0.68, -0.72,
    -0.44, 0.52, -0.72, -0.36, 0.26, -0.89, -0.63, 0.26, -0.72, -0.63, -0.26, -0.72, -0.36, -0.26, -0.89,
    -0.44, -0.52, -0.72, 0.67, 0.16, -0.72, 0.67, -0.16, -0.72, 0.44, 0.0, -0.89, 0.05, -0.68, -0.72,
    0.13, -0.42, -0.89, 0.36, -0.58, -0.72
  ]),
  idx: new Uint16Array([
    0, 15, 14, 1, 17, 23, 0, 14, 29, 0, 29, 35, 0, 35, 24, 1, 23, 44, 2, 20, 50, 3, 32, 56, 4, 38, 62, 5, 41, 68,
    1, 44, 51, 2, 50, 57, 3, 56, 63, 4, 62, 69, 5, 68, 45, 6, 74, 89, 7, 77, 95, 8, 80, 98, 9, 83, 101, 10, 86, 90,
    92, 99, 11, 91, 102, 92, 90, 103, 91, 92, 102, 99, 102, 100, 99, 91, 103, 102, 103, 104, 102, 102, 104, 100, 104, 101, 100, 90, 86, 103,
    86, 85, 103, 103, 85, 104, 85, 84, 104, 104, 84, 101, 84, 9, 101, 99, 96, 11, 100, 105, 99, 101, 106, 100, 99, 105, 96, 105, 97, 96,
    100, 106, 105, 106, 107, 105, 105, 107, 97, 107, 98, 97, 101, 83, 106, 83, 82, 106, 106, 82, 107, 82, 81, 107, 107, 81, 98, 81, 8, 98,
    96, 93, 11, 97, 108, 96, 98, 109, 97, 96, 108, 93, 108, 94, 93, 97, 109, 108, 109, 110, 108, 108, 110, 94, 110, 95, 94, 98, 80, 109,
    80, 79, 109, 109, 79, 110, 79, 78, 110, 110, 78, 95, 78, 7, 95, 93, 87, 11, 94, 111, 93, 95, 112, 94, 93, 111, 87, 111, 88, 87,
    94, 112, 111, 112, 113, 111, 111, 113, 88, 113, 89, 88, 95, 77, 112, 77, 76, 112, 112, 76, 113, 76, 75, 113, 113, 75, 89, 75, 6, 89,
    87, 92, 11, 88, 114, 87, 89, 115, 88, 87, 114, 92, 114, 91, 92, 88, 115, 114, 115, 116, 114, 114, 116, 91, 116, 90, 91, 89, 74, 115,
    74, 73, 115, 115, 73, 116, 73, 72, 116, 116, 72, 90, 72, 10, 90, 47, 86, 10, 46, 117, 47, 45, 118, 46, 47, 117, 86, 117, 85, 86,
    46, 118, 117, 118, 119, 117, 117, 119, 85, 119, 84, 85, 45, 68, 118, 68, 67, 118, 118, 67, 119, 67, 66, 119, 119, 66, 84, 66, 9, 84,
    71, 83, 9, 70, 120, 71, 69, 121, 70, 71, 120, 83, 120, 82, 83, 70, 121, 120, 121, 122, 120, 120, 122, 82, 122, 81, 82, 69, 62, 121,
    62, 61, 121, 121, 61, 122, 61, 60, 122, 122, 60, 81, 60, 8, 81, 65, 80, 8, 64, 123, 65, 63, 124, 64, 65, 123, 80, 123, 79, 80,
    64, 124, 123, 124, 125, 123, 123, 125, 79, 125, 78, 79, 63, 56, 124, 56, 55, 124, 124, 55, 125, 55, 54, 125, 125, 54, 78, 54, 7, 78,
    59, 77, 7, 58, 126, 59, 57, 127, 58, 59, 126, 77, 126, 76, 77, 58, 127, 126, 127, 128, 126, 126, 128, 76, 128, 75, 76, 57, 50, 127,
    50, 49, 127, 127, 49, 128, 49, 48, 128, 128, 48, 75, 48, 6, 75, 53, 74, 6, 52, 129, 53, 51, 130, 52, 53, 129, 74, 129, 73, 74,
    52, 130, 129, 130, 131, 129, 129, 131, 73, 131, 72, 73, 51, 44, 130, 44, 43, 130, 130, 43, 131, 43, 42, 131, 131, 42, 72, 42, 10, 72,
    66, 71, 9, 67, 132, 66, 68, 133, 67, 66, 132, 71, 132, 70, 71, 67, 133, 132, 133, 134, 132, 132, 134, 70, 134, 69, 70, 68, 41, 133,
    41, 40, 133, 133, 40, 134, 40, 39, 134, 134, 39, 69, 39, 4, 69, 60, 65, 8, 61, 135, 60, 62, 136, 61, 60, 135, 65, 135, 64, 65,
    61, 136, 135, 136, 137, 135, 135, 137, 64, 137, 63, 64, 62, 38, 136, 38, 37, 136, 136, 37, 137, 37, 36, 137, 137, 36, 63, 36, 3, 63,
    54, 59, 7, 55, 138, 54, 56, 139, 55, 54, 138, 59, 138, 58, 59, 55, 139, 138, 139, 140, 138, 138, 140, 58, 140, 57, 58, 56, 32, 139,
    32, 31, 139, 139, 31, 140, 31, 30, 140, 140, 30, 57, 30, 2, 57, 48, 53, 6, 49, 141, 48, 50, 142, 49, 48, 141, 53, 141, 52, 53,
    49, 142, 141, 142, 143, 141, 141, 143, 52, 143, 51, 52, 50, 20, 142, 20, 19, 142, 142, 19, 143, 19, 18, 143, 143, 18, 51, 18, 1, 51,
    42, 47, 10, 43, 144, 42, 44, 145, 43, 42, 144, 47, 144, 46, 47, 43, 145, 144, 145, 146, 144, 144, 146, 46, 146, 45, 46, 44, 23, 145,
    23, 22, 145, 145, 22, 146, 22, 21, 146, 146, 21, 45, 21, 5, 45, 26, 41, 5, 25, 147, 26, 24, 148, 25, 26, 147, 41, 147, 40, 41,
    25, 148, 147, 148, 149, 147, 147, 149, 40, 149, 39, 40, 24, 35, 148, 35, 34, 148, 148, 34, 149, 34, 33, 149, 149, 33, 39, 33, 4, 39,
    33, 38, 4, 34, 150, 33, 35, 151, 34, 33, 150, 38, 150, 37, 38, 34, 151, 150, 151, 152, 150, 150, 152, 37, 152, 36, 37, 35, 29, 151,
    29, 28, 151, 151, 28, 152, 28, 27, 152, 152, 27, 36, 27, 3, 36, 27, 32, 3, 28, 153, 27, 29, 154, 28, 27, 153, 32, 153, 31, 32,
    28, 154, 153, 154, 155, 153, 153, 155, 31, 155, 30, 31, 29, 14, 154, 14, 13, 154, 154, 13, 155, 13, 12, 155, 155, 12, 30, 12, 2, 30,
    21, 26, 5, 22, 156, 21, 23, 157, 22, 21, 156, 26, 156, 25, 26, 22, 157, 156, 157, 158, 156, 156, 158, 25, 158, 24, 25, 23, 17, 157,
    17, 16, 157, 157, 16, 158, 16, 15, 158, 158, 15, 24, 15, 0, 24, 12, 20, 2, 13, 159, 12, 14, 160, 13, 12, 159, 20, 159, 19, 20,
    13, 160, 159, 160, 161, 159, 159, 161, 19, 161, 18, 19, 14, 15, 160, 15, 16, 160, 160, 16, 161, 16, 17, 161, 161, 17, 18, 17, 1, 18
]),
};

function drawScene(gl, program_info, buf, { color, scale }) {
  const fieldOfView = (70 * Math.PI) / 180; // in radians
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
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.vrt_gpu);

    /* location, number of components, type, normalize, stride, offset */
    const { a_pos, a_clr } = program_info;
    gl.vertexAttribPointer(a_pos, 3, gl.FLOAT, false, 4*4, 4*0); gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_clr, 1, gl.FLOAT, false, 4*4, 4*3); gl.enableVertexAttribArray(a_clr);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.idx_gpu);
  gl.useProgram(program_info.program);

  gl.uniformMatrix4fv(program_info.u_proj, false, projectionMatrix);
  gl.uniformMatrix4fv(program_info.u_model, false, modelViewMatrix);
  gl.uniform3fv(program_info.u_fill, color);

  gl.drawElements(gl.TRIANGLES, buf.idx_cpu_i, gl.UNSIGNED_SHORT, 0);
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

  const vs_source = `
    attribute vec3 a_pos;
    attribute float a_clr;

    varying float v_clr;

    uniform mat4 u_model;
    uniform mat4 u_proj;

    void main(void) {
      v_clr = a_clr;
      gl_Position = u_proj * u_model * vec4(a_pos, 1);
    }
  `;

  const fs_source = `
    precision mediump float;
    uniform vec3 u_fill;

    varying float v_clr;

    void main(void) {
      gl_FragColor = vec4(v_clr*u_fill, 1.0);
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

    const vertex_shader = load_shader(gl, gl.VERTEX_SHADER, vs_source);
    const fragment_shader = load_shader(gl, gl.FRAGMENT_SHADER, fs_source);

    shader_program = gl.createProgram();
    gl.attachShader(shader_program, vertex_shader);
    gl.attachShader(shader_program, fragment_shader);
    gl.linkProgram(shader_program);

    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program: " +
                    gl.getProgramInfoLog(shader_program));
      return null;
    }
  }

  const program_info = {
    program: shader_program,
    a_pos  : gl. getAttribLocation(shader_program, "a_pos"  ),
    a_clr  : gl. getAttribLocation(shader_program, "a_clr"  ),
    u_proj : gl.getUniformLocation(shader_program, "u_proj" ),
    u_model: gl.getUniformLocation(shader_program, "u_model"),
    u_fill : gl.getUniformLocation(shader_program, "u_fill" ),
  };

  const buf = {
    idx_cpu_i: 0,
    idx_cpu: new Uint16Array(1 << 18),
    idx_gpu: gl.createBuffer(),
    vrt_cpu_i: 0,
    vrt_cpu: new Float32Array(1 << 18),
    vrt_gpu: gl.createBuffer(),
  };
  gl.bindBuffer(gl.ARRAY_BUFFER        , buf.vrt_gpu);
  gl.bufferData(gl.ARRAY_BUFFER        , buf.vrt_cpu.byteLength, gl.STREAM_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.idx_gpu);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buf.idx_cpu.byteLength, gl.STREAM_DRAW);

  const FLOATS_IN_VERT = 4;
  function buf_mesh(buf, mesh, { pos, scale, color, shadow }) {
    const cube_start_vrt_i = buf.vrt_cpu_i/FLOATS_IN_VERT;

    let cube_i = 0;
    for (let i = 0; i < mesh.vrt.length/3; i++) {
      let x = pos[0] + mesh.vrt[cube_i++]*scale;
      let y = pos[1] + mesh.vrt[cube_i++]*scale;
      let z = pos[2] + mesh.vrt[cube_i++]*scale;
      if (shadow) {
        if (y < 0) y = 0.001;
        ([x, y, z] = ray_hit_plane([0, 0, 0], [0, 1, 0], [x, y, z], norm3([-0.4, -1.5, -1])));
        y -= 0.01;
      }
      buf.vrt_cpu[buf.vrt_cpu_i++] = x;
      buf.vrt_cpu[buf.vrt_cpu_i++] = y;
      buf.vrt_cpu[buf.vrt_cpu_i++] = z;
      buf.vrt_cpu[buf.vrt_cpu_i++] = color;
    }

    for (const i of mesh.idx)
      buf.idx_cpu[buf.idx_cpu_i++] = cube_start_vrt_i+i;
  }


  // Draw the scene repeatedly
  requestAnimationFrame(function render(now) {
    Date_now = now;

    requestAnimationFrame(render);
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    {
      buf.vrt_cpu_i = 0;
      buf.idx_cpu_i = 0;
      const y = 2.0 + Math.cos(now * 0.001);
      buf_mesh(buf, SPHERE, { pos: [0, y, 0], scale: -1.00, color: 0 });
      buf_mesh(buf, SPHERE, { pos: [0, y, 0], scale:  0.95, color: 1 });
      buf_mesh(buf, SPHERE, { pos: [0, y, 0], scale:  1.00, color: 0.8, shadow: true });
                            
      buf_mesh(buf, CUBE  , { pos: [2, 1, 2], scale: -1.00, color: 0 });
      buf_mesh(buf, CUBE  , { pos: [2, 1, 2], scale:  0.95, color: 1 });
      buf_mesh(buf, CUBE  , { pos: [2, 1, 2], scale:  1.00, color: 0.8, shadow: true });

      // buf_cube(buf, [0, 1, 0]);
      gl.bufferSubData(gl.        ARRAY_BUFFER, 0, buf.vrt_cpu);
      gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, buf.idx_cpu);
    }

    const g = 0.3;
    // drawScene(gl, program_info, buf, { color: [g, g, g], scale: [2.00, 0.01, 2.00] });
    // drawScene(gl, program_info, buf, { color: [0, 0, 0], scale: [1.00, 1.00, 1.00] });
    drawScene(gl, program_info, buf, { color: [1, 1, 1], scale: [1, 1, 1] });
  });
})();
