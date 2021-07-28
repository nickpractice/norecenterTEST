// Add recenter functionality with auto smart recenter after moving a certain distance
AFRAME.registerComponent('recenter', {
    schema: {
      // 0 means don't auto recenter, ex. 10 means auto recenter after moving 10 units
      recenterDistance: {default: 0},
      // 0 means don't adjust height, ex. 5 means recenter to height of 5
      recenterHeight: {default: 0},
      // 0 means when adjusting height, go all the way, ex. .75 means go .75 of the way
      recenterFactor: {default: 0},
    },
    init() {
      this.camera = document.getElementById('camera')
    //   this.output = document.getElementById('recenterOut')
    //   document.getElementById('recenter').addEventListener('click', () => this.recenter())
    //   document.getElementById('recenterSmart').addEventListener('click', () => this.smartRecenter())
      this.origin = this.camera.object3D.position.clone()
      this.recenterSum = this.data.recenterDistance * 1.4
    },
    tick() {
      if (this.data.recenterDistance > 0) {
        // If auto recentering, use cheap distance calculation to decide whether or not to recenter
        const moveX = Math.abs(this.origin.x - this.camera.object3D.position.x)
        const moveZ = Math.abs(this.origin.z - this.camera.object3D.position.z)
        if (moveX > this.data.recenterDistance ||
          moveZ > this.data.recenterDistance ||
          moveX + moveZ > this.recenterSum) {
          this.smartRecenter()
        }
      }
    },
    recenter() {
    //  this.showMessage('recenter')
      this.origin.set(0, 1, 0)
      this.el.sceneEl.emit('recenter', {origin: this.origin, facing: {w: 0, x: 0, y: 0, z: 0}})
      // This line isn't required, but it prevents the auto smart recentering from happening
      this.camera.object3D.copy(this.origin)
    },
    smartRecenter() {
      // 'Smart recenter' is a term we coined for resetting the tracking to the current tracked
      // position of the camera. It clears the map and resets tracking, but virtual objects will
      // appear to stay in the same place
      //this.showMessage('smart recentered')
      this.origin.copy(this.camera.object3D.position)
      if (this.data.recenterHeight) {
        // Recenter with current x,z position, but adjust height to prevent scale drift
        if (this.data.recenterFactor) {
          // Reset origin with weighted average to desired height
          this.origin.y =
            this.data.recenterFactor * this.data.recenterHeight +
            (1 - this.data.recenterFactor) * this.origin.y
        } else {
          this.origin.y = this.data.recenterHeight
        }
      }
      this.el.sceneEl.emit(
        'recenter', {origin: this.origin, facing: this.camera.object3D.quaternion}
      )
    },
  })