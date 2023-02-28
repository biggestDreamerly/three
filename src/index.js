import { createRoot } from 'react-dom/client'
import App from './App'
import { Leva } from 'leva'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)
root.render(
  <>
    <App />
    <Leva />
  </>,
)
