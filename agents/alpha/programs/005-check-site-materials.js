// programs/005-check-site-materials.js
const site = { x: 292, y: 72, z: -58 };
const house = lib.shapes.house({
  ...site,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'cobblestone',
  roof: 'cobblestone',
  door: 'south',
  windows: false
});

console.log('House block count:', house.length);
const mat = lib.materials(house);
console.log('Materials needed:', JSON.stringify(mat.need));
console.log('Materials missing:', JSON.stringify(mat.missing));

// Check what blocks are currently in the 5x5 box from y=71 to 75
let occupiedCount = 0;
for (let y = 72; y <= 74; y++) {
  for (let z = -58; z <= -54; z++) {
    for (let x = 292; x <= 296; x++) {
      const b = lib.blockAt(x, y, z);
      if (b && b.boundingBox === 'block') {
        occupiedCount++;
      }
    }
  }
}
console.log('Occupied solid blocks in walls volume:', occupiedCount);

// Check if beta is nearby
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log('Beta is at:', lib.fmt(beta.entity.position));
} else {
  console.log('Beta entity not in sight');
}

bot.chat('alpha: site at (292, 72, -58). Missing cobblestone: ' + (mat.missing.cobblestone || 0));
return { missing: mat.missing, occupied: occupiedCount, time: lib.time() };
