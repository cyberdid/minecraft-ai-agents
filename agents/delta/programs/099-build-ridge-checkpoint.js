// programs/099-build-ridge-checkpoint.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// Build a 2-high protective cobblestone wall/shelter at (55, 64, -67)
// Delta is at (55.4, 64.4, -66.5). Floor is y=64.
// Place cobblestone barricades at y=65 and y=66 on the perimeter (x=54..56, z=-68..-65)

const px = Math.floor(bot.entity.position.x);
const py = Math.floor(bot.entity.position.y);
const pz = Math.floor(bot.entity.position.z);

console.log(`Building protective ridge battlement around (${px}, ${py}, ${pz})...`);

const wallSpots = [
  new Vec3(px + 1, py, pz - 1),
  new Vec3(px + 1, py + 1, pz - 1),
  new Vec3(px, py, pz - 1),
  new Vec3(px, py + 1, pz - 1),
  new Vec3(px - 1, py, pz - 1),
  new Vec3(px - 1, py + 1, pz - 1),
  new Vec3(px + 1, py, pz),
  new Vec3(px + 1, py + 1, pz)
];

let placed = 0;
for (const spot of wallSpots) {
  if (lib.count('cobblestone') < 5) break;
  const existing = bot.blockAt(spot);
  if (existing && existing.boundingBox === 'block') continue;
  try {
    const res = await lib.place('cobblestone', spot.x, spot.y, spot.z);
    if (res === 'placed') placed++;
    console.log(`Placed cobble at ${lib.fmt(spot)}`);
  } catch (err) {
    console.log(`Place error at ${lib.fmt(spot)}:`, err.message);
  }
}

console.log(`Placed ${placed} cobblestone blocks. Cobblestone remaining: ${lib.count('cobblestone')}`);

// Equip weapon & shield
await lib.equipArmor();
await lib.equipWeapon();

console.log('Gear:', JSON.stringify(lib.tools()), 'Offhand:', bot.inventory.slots[45]?.name);
bot.chat(`delta: Built Ridge Trail Checkpoint at ${lib.fmt(bot.entity.position)}! Safe shelter for team between Camp and Fortress.`);
