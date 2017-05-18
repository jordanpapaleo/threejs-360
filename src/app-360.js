const {innerWidth: width, innerHeight: height, THREE} = window
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
camera.target = new THREE.Vector3(0, 0, 0)
scene.add(camera)

const globeGeometry = new THREE.SphereGeometry(500, 60, 40)
globeGeometry.scale(-1, 1, 1)
const globeMaterial = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load('src/textures/equirectangle.jpg')
})
const globe = new THREE.Mesh(globeGeometry, globeMaterial)
scene.add(globe)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)
document.body.appendChild(renderer.domElement)

let lat = 0
let lon = 0
let phi = 0
let theta = 0

function render (dT) {
  lon += 0.05
  lat = Math.max(-85, Math.min(85, lat))
  phi = THREE.Math.degToRad(90 - lat)
  theta = THREE.Math.degToRad(lon)

  camera.target.x = 500 * Math.sin(phi) * Math.cos(theta)
  camera.target.y = 500 * Math.cos(phi)
  camera.target.z = 500 * Math.sin(phi) * Math.sin(theta)

  camera.lookAt(camera.target)
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}

render()
