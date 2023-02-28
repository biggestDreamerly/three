import { Canvas } from '@react-three/fiber'
import { Selection, EffectComposer, SelectiveBloom } from '@react-three/postprocessing'
import './styles.css'
import { Center, OrbitControls } from '@react-three/drei'
import ElectricRock from './components/ElectricRock'

const Scene = () => {
  return (
    <Center>
      <Selection>
        <EffectComposer multisampling={0}>
          <SelectiveBloom mipmapBlur radius={0.75} luminanceThreshold={0.2} intensity={3.2} />
        </EffectComposer>
        <ElectricRock />
      </Selection>
    </Center>
  )
}

export default function App() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 5, 15], fov: 60, zoom: 3 }}>
      <color attach="background" args={['#202020']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 10, 2]} intensity={0.5} />
      <Scene />
      <OrbitControls />
    </Canvas>
  )
}
