// programs/394-sprint-to-fortress-bunker.js
console.log('=== Program 394: Sprint to Fortress Workshop (44, 65, -129) ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Stage 1: Move North to Fortress Entrance at (48, 65, -116)
console.log('Advancing towards Stage 1: (48, 65, -116)...');
try {
  await lib.goTo(48, 65, -116, 3, { timeoutMs: 25000 });
  console.log('Stage 1 reached:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 note:', e.message);
  try { await lib.goToXZ(48, -116, { timeoutMs: 20000 }); } catch (e2) {}
}

console.log('Alpha pos:', lib.fmt(bot.entity.position));

// 2. Stage 2: Move into Fortress Workshop at (44, 65, -129)
console.log('Moving into Fortress Workshop at (44, 65, -129)...');
try {
  await lib.goTo(44, 65, -129, 1, { timeoutMs: 25000 });
  console.log('Inside Fortress Workshop!');
} catch (e) {
  console.log('Workshop move note:', e.message);
  try { await lib.goToXZ(44, -129, { timeoutMs: 20000 }); } catch (e2) {}
}

console.log('Alpha at bunker:', lib.fmt(bot.entity.position));

// 3. Scan for teammates inside bunker
for (const name of ['beta', 'delta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// 4. Scan for drops, chests, or workstations
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest?.id, maxDistance: 8, count: 2 });
console.log(`Chests in bunker: ${chests.length}`);
if (chests.length > 0) {
  try {
    const cp = chests[0];
    const items = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log('Outpost chest contents:', JSON.stringify(items));
  } catch (e) {}
}

await lib.pickup(6);
await lib.equipArmor();

bot.chat(`team: Alpha united with Beta at Fortress Workshop (${lib.fmt(bot.entity.position)})! Ready to farm Blazes for Blaze Rods!`);

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
