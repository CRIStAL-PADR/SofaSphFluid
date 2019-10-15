#version 120

uniform sampler2D u_depthTexture;
uniform float u_width;
uniform float u_height;
uniform vec2 u_direction;
uniform float u_spriteBlurRadius;
uniform float u_spriteBlurScale;
uniform float u_spriteBlurDepthFalloff;
uniform float u_zNear;
uniform float u_zFar;

varying vec2 v_texcoord;

vec3 linearDepth(float depth)
{
	float z = depth;      // fetch the z-value from our depth texture
	float n = u_zNear;                                // the near plane
	float f = u_zFar;                               // the far plane
	float c = (2.0 * n) / (f + n - z * (f - n));  // convert to linear values 
	 
	return vec3(c);                      // linear
}


void main(void)
{
	float depth = texture2D(u_depthTexture, v_texcoord).x;

	if (depth > 0.999f) {
       discard;
    }

	vec2 blurDir = u_direction;
	float sum = 0;
	float wsum = 0;

	float texelSize = 0.0;
	if(blurDir.x > 0.5f)
		texelSize = (1.0/u_width);
	else
		texelSize = (1.0/u_height);

	float filterRadius = u_spriteBlurRadius * texelSize;

	for(float x=-filterRadius; x<=filterRadius; x+=texelSize) 
	{
		float sample = texture2D(u_depthTexture, v_texcoord + x*blurDir).x;
		// spatial domain
		float r = x * u_spriteBlurScale;
		float w = exp(-r*r);
		// range domain
		float r2 = (sample - depth) * u_spriteBlurDepthFalloff; 
		float g = exp(-r2*r2);
		sum += sample * w * g; wsum += w * g;
	}

	if (wsum > 0.0) 
	{
		sum /= wsum; 
	} 
	
	gl_FragDepth = sum;
	sum  = linearDepth(sum).x;

	gl_FragColor = vec4(sum,sum,sum,1.0);
}