/**
 * GLSL for the intelligence orb.
 *
 * Written against GLSL ES 1.00 (`varying` / `gl_FragColor`) because that is what
 * three.js `ShaderMaterial` compiles by default — reaching for `in`/`out` and
 * `glslVersion: THREE.GLSL3` here would buy nothing and risk a silent link error.
 */

/** Shared hash + value-noise helpers, injected into both stages. */
const NOISE_CHUNK = /* glsl */ `
  float hash31(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  // Trilinear value noise.
  float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

    return mix(
      mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
      mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
      u.z
    );
  }

  // Fractal brownian motion — four octaves is enough for a plasma surface.
  float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      total += amplitude * valueNoise(p);
      p *= 2.02;
      amplitude *= 0.5;
    }
    return total;
  }
`

export const ORB_VERTEX_SHADER = /* glsl */ `
  ${NOISE_CHUNK}

  uniform float uTime;
  uniform float uPulse;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vNoise;

  void main() {
    vec3 displaced = position;

    // Displace along the normal so the silhouette itself breathes.
    float noise = fbm(normal * 2.4 + vec3(0.0, uTime * 0.35, uTime * 0.18));
    vNoise = noise;

    float amplitude = 0.16 + uPulse * 0.42;
    displaced += normal * (noise - 0.5) * amplitude;

    // uPulse kicks the whole shell outward for a short burst.
    displaced += normal * uPulse * 0.12;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * mvPosition;
  }
`

export const ORB_FRAGMENT_SHADER = /* glsl */ `
  ${NOISE_CHUNK}

  uniform float uTime;
  uniform float uPulse;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vNoise;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);

    // Fresnel term: bright at grazing angles, transparent head-on.
    float fresnel = pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), 2.4);

    // Slow counter-rotating plasma bands.
    float bands = sin(vNoise * 9.0 + uTime * 1.4) * 0.5 + 0.5;

    vec3 base = mix(uColorA, uColorB, bands);
    vec3 color = base * (0.35 + fresnel * 1.9);
    color += uColorB * uPulse * 0.75;

    // Lift the rim so the edge stays readable against the dark page.
    float alpha = 0.24 + fresnel * 0.72 + uPulse * 0.2;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`

/**
 * Starfield / data-grid backdrop.
 *
 * Kept additive and depth-write-free so it never occludes the orb.
 */
export const GRID_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const GRID_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Perspective-ish convergence toward the top of the plane.
    float depth = pow(1.0 - uv.y, 2.2);
    vec2 grid = fract(uv * 26.0);
    float lines = min(grid.x, grid.y);
    float line = smoothstep(0.04, 0.0, lines);

    // A scanline sweeping forward along the plane.
    float sweep = smoothstep(0.02, 0.0, abs(fract(uv.y - uTime * 0.12) - 0.5));

    float intensity = line * 0.34 + sweep * 0.22;
    gl_FragColor = vec4(uColor, intensity * depth);
  }
`
