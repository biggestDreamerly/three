export const fragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uGradient;
uniform float uOffset;
uniform float uBrightness;
uniform float uGamma;
uniform bool uFireVariant;

vec3 bloomBlur(sampler2D text, vec2 uv) {
  bool horizontal = true;
  float weight[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
  vec2 tex_offset = 1.0 / vec2(512.0, 256.0); // textureSize(uTexture, 0); // gets size of single texel

  vec3 result = texture2D(text, uv).rgb * weight[0]; // current fragment's contribution

  if(horizontal) {
    for(int i = 1; i < 5; ++i) {
      result += texture2D(text, uv + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
      result += texture2D(text, uv - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
    }
  } else {
    for(int i = 1; i < 5; ++i) {
      result += texture2D(text, uv + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
      result += texture2D(text, uv - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
    }
  }

  return result;
}

void main() {
  float gamma = uGamma;
  // h offset
  vec2 offset = vUv + vec2(uOffset, 0.0);
  // original color
  vec3 hdrColor = texture(uTexture, offset).rgb;
  // bloom color
  vec3 bloomColor = bloomBlur(uTexture, offset).rgb;
  // brightness of the texel
  float brightness = dot(hdrColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  // trim by threshold
  if(brightness > 1.0-uBrightness) {
    hdrColor += bloomColor; // additive blending
  } else {
    hdrColor = vec3(0.0, 0.0, 0.0); // transparent
  }

  // color
  vec3 color = texture2D(uGradient, vec2(mix(1.1, 0.5, 1.0-brightness), 0.0)).rgb;
  
  if(uFireVariant) {
    color = vec3(color.b, color.g, color.r);
  }

  vec3 result = hdrColor * color;

  
  // tone mapping
  // result = vec3(1.0) - exp(-result * exposure);

  // also gamma correct while we're at it       
  result = pow(result, vec3(1.0 / gamma));

  gl_FragColor = vec4(result * 7.0, 2.0);
}
`
