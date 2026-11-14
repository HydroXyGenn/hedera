import React, { useEffect, useRef } from 'react';

interface LiquidGlassOrbProps {
  className?: string;
  intensity?: number;
  size?: number;
}

const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uIntensity;

  // Gentle organic pebble / fluid-droplet surface displacement (smooth, never pinched)
  float liquidWave(vec3 p, float t) {
    float w1 = sin(p.x * 1.9 + t * 0.72) * cos(p.y * 1.7 - t * 0.54) * sin(p.z * 1.8 + t * 0.42);
    float w2 = sin(p.y * 3.1 + p.z * 2.4 - t * 0.85) * cos(p.x * 2.6 + t * 0.6);
    float w3 = cos(p.x * 4.2 - p.y * 3.4 + t * 0.5);
    return w1 * 0.058 + w2 * 0.026 + w3 * 0.011;
  }

  float mapOrb(vec3 p, float t) {
    // Smooth organic oval droplet proportions matching the reference glass centerpiece
    vec3 q = p / vec3(0.86, 1.08, 0.88);
    float d = length(q) - 0.94;
    d += liquidWave(q, t) * (0.95 + uIntensity * 0.15);
    return d * 0.75;
  }

  vec3 calcNormal(vec3 p, float t) {
    vec2 e = vec2(0.0028, 0.0);
    return normalize(vec3(
      mapOrb(p + e.xyy, t) - mapOrb(p - e.xyy, t),
      mapOrb(p + e.yxy, t) - mapOrb(p - e.yxy, t),
      mapOrb(p + e.yyx, t) - mapOrb(p - e.yyx, t)
    ));
  }

  // Domain-warped caustic ribbon generator for sharp liquid-glass interior folds
  float causticPattern(vec3 dir, float t) {
    vec3 p = dir * 2.6;
    p.x += sin(p.y * 1.8 + t * 0.65) * 0.75;
    p.y += cos(p.z * 2.0 - t * 0.55) * 0.75;
    p.z += sin(p.x * 1.7 + t * 0.48) * 0.65;

    float v1 = abs(sin(p.x * 2.2 + cos(p.y * 2.5 + t * 0.45)) + cos(p.z * 2.3));
    float v2 = abs(cos(p.y * 2.9 - sin(p.x * 2.1 - t * 0.35)) + sin(p.z * 2.6));
    float ridge1 = pow(clamp(1.0 - v1 * 0.65, 0.0, 1.0), 4.5);
    float ridge2 = pow(clamp(1.0 - v2 * 0.65, 0.0, 1.0), 5.0);
    return ridge1 * 0.9 + ridge2 * 0.75;
  }

  vec3 sampleEnv(vec3 dir, float t) {
    float grad = clamp(dir.y * 0.42 + dir.x * 0.44 + 0.48, 0.0, 1.0);
    vec3 deepCobalt = vec3(0.02, 0.14, 0.54);
    vec3 electricBlue = vec3(0.11, 0.46, 0.92);
    vec3 sunlitIce = vec3(0.88, 0.96, 1.00);

    vec3 sky = mix(deepCobalt, electricBlue, smoothstep(0.0, 0.58, grad));
    sky = mix(sky, sunlitIce, smoothstep(0.54, 1.0, grad));

    // Crisp dark cobalt caustic troughs + glowing cyan/violet prism lines
    float c = causticPattern(dir, t);
    float cShift = causticPattern(dir + vec3(0.09, -0.06, 0.05), t + 0.3);

    sky *= 0.82 + 0.32 * smoothstep(0.0, 1.0, dir.y * 0.5 + 0.5);
    sky += vec3(0.32, 0.92, 1.00) * c * 0.95;
    sky += vec3(0.62, 0.54, 1.00) * cShift * 0.55;

    // Bright studio softbox ribbons for wet liquid reflections
    vec3 keyBox = normalize(vec3(-0.68, 0.65, 0.55));
    vec3 rimBox = normalize(vec3(0.82, 0.48, 0.22));
    sky += vec3(1.0) * pow(max(dot(dir, keyBox), 0.0), 22.0) * 1.35;
    sky += vec3(0.88, 0.96, 1.0) * pow(max(dot(dir, rimBox), 0.0), 12.0) * 0.85;

    return sky;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    float t = uTime * 0.8;

    float rotY = uPointer.x * 0.42 + sin(t * 0.22) * 0.16;
    float rotX = uPointer.y * 0.3 + cos(t * 0.2) * 0.1;
    mat2 ry = mat2(cos(rotY), -sin(rotY), sin(rotY), cos(rotY));
    mat2 rx = mat2(cos(rotX), -sin(rotX), sin(rotX), cos(rotX));

    vec3 ro = vec3(0.0, 0.0, 3.05);
    vec3 rd = normalize(vec3(uv, -1.95));

    ro.xz *= ry;
    rd.xz *= ry;
    ro.yz *= rx;
    rd.yz *= rx;

    float dist = 0.0;
    bool hit = false;
    vec3 p = ro;

    for (int i = 0; i < 64; i++) {
      p = ro + rd * dist;
      float d = mapOrb(p, t);
      if (d < 0.002) {
        hit = true;
        break;
      }
      if (dist > 5.0) break;
      dist += d;
    }

    if (!hit) {
      float radial = length(uv * vec2(1.05, 0.9));
      float halo = exp(-radial * radial * 2.8) * 0.22;
      gl_FragColor = vec4(vec3(0.45, 0.82, 1.0) * halo, halo * 0.72);
      return;
    }

    vec3 n = calcNormal(p, t);
    vec3 v = -rd;
    float ndv = clamp(dot(n, v), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 2.5);

    // Subtle secondary surface ripple normal perturbation for internal liquid depth
    vec3 innerN = normalize(n + vec3(
      sin(p.y * 5.0 + t * 0.9) * 0.14,
      cos(p.x * 4.5 - t * 0.7) * 0.14,
      sin(p.z * 4.8 + t * 0.6) * 0.14
    ));

    // Chromatic RGB dispersion across glass
    vec3 refrR = refract(rd, innerN, 1.0 / 1.15);
    vec3 refrG = refract(rd, innerN, 1.0 / 1.22);
    vec3 refrB = refract(rd, innerN, 1.0 / 1.31);

    vec3 refl = reflect(rd, n);
    vec3 envRefl = sampleEnv(refl, t);

    vec3 refracted = vec3(
      sampleEnv(refrR, t + 0.18).r,
      sampleEnv(refrG, t).g,
      sampleEnv(refrB, t - 0.18).b
    );

    // Rich internal cobalt contrast + sharp caustic threads
    float innerRibbon = causticPattern(normalize(p + refrG * 0.9), t * 1.1);
    vec3 color = mix(refracted * 0.88, envRefl, clamp(fresnel * 0.84 + 0.14, 0.0, 1.0));
    color += vec3(0.42, 0.93, 1.0) * innerRibbon * 0.36;

    // Chromatic rim iridescence (cyan -> periwinkle -> ice white)
    vec3 irid = vec3(
      0.55 + 0.42 * sin(fresnel * 5.5 + p.y * 3.0 + t),
      0.86 + 0.14 * cos(fresnel * 4.0 - p.x * 2.5),
      1.0
    );
    color += irid * pow(fresnel, 1.6) * 0.62;

    // Razor-sharp wet glass specular glints
    vec3 keyLight = normalize(vec3(-0.6, 0.65, 0.62));
    vec3 rimLight = normalize(vec3(0.75, 0.42, 0.38));
    vec3 h1 = normalize(keyLight + v);
    vec3 h2 = normalize(rimLight + v);
    float spec1 = pow(max(dot(n, h1), 0.0), 120.0);
    float spec2 = pow(max(dot(n, h2), 0.0), 48.0);
    color += vec3(1.0) * spec1 * 1.5 + vec3(0.72, 0.95, 1.0) * spec2 * 0.65;

    // Crystal glass opacity: glowing edges & caustics, silky transparent core
    float alpha = clamp(0.56 + fresnel * 0.42 + innerRibbon * 0.2 + spec1 * 0.4, 0.0, 0.98);
    alpha *= smoothstep(0.0, 0.16, ndv + 0.06);

    gl_FragColor = vec4(color, alpha);
  }
`;

export const LiquidGlassOrb: React.FC<LiquidGlassOrbProps> = ({
  className = '',
  intensity = 1,
  size = 460,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });

    let rafId = 0;
    const startTime = performance.now();

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current.targetX = Math.max(-1, Math.min(1, nx));
      pointerRef.current.targetY = Math.max(-1, Math.min(1, ny));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    if (gl) {
      const compile = (type: number, src: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

      if (vs && fs) {
        const program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);

          if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(
              gl.ARRAY_BUFFER,
              new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
              gl.STATIC_DRAW
            );

            const posLoc = gl.getAttribLocation(program, 'aPosition');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            const timeLoc = gl.getUniformLocation(program, 'uTime');
            const ptrLoc = gl.getUniformLocation(program, 'uPointer');
            const intLoc = gl.getUniformLocation(program, 'uIntensity');

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            const renderWebGL = (now: number) => {
              const t = (now - startTime) * 0.001;
              pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
              pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.05;

              gl.clearColor(0, 0, 0, 0);
              gl.clear(gl.COLOR_BUFFER_BIT);
              gl.uniform1f(timeLoc, t);
              gl.uniform2f(ptrLoc, pointerRef.current.x, pointerRef.current.y);
              gl.uniform1f(intLoc, intensityRef.current);
              gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
              rafId = requestAnimationFrame(renderWebGL);
            };

            rafId = requestAnimationFrame(renderWebGL);
            return () => {
              cancelAnimationFrame(rafId);
              window.removeEventListener('pointermove', handlePointerMove);
              gl.deleteProgram(program);
              gl.deleteShader(vs);
              gl.deleteShader(fs);
            };
          }
        }
      }
    }

    // Canvas2D fallback if WebGL is unavailable
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return () => window.removeEventListener('pointermove', handlePointerMove);
    }

    const renderFallback = (now: number) => {
      const t = (now - startTime) * 0.001;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const rx = w * 0.33;
      const ry = h * 0.41;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(cx, cy);

      ctx.beginPath();
      const steps = 90;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const wobble =
          1 + Math.sin(a * 3 + t * 0.9) * 0.03 + Math.cos(a * 4 - t * 0.7) * 0.018;
        const px = Math.cos(a) * rx * wobble;
        const py = Math.sin(a) * ry * wobble;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const baseGrad = ctx.createRadialGradient(-rx * 0.3, -ry * 0.35, rx * 0.1, 0, 0, ry * 1.15);
      baseGrad.addColorStop(0, 'rgba(235, 250, 255, 0.85)');
      baseGrad.addColorStop(0.38, 'rgba(92, 186, 255, 0.56)');
      baseGrad.addColorStop(0.75, 'rgba(29, 98, 224, 0.62)');
      baseGrad.addColorStop(1, 'rgba(130, 230, 255, 0.88)');
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.restore();

      rafId = requestAnimationFrame(renderFallback);
    };

    rafId = requestAnimationFrame(renderFallback);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [size]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <div
        className="pointer-events-none absolute inset-4 rounded-full blur-3xl opacity-50"
        style={{
          background:
            'radial-gradient(circle at 60% 35%, rgba(214, 243, 255, 0.65), rgba(56, 189, 248, 0.26) 52%, transparent 78%)',
        }}
      />
      <canvas
        ref={canvasRef}
        aria-label="Interactive animated liquid glass Hedera escrow orb"
        className="relative z-10 w-full h-full max-w-[460px] max-h-[460px] aspect-square animate-float-slow"
      />
    </div>
  );
};
