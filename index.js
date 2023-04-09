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
  function buf_cube(buf, { pos, scale, color, shadow }) {
    const mesh = CUBE;

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
      buf_cube(buf, { pos: [0, y, 0], scale: -1.00, color: 0 });
      buf_cube(buf, { pos: [0, y, 0], scale:  0.95, color: 1 });
      buf_cube(buf, { pos: [0, y, 0], scale:  1.00, color: 0.8, shadow: true });
                            
      buf_cube(buf, { pos: [2, 1, 2], scale: -1.00, color: 0 });
      buf_cube(buf, { pos: [2, 1, 2], scale:  0.95, color: 1 });
      buf_cube(buf, { pos: [2, 1, 2], scale:  1.00, color: 0.8, shadow: true });

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
