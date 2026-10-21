// team/autoload.js
// Shared blueprint and helpers loaded for both alpha and beta

globalThis.houseSite = { x: 10, y: 67, z: -25 }

globalThis.getBlueprint = function (lib) {
  return lib.shapes.house({
    ...globalThis.houseSite,
    width: 5,
    depth: 5,
    height: 3,
    wall: 'sandstone',
    roof: 'sandstone',
    door: 'south',
    windows: true
  })
}
