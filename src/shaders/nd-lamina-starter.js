import { Abstract } from 'lamina/vanilla'
import shader from './nd-stonecreekcrew-fluid.fs'

// Extend the Abstract layer
export class ndLaminaStarter extends Abstract {
  // Define stuff as static properties!

  // Uniforms: Must begin with prefix "u_".
  // Assign them their default value.
  // Any unifroms here will automatically be set as properties on the class as setters and getters.
  // There setters and getters will update the underlying unifrom.
  static u_color = 'red' // Can be accessed as CustomLayer.color
  static u_alpha = 1 // Can be accessed as CustomLayer.alpha
  static u_time = 0.0

  // Define your fragment shader just like you already do!
  // Only difference is, you must return the final color of this layer
  static fragmentShader = shader

  // Optionally Define a vertex shader!
  // Same rules as fragment shaders, except no blend modes.
  // Return a non-transformed vec3 position.
  static vertexShader = `   
    // Varyings must be prefixed by "v_"
    varying vec3 v_uv;

    void main() {
      v_uv = position;
      return position;
    }
  `

  constructor(props) {
    // You MUST call `super` with the current constructor as the first argument.
    // Second argument is optional and provides non-uniform parameters like blend mode, name and visibility.
    super(ndLaminaStarter, {
      name: 'ndLaminaStarter',
      ...props,
    })
  }
}