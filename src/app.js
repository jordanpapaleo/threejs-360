const {innerWidth: width, innerHeight: height, THREE} = window
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
camera.position.z = 5
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({color: 0x00ff00})
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)
const ambientLight = new THREE.AmbientLight(0x404040, 5)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(Math.random() * 0xffffff, 10)
directionalLight.position.x = Math.random() - 0.5
directionalLight.position.y = Math.random() - 0.5
directionalLight.position.z = Math.random() - 0.5
scene.add(directionalLight)

var object = new THREE.Object3D()
scene.add(object)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)
document.body.appendChild(renderer.domElement)

function render (dT) {
  requestAnimationFrame(render)
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
}

render()
