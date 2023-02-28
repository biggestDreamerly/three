import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { fragmentShader } from '../shaders/particleSpark/fragment'
import { vertexShader } from '../shaders/particleSpark/vertex'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { GroupProps, useFrame } from '@react-three/fiber'
import { DoubleSide, Mesh, ShaderMaterial } from 'three'
import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { useControls } from 'leva'
import { Select } from '@react-three/postprocessing'

const loader = new THREE.TextureLoader()
const particle = loader.load('/Lightning.png')
particle.wrapS = THREE.RepeatWrapping
particle.wrapT = THREE.RepeatWrapping
const gradient = loader.load('/Gradient.png')

const RAD2DEG = Math.PI / 180
// const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t
// const clamp = (v: number, min: number = 0, max: number = 1) => Math.min(max, Math.max(min, v))
const range = (min: number = 0, max: number = 1) => Math.random() * (max - min) + min

const Spark = (props: GroupProps) => {
  const matRef = useRef<Mesh<any, ShaderMaterial>>()
  const tId = useRef<NodeJS.Timeout>()
  const freqRef = useRef<number>(1)
  const dissRef = useRef<number>(1)

  useControls({
    fire: {
      value: false,
      onChange: value => {
        if (matRef.current?.material.uniforms) {
          matRef.current.material.uniforms.uFireVariant.value = value
        }
      },
    },
    frequency: {
      value: 2,
      min: 1,
      max: 3,
      step: 1,
      onChange: value => {
        dissRef.current = value
        freqRef.current = 3000 - value * 1000
      },
    },
  })

  // load 2 models for the arcs
  const { nodes } = useGLTF('/LightningMesh.gltf') as GLTF & { nodes: any }
  const { nodes: nodes2 } = useGLTF('/LightningMesh2.gltf') as GLTF & { nodes: any }

  useFrame(() => {
    if (matRef.current?.material.uniforms) {
      // decreases brightness uniform in order to make the lightning disappear
      matRef.current.material.uniforms.uBrightness.value -= range(0.005, 0.01) + dissRef.current * 0.001

      // makes the arc move away from the center
      matRef.current.scale.x += 0.001
      // matRef.current.scale.y += 0.001 // do not!
      matRef.current.scale.z += 0.001
    }
  })

  useEffect(() => {
    // function to loop the animation of a lightning
    const trigger = () => {
      tId.current = setTimeout(() => {
        // sets initial scale with some random variant
        const newInitialScale = range(0.5, 0.9)
        matRef.current!.scale.set(newInitialScale, newInitialScale, newInitialScale)

        if (matRef.current?.material.uniforms) {
          // restores brightness and makes the lightning visible
          matRef.current.material.uniforms.uBrightness.value = 0.79
          // moves the lightning texture to make it less similar to others
          matRef.current.material.uniforms.uOffset.value = Math.random()
        }
        // rotates the arc to make it appear all around the rock
        matRef.current!.rotation.set(range(0, 360) * RAD2DEG, range(45, 135) * RAD2DEG, range(0, 360) * RAD2DEG)

        // reschedule the next loop
        trigger()
        // loop delays randomly between 100ms and 500ms plus the frequency set by the user
      }, range(100, 500) + freqRef.current)
    }

    // boot up
    trigger()

    return () => clearTimeout(tId.current)
  }, [])

  const material = useMemo(
    () => (
      <shaderMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent
        side={DoubleSide}
        uniforms={{
          uTexture: { value: particle },
          uGradient: { value: gradient },
          uOffset: { value: 0 },
          uBrightness: { value: 0 },
          uGamma: { value: 0.75 },
          uFireVariant: { value: true },
        }}
      />
    ),
    [],
  )

  // half of the times we pick one arc or the other
  const meshNodes = Math.random() > 0.5 ? nodes.pSphere2 : nodes2.pSphere2003
  return (
    <group {...props} dispose={null}>
      <mesh {...meshNodes} ref={matRef as MutableRefObject<Mesh>}>
        {material}
      </mesh>
    </group>
  )
}

export default function ElectricFields() {
  return (
    <Select enabled>
      <group rotation={[0, Math.PI / 2, 0]}>
        <Spark />
        <Spark />
        <Spark />
      </group>
    </Select>
  )
}

useGLTF.preload(['/LightningMesh.gltf', '/LightningMesh2.gltf'])
