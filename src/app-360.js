const {innerWidth: width, innerHeight: height, THREE, Cursor} = window
const scene = new THREE.Scene()
scene.name = 'scene'
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
camera.name = 'camera'
camera.target = new THREE.Vector3(0, 0, 0)
scene.add(camera)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.name = 'directionalLight'
directionalLight.position.set(1, 1, 1)
camera.add(directionalLight)

const ambientLight = new THREE.AmbientLight(0x444444)
ambientLight.name = 'ambientLight'
scene.add(ambientLight)

const cursor = new Cursor(camera)
cursor.name = 'cursor'

var planeCount = 3
while (planeCount) {
  const plane = createPlane()
  plane.name = 'plane' + planeCount
  plane.position.set(planeCount * 5, 0, -20)
  plane.lookAt(camera.position)
  plane.onFusing = function () {
    console.warn('fusing')
    if (this.material.emissive) {
      this.material.emissive.setHex(0xfff000)
    }
  }

  plane.onFused = function () {
    console.warn('onfused')
    this.material.emissive.setHex(0x00ff00)
  }

  plane.onFuseEnd = function () {
    console.warn('onfuseend')
    if (this.material.emissive) {
      this.material.emissive.setHex(0xff0000)
    }
  }

  cursor.addItem(plane)
  scene.add(plane)
  planeCount--
}

function createPlane () {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      specular: 0xff0000,
      shininess: 250,
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors
    })
  )
}

setTimeout(() => {
  const nextMesh = createPlane()
  nextMesh.name = 'next mesh'
  nextMesh.position.set(-5, 0, -20)
  scene.add(nextMesh)
  setTimeout(() => {
    removeEntity('next mesh')
  }, 3000)
}, 3000)

function removeEntity (name) {
  var selectedObject = scene.getObjectByName(name)
  scene.remove(selectedObject)
  renderLoop()
}

const sphereGeometry = new THREE.SphereGeometry(500, 60, 40)
sphereGeometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1))

const sphereMaterial = new THREE.MeshBasicMaterial()
sphereMaterial.map = THREE.ImageUtils.loadTexture('src/textures/equirectangle.jpg')
// map: new THREE.TextureLoader().load('src/textures/equirectangle.jpg')

const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphereMesh.material.side = THREE.DoubleSide
sphereMesh.name = 'sphereMesh'
scene.add(sphereMesh)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(width, height)
document.body.appendChild(renderer.domElement)

// listeners
document.addEventListener('mousedown', onDocumentMouseDown, false)
document.addEventListener('mousemove', onDocumentMouseMove, false)
document.addEventListener('mouseup', onDocumentMouseUp, false)
window.addEventListener('resize', onResize, false)
window.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false)
window.addEventListener('mousewheel', onDocumentMouseWheel, false)

var manualControl = false
var longitude = 0
var latitude = 0
var savedX
var savedY
var savedLongitude
var savedLatitude
var fov = camera.fov

function screenShot () {
  var w = window.open('', '')
  w.document.title = 'Screenshot'
  var img = new Image()
  renderer.render(scene, camera)
  img.src = renderer.domElement.toDataURL()
  w.document.body.appendChild(img)
}

function onDocumentMouseWheel (ev) {
  var minFov = 30
  var maxFov = 75

  fov -= ev.wheelDeltaY * 0.05

  if (fov < minFov) {
    fov = minFov
  } else if (fov > maxFov) {
    fov = maxFov
  }

  camera.fov = fov
  camera.updateProjectionMatrix()
}

function onResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onDocumentMouseDown (ev) {
  ev.preventDefault()
  manualControl = true
  savedX = ev.clientX
  savedY = ev.clientY
  savedLongitude = longitude
  savedLatitude = latitude
}

function onDocumentMouseMove (ev) {
  if (manualControl) {
    longitude = (savedX - ev.clientX) * 0.1 + savedLongitude
    latitude = (ev.clientY - savedY) * 0.1 + savedLatitude
  }
}

function onDocumentMouseUp () {
  manualControl = false
}

function panUpdate (camera) {
  if (!manualControl) {
    // longitude += 0.1
  }

  // limiting latitude from -85 to 85
  latitude = Math.max(-85, Math.min(85, latitude))

  const latRad = THREE.Math.degToRad(90 - latitude)
  const longRad = THREE.Math.degToRad(longitude)
  const x = Math.sin(latRad) * Math.cos(longRad)
  const y = Math.cos(latRad)
  const z = Math.sin(latRad) * Math.sin(longRad)

 // TODO figure out how to get it to start at a set position
  camera.target.set(x, y, z)
  camera.lookAt(camera.target)
}

function renderLoop (dT) {
  requestAnimationFrame(renderLoop)
  cursor.update()
  panUpdate(camera)
  renderer.render(scene, camera)
}

renderLoop()
