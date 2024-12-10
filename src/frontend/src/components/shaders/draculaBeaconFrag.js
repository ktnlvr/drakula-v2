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
    float wave1 = createWave(vPosition.y, 0.0);
    float wave2 = createWave(vPosition.y, 6.0);

    float intensity = 1.0 - (vPosition.y + 5.0) / 12.0;

    float radialDistance = length(vec2(vPosition.x, vPosition.z));
    float radialFalloff = 1.0 - smoothstep(0.0, 0.5, radialDistance);

    float noise = random(vec2(vPosition.y + uTime * 0.1, vPosition.x + uTime * 0.1)) * 0.1;
    float baseEffect = smoothstep(0.2, 0.0, vPosition.y + 4.8) * 2.0;

    float colorIntensity = 1.0 - (vPosition.y + 5.0) / 12.0;
    float alphaIntensity = colorIntensity;
    colorIntensity = colorIntensity * radialFalloff;
    colorIntensity = clamp(colorIntensity + noise + baseEffect, 0.0, 1.2); 

    vec3 baseColor = vec3(0.439, 0.192, 0.231);  
    vec3 topColor = vec3(0.439, 0.192, 0.231);
    vec3 color = mix(baseColor, topColor, vPosition.y * 0.1 + 0.5);

    vec3 waveColor = vec3(0.439, 0.192, 0.231);  
    float waveStrength = (wave1 * 0.6 + wave2 * 0.4);

    vec3 finalColor = mix(color * colorIntensity, waveColor, waveStrength);
    gl_FragColor = vec4(finalColor, 0.75);
}`;
