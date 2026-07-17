// @ts-check

// @ts-ignore
import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// @ts-ignore
import { VOXLoader, VOXMesh } from 'VOXLoader'

const SCALE_FACTOR = 0.003
console.debug('Initializing...')

// Get data from embedded HTML element
const dataElement = document.getElementById('mooncat-data')
if (dataElement == null) throw new Error('Failed to find mount point')
const pose = dataElement.dataset.pose ?? 'standing'
const facing = dataElement.dataset.facing ?? 'left'

const voxDataString = atob(dataElement.dataset.vox ?? '')
const voxData = new Uint8Array(voxDataString.length)
for (let i = 0; i < voxDataString.length; i++) {
  voxData[i] = voxDataString.charCodeAt(i)
}

/**
 * MoonCat pose to VOX layer
 * 0: stalking, 1: pouncing, 2-4: walking, 5: standing, 6: sleeping
 * @param {string} pose
 * @returns string Name of the layer
 */
function getPoseLayer(pose) {
  switch (pose) {
    case 'standing':
      return 'Posture'
    case 'pouncing':
      return 'Posture3'
    case 'stalking':
      return 'Posture4'
    default:
      return 'Posture2'
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

// Initialize ThreeJS scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 10)
camera.position.set(50 * SCALE_FACTOR, 25 * SCALE_FACTOR, 50 * SCALE_FACTOR)
if (facing == 'right') camera.position.setX(-50 * SCALE_FACTOR)

scene.add(camera)

// Lights
const hemiLight = new THREE.HemisphereLight(0xcccccc, 0x444444, 2.5)
scene.add(hemiLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 1.25)
dirLight.position.set(1.5, 3, 2.5)
scene.add(dirLight)

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
dirLight2.position.set(-1.5, -3, -2.5)
scene.add(dirLight2)

// Insert mesh model from VOX file
const loader = new VOXLoader()
const { scene: voxScene } = loader.parse(voxData.buffer)
console.debug('Loader loaded', voxScene)

// MoonCat VOX files contain multiple models, in different poses. For this viewer, only show this MoonCat's default pose
const layers = voxScene.child.children
const targetLayer = layers.find((l) => l.name == getPoseLayer(pose))
const chunk = targetLayer.child.models[0].chunk

// Accurate palette is stored in first layer, for these models
chunk.palette = layers[0].child.models[0].chunk.palette

// Convert VOX layer to ThreeJS mesh
const mesh = new VOXMesh(chunk)
mesh.scale.setScalar(SCALE_FACTOR)
if (targetLayer.frames[0]._r) {
  // This layer has a tranformation applied to it
  // For MoonCats, we'll just assume that means mirror the left/right appearance of the MoonCat
  mesh.scale.multiply(new THREE.Vector3(-1, 1, 1))
}
scene.add(mesh)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x111111)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setAnimationLoop(() => {
  controls.update()
  renderer.render(scene, camera)
})

// Delay canvas insertion to play nicely with NextJS builder
if (window) {
  window.setTimeout(() => {
    dataElement.appendChild(renderer.domElement)
  }, 15)
}

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 0.05
controls.maxDistance = 0.5

window.addEventListener('resize', onWindowResize)
console.debug('Setup done')
