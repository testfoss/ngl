/* global NGL */

var stage = new NGL.Stage('viewport', { backgroundColor: 'white' })
var statusNode = document.querySelector('#status')
var resultsNode = document.querySelector('#results')
var buttons = Array.from(document.querySelectorAll('button'))
var component = null
var trajectory = null
var surface = null
var cofactorRepresentations = []
var state = { mode: 'loading' }

function publish () {
  resultsNode.textContent = JSON.stringify(state, null, 2)
}

function setStatus (text, kind) {
  statusNode.textContent = text
  statusNode.dataset.status = kind || 'working'
}

function setBusy (busy) {
  buttons.forEach(function (button) { button.disabled = busy })
  if (!busy) {
    document.querySelector('#cofactor').disabled = state.mode !== 'ferredoxin'
    document.querySelector('#surface').disabled = state.mode !== 'ferredoxin'
    document.querySelector('#next-frame').disabled = state.mode !== 'dcd'
  }
}

function fail (error) {
  state.error = error instanceof Error ? error.message : String(error)
  setStatus(state.error, 'error')
  publish()
  setBusy(false)
}

function loadFerredoxin () {
  setBusy(true)
  setStatus('Loading stock ferredoxin…')
  stage.removeAllComponents()
  trajectory = null
  surface = null
  cofactorRepresentations = []
  return stage.loadFile('../data/1blu.mmtf').then(function (loaded) {
    component = loaded
    component.addRepresentation('backbone', { color: 'skyblue' })
    cofactorRepresentations.push(component.addRepresentation('ball+stick', {
      sele: 'SF4',
      scale: 2,
      color: 'element'
    }))
    cofactorRepresentations.push(component.addRepresentation('licorice', {
      sele: 'CYS and sidechainAttached and not 57',
      color: 'yellow'
    }))
    cofactorRepresentations.push(component.addRepresentation('spacefill', {
      sele: 'CYS and .SG and not 57',
      color: 'yellow',
      radius: 0.3
    }))
    component.addRepresentation('distance', {
      atomPair: [
        ['18:A.SG', '102:A.FE1'],
        ['37:A.SG', '102:A.FE3'],
        ['40:A.SG', '102:A.FE4'],
        ['49:A.SG', '102:A.FE2'],
        ['8:A.SG', '101:A.FE3'],
        ['11:A.SG', '101:A.FE4'],
        ['14:A.SG', '101:A.FE2'],
        ['53:A.SG', '101:A.FE1']
      ],
      scale: 0.5,
      color: 'element',
      labelVisible: false
    })
    stage.autoView()
    state = {
      mode: 'ferredoxin',
      structure: '1blu.mmtf',
      atomCount: component.structure.atomCount,
      cofactorVisible: true,
      surfaceVisible: false,
      representations: component.reprList.map(function (repr) { return repr.getType() })
    }
    setStatus('Ferredoxin ready', 'ready')
    publish()
  }).catch(fail).finally(function () { setBusy(false) })
}

document.querySelector('#cofactor').addEventListener('click', function () {
  var visible = !state.cofactorVisible
  cofactorRepresentations.forEach(function (repr) { repr.setVisibility(visible) })
  state.cofactorVisible = visible
  setStatus(visible ? 'Cofactors shown' : 'Cofactors hidden', 'ready')
  publish()
})

document.querySelector('#surface').addEventListener('click', function () {
  var visible = !state.surfaceVisible
  if (!surface) {
    surface = component.addRepresentation('surface', {
      color: 'hydrophobicity',
      opacity: 0.65,
      visible: visible
    })
  } else {
    surface.setVisibility(visible)
  }
  state.surfaceVisible = visible
  state.representations = component.reprList.map(function (repr) { return repr.getType() })
  setStatus(visible ? 'Surface shown' : 'Surface hidden', 'ready')
  publish()
})

document.querySelector('#load-dcd').addEventListener('click', function () {
  setBusy(true)
  setStatus('Loading stock ala3 structure and DCD…')
  stage.removeAllComponents()
  trajectory = null
  surface = null
  cofactorRepresentations = []
  var loadedStructure
  stage.loadFile('../data/ala3.pdb').then(function (loaded) {
    component = loaded
    loadedStructure = loaded
    component.addRepresentation('licorice')
    component.addRepresentation('cartoon', { sele: 'protein' })
    component.addRepresentation('distance', {
      atomPair: [[8, 28]],
      labelColor: 'skyblue',
      color: 'skyblue'
    })
    component.autoView()
    return NGL.autoLoad('../data/ala3.dcd')
  }).then(function (frames) {
    var trajectoryComponent = loadedStructure.addTrajectory(frames)
    trajectory = trajectoryComponent.trajectory
    if (trajectory.frameCount > 0) return undefined
    return new Promise(function (resolve) {
      function onCountChanged () {
        trajectory.signals.countChanged.remove(onCountChanged)
        resolve()
      }
      trajectory.signals.countChanged.add(onCountChanged)
    })
  }).then(function () {
    if (!trajectory || trajectory.frameCount < 2) throw new Error('The stock DCD did not provide multiple frames.')
    trajectory.setFrame(1)
    state = {
      mode: 'dcd',
      structure: 'ala3.pdb',
      trajectory: 'ala3.dcd',
      frameCount: trajectory.frameCount,
      currentFrame: trajectory.currentFrame,
      representations: component.reprList.map(function (repr) { return repr.getType() })
    }
    setStatus('DCD ready', 'ready')
    publish()
  }).catch(fail).finally(function () { setBusy(false) })
})

document.querySelector('#next-frame').addEventListener('click', function () {
  if (!trajectory) return
  trajectory.setFrame((trajectory.currentFrame + 1) % trajectory.frameCount)
  state.currentFrame = trajectory.currentFrame
  setStatus('DCD frame ' + trajectory.currentFrame, 'ready')
  publish()
})

document.querySelector('#reset').addEventListener('click', loadFerredoxin)

window.testfossNgl = {
  getState: function () { return JSON.parse(JSON.stringify(state)) }
}

loadFerredoxin()
