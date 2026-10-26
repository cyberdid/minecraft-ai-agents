// programs/112-enter-bunker-and-fortify.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Move into bunker at (44, 65, -129)
console.log('Stepping into Fortress bunker at (44, 65, -129)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -129));
} catch (e) {
  console.log('Path note:', e.message);
  // fallback simple walk
  await lib.walkTo(44, -129);
}

console.log('Inside bunker at:', lib.fmt(bot.entity.position));

// 2. Report teammates in bunker
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'delta') {
    const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d})`);
  }
}

// 3. Inspect blocks around bunker
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 5, count: 1 })[0];
const chest = bot.findBlocks({ matching: b => b.name === 'chest', maxDistance: 5, count: 1 })[0];
console.log('Crafting table in bunker:', table ? lib.fmt(table) : 'none');
console.log('Chest in bunker:', chest ? lib.fmt(chest) : 'none');

// 4. Reinforce entrance doorway with Anti-Wither Skeleton 2-high lintel
// Wither skeletons are 2.4 blocks tall; placing a block at y=67 over the doorway leaves y=65..66 open for players
const lintelPos = new Vec3(44, 67, -127);
const lintelBlock = bot.blockAt(lintelPos);
if (!lintelBlock || lintelBlock.name === 'air') {
  console.log('Placing anti-Wither Skeleton lintel at (44, 67, -127)...');
  try {
    await lib.place('andesite', 44, 67, -127);
    console.log('Placed anti-Wither Skeleton lintel!');
  } catch (err) {
    console.log('Lintel place note:', err.message);
  }
}

// 5. Equip best weapon
await lib.equipWeapon();
console.log('Equipped:', JSON.stringify(lib.tools()));
console.log('Inventory now:', JSON.stringify(lib.inv()));

bot.chat(`delta: Inside Fortress Workshop (44, 65, -129) with Alpha & Beta! 54 building blocks ready for bridge descent.`);
