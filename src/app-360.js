const {innerWidth: width, innerHeight: height, THREE} = window
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
camera.target = new THREE.Vector3(0, 0, 0)
scene.add(camera)

const planeGeometry = new THREE.PlaneGeometry(5, 5)
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  side: THREE.DoubleSide
})

const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.position.z = 0
plane.position.x = 50
plane.position.y = 15
plane.lookAt(camera.position)
scene.add(plane)

const globeGeometry = new THREE.SphereGeometry(500, 60, 40)
globeGeometry.scale(-1, 1, 1)
const globeMaterial = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load('src/textures/equirectangle.jpg')
})
const globe = new THREE.Mesh(globeGeometry, globeMaterial)
globe.material.side = THREE.DoubleSide
scene.add(globe)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)
document.body.appendChild(renderer.domElement)

const globeRaycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let isUserInteracting = false
let lat = 0
let lon = 0
let phi = 0
let theta = 0

function render (dT) {
  globeRaycaster.setFromCamera(mouse, camera)

  // const intersects = globeRaycaster.intersectObjects(scene.children)
  // intersects.forEach((intersect) => {
  //   console.log(intersect)
  // })

  requestAnimationFrame(render)
  renderer.render(scene, camera)

  // if (!isUserInteracting) {
  //   lon += 0.05
  // }

  lat = Math.max(-85, Math.min(85, lat))
  phi = THREE.Math.degToRad(90 - lat)
  theta = THREE.Math.degToRad(lon)

  camera.target.x = 500 * Math.sin(phi) * Math.cos(theta)
  camera.target.y = 500 * Math.cos(phi)
  camera.target.z = 500 * Math.sin(phi) * Math.sin(theta)
  camera.lookAt(camera.target)
}

render()

let onPointerDownPointerX = 0
let onPointerDownPointerY = 0
let onPointerDownLon = 0
let onPointerDownLat = 0

window.addEventListener('mousedown', (ev) => {
  ev.preventDefault()
  isUserInteracting = true
  onPointerDownPointerX = ev.clientX
  onPointerDownPointerY = ev.clientY
  onPointerDownLon = lon
  onPointerDownLat = lat
}, false)

window.addEventListener('mouseup', (ev) => {
  ev.preventDefault()
  isUserInteracting = false
}, false)

window.addEventListener('mousemove', (ev) => {
  if (!isUserInteracting) {
    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1
  } else {
    lon = (onPointerDownPointerX - ev.clientX) * 0.1 + onPointerDownLon
    lat = (ev.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat
  }
}, false)
