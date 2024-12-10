export default `
        varying vec3 vPosition;
        varying vec2 vUv;
        uniform float uTime;
  
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
  
        float createWave(float yPos, float offset) {
            float moveSpeed = 2.0;
            float riseFactor = mod(uTime * moveSpeed + offset, 12.0) - 3.0;
            float wave = smoothstep(0.0, 0.8, 1.0 - abs(yPos - riseFactor) / 2.0);
            float topFade = smoothstep(2.75, 1.5, yPos); // Adjust these values to control fade height
  
            return wave * topFade;
        }
  
        void main() {
    // Two rising waves with different offsets
    float wave1 = createWave(vPosition.y, 0.0);
    float wave2 = createWave(vPosition.y, 6.0);

    // Base intensity with height falloff
    float intensity = 1.0 - (vPosition.y + 5.0) / 12.0;

    // Radial falloff for cylinder shape
    float radialDistance = length(vec2(vPosition.x, vPosition.z));
    float radialFalloff = 1.0 - smoothstep(0.0, 0.5, radialDistance);

    // Noise and base effects
    float noise = random(vec2(vPosition.y + uTime * 0.1, vPosition.x + uTime * 0.1)) * 0.1;
    float baseEffect = smoothstep(0.2, 0.0, vPosition.y + 4.8) * 2.0;

    float colorIntensity = 1.0 - (vPosition.y + 5.0) / 12.0;
    float alphaIntensity = colorIntensity;
    colorIntensity = colorIntensity * radialFalloff;
    colorIntensity = clamp(colorIntensity + noise + baseEffect, 0.0, 1.2); // Clamp to prevent over-brightening

    // Color gradient
    vec3 baseColor = vec3(0.156, 0.28, 0.211);  
    vec3 topColor = vec3(0.156, 0.28, 0.211);
    vec3 color = mix(baseColor, topColor, vPosition.y * 0.1 + 0.5);

    // Wave color (separate from base color)
    vec3 waveColor = vec3(0.256, 0.38, 0.311);  // Pure green for waves
    float waveStrength = (wave1 * 0.6 + wave2 * 0.4);

    // Mix the base color with wave color
    vec3 finalColor = mix(color * colorIntensity, waveColor, waveStrength);

    // Use a higher alpha value while keeping the color controlled
    gl_FragColor = vec4(finalColor, 0.75);
}

    `;
