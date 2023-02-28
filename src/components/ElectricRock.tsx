import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { MutableRefObject, useRef } from 'react'
import { Group } from 'three'
import { Model as Rock } from '../models/StylizedRock'
import ElectricFields from '../models/ElectricFields'

export default function ElectricRock() {
  const gRef = useRef<Group>()
  const rotateRef = useRef<boolean>(false)

  useControls({
    animate: {
      value: false,
      onChange: value => {
        rotateRef.current = value
        console.log(rotateRef.current)
      },
    },
  })

  useFrame(() => {
    if (rotateRef.current && gRef.current) {
      gRef.current.rotation.y += 0.01
      gRef.current.position.y = Math.sin(gRef.current.rotation.y - Math.PI / 2) / 4
    }
  })
  return (
    <group ref={gRef as MutableRefObject<Group>} rotation={[0, Math.PI / 2, 0]}>
      <Rock />
      <ElectricFields />
    </group>
  )
}
