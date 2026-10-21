// team/autoload.js - shared helpers and constants
globalThis.baseSite = { x: 292, y: 72, z: -58 };

globalThis.getBaseHouse = () => {
  return lib.shapes.house({
    x: 292,
    y: 72,
    z: -58,
    width: 5,
    depth: 5,
    height: 3,
    wall: 'cobblestone',
    roof: 'oak_planks',
    door: 'south',
    windows: false
  });
};
