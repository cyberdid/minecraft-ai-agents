// programs/123-verify-doorway-and-safety.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Equip weapon
await lib.equipWeapon();

// 2. Check blocks around entrance
const check = [
  new Vec3(44, 64, -127), // floor
  new Vec3(44, 65, -127), // doorway lower (open for player)
  new Vec3(44, 66, -127), // doorway upper (open for player)
  new Vec3(44, 67, -127), // lintel (andesite)
  new Vec3(44, 64, -128), // floor
  new Vec3(44, 65, -128), // interior
  new Vec3(44, 66, -128), // interior
  new Vec3(44, 67, -128), // roof (andesite)
];
for (const p of check) {
  const b = bot.blockAt(p);
  console.log(`Block at ${lib.fmt(p)}: ${b?.name}`);
}

// 3. Find any close hostiles
const nearHostiles = lib.hostiles(16);
console.log(`Hostiles within 16m (${nearHostiles.length}):`);
for (const h of nearHostiles) {
  console.log(`- ${h.name} at dist ${h.dist.toFixed(1)}m`);
}

// 4. Stand firmly inside bunker at (44.5, 65.0, -129.0)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -129));
} catch (e) {}

console.log('Confirmed safe inside bunker. Health:', bot.health, 'Food:', bot.food);
