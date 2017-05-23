const {
  RingGeometry,
  MeshBasicMaterial,
  Mesh,
  Clock,
  Vector3,
  Raycaster
} = THREE
const {_} = window

function createCursorRing () {
  const geometry = new RingGeometry(0.0075, 0.01, 32)
  const material = new MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide
  })

  const ring = new Mesh(geometry, material)
  ring.material.transparent = true
  ring.material.opacity = 0.5
  ring.position.z = -0.3
  ring.name = 'cursor'
  return ring
}

function Cursor (camera, fuzeTimeout, cursor) {
  this.state = {
    fuzeTarget: null,
    fuzeStartTime: 0
  }

  this.clock = new Clock(true)

  this.props = {
    fuzeTimeout: fuzeTimeout || 2
  }

  this.collidableItems = []
  this.camera = camera
  this.camera.add(cursor || createCursorRing())
  this.raycast = new Raycaster()

  this.update = this.update.bind(this)
  this.handleCollision = this.handleCollision.bind(this)
  this.fuseController = this.fuseController.bind(this)
  this.handleStartFuse = this.handleStartFuse.bind(this)
  this.handleFusing = this.handleFusing.bind(this)
  this.handleFuseEnd = this.handleFuseEnd.bind(this)
}

Cursor.prototype.setState = function (nextState, cb) {
  Object.keys(nextState).forEach((key) => {
    this.state[key] = nextState[key]
  })

  if (cb instanceof Function) { cb(this.state) }
}

Cursor.prototype.addItem = function (mesh) {
  this.collidableItems.push(mesh)
}

Cursor.prototype.removeItem = function (mesh) {
  this.collidableItems = this.collidableItems.filter(item => item.uuid !== mesh.uuid)
}

Cursor.prototype.update = function () {
  this.updateRaycaster()
  this.handleCollision()
}

Cursor.prototype.updateRaycaster = function () {
  const vector = new Vector3(0, 0, 0)
  vector.unproject(this.camera)
  this.raycast.set(
    this.camera.position,
    vector.sub(this.camera.position).normalize()
  )
}

Cursor.prototype.handleCollision = function () {
  const {fuzeTarget} = this.state
  const {raycast, fuseController, handleFuseEnd, collidableItems, clock} = this
  const intersects = raycast.intersectObjects(collidableItems)

  if (intersects.length) {
    const firstIntersected = intersects[0].object
    const lastCollisionTime = clock.getElapsedTime()

    if (firstIntersected) {
      fuseController(firstIntersected, lastCollisionTime)
    }
  } else {
    if (fuzeTarget) {
      handleFuseEnd()
    }
  }
}

Cursor.prototype.fuseController = function (mesh, lastCollisionTime) {
  const {fuzeTarget} = this.state
  const {handleStartFuse, handleFusing, handleFuseEnd} = this

  if (!fuzeTarget) {
    handleStartFuse(mesh, lastCollisionTime)
  } else if (fuzeTarget === mesh) {
    handleFusing(lastCollisionTime)
  } else {
    handleFuseEnd()
  }
}

Cursor.prototype.handleStartFuse = function (mesh, lastCollisionTime) {
  this.setState({
    fuzeTarget: mesh,
    fuzeStartTime: lastCollisionTime
  }, (newState) => {
    if (newState.fuzeTarget.onFusing instanceof Function) {
      newState.fuzeTarget.onFusing()
    }
  })
}

Cursor.prototype.handleFusing = function (lastCollisionTime) {
  const {fuzeStartTime, fuzeTarget} = this.state
  const {fuzeTimeout} = this.props

  if (fuzeTarget.fuzed) {
    return
  }

  // Fuse time has exceeded the timeout
  if ((lastCollisionTime - fuzeStartTime) >= fuzeTimeout) {
    fuzeTarget.fuzed = true
    if (fuzeTarget.onFused instanceof Function) {
      fuzeTarget.onFused()
    }
  } else {
    fuzeTarget.onFusing()
  }
}

Cursor.prototype.handleFuseEnd = function () {
  const {fuzeTarget} = this.state
  delete fuzeTarget.fuzed
  if (fuzeTarget && fuzeTarget.onFuseEnd instanceof Function) {
    fuzeTarget.onFuseEnd()
  }

  this.setState({
    fuzeStartTime: null,
    fuzeTarget: null
  })
}
