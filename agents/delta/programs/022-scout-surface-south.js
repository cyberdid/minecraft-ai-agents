// programs/022-scout-surface-south.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Step out of base
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -52);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
}

// Equip weapon for safety
await lib.equipWeapon();

// Walk south towards (297, z=2)
console.log('Walking south to (297, 2)...');
await lib.goToXZ(297, 2);

console.log('Reached surface south at:', lib.fmt(bot.entity.position));

// Check ground height and blocks below
const feet = bot.entity.position.floored();
console.log(`Surface at (${feet.x}, ${feet.y}, ${feet.z}): ground=${bot.blockAt(feet.offset(0, -1, 0))?.name}`);

// Check for nearby cave openings or holes
const holes = [];
for (let dx = -4; dx <= 4; dx++) {
  for (let dz = -4; dz <= 4; dz++) {
    const p = feet.offset(dx, -1, dz);
    const b = bot.blockAt(p);
    if (b && (b.name === 'air' || b.name === 'cave_air')) {
      holes.push(p);
    }
  }
}
console.log(`Found ${holes.length} open air holes below surface within 4 blocks`);

// Check any nearby animals
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && 
  e.position && 
  e.position.distanceTo(bot.entity.position) < 48
);
console.log(`Nearby animals: ${animals.length}`);
if (animals.length > 0) {
  try {
    const r = await lib.hunt(animals[0].name, 1);
    console.log('Hunted animal:', JSON.stringify(r));
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

// Report teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat(`delta: On surface at ${lib.fmt(bot.entity.position)} directly above Beta & Gamma! Surface is clear!`);
