// programs/396-receive-team-and-build-deck-stairs.js
console.log('=== Program 396: Receive Team Supplies & Build Deck Stairs ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Alert Gamma and Delta arriving at the bunker
bot.chat('team: Alpha and Beta inside sealed bunker (44, 65, -129)! Gamma & Delta bring food/blocks to door (44, 65, -128)!');

// 2. Wait and pick up supplies delivered by teammates
for (let round = 0; round < 6; round++) {
  if (isCancelled()) break;
  await lib.pickup(4);
  await sleep(1000);
}

// 3. Eat any food picked up
const foodItems = bot.inventory.items().filter(it => 
  ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef', 'porkchop'].includes(it.name)
);
console.log('Food available:', foodItems.map(it => `${it.name}x${it.count}`));

for (const fi of foodItems) {
  while (bot.food < 20 && bot.inventory.count(fi.type) > 0) {
    console.log(`Eating ${fi.name}...`);
    try { await globalThis.safeEat(fi.name); } catch (e) { break; }
  }
}

// Equip armor if received
await lib.equipArmor();

// 4. Regenerate health inside safe bunker
if (bot.food >= 18 && bot.health < 20) {
  console.log('Regenerating health inside safe bunker...');
  for (let r = 0; r < 12 && bot.health < 20; r++) {
    if (isCancelled()) break;
    await sleep(1500);
    console.log(`HP: ${bot.health}/20, Food: ${bot.food}/20`);
  }
}

// 5. Scan teammates inside/around bunker
for (const name of ['gamma', 'delta', 'beta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

// 6. Scan for Fortress floor targets around y=54
const targetBrick = bot.findBlocks({
  matching: mcData.blocksByName.nether_bricks?.id,
  maxDistance: 24,
  count: 10
});
console.log(`Nether brick blocks nearby: ${targetBrick.length}`);

bot.chat(`team: Fortress Workshop status: Alpha HP=${bot.health}/20, Food=${bot.food}/20. All 4 players converging at (44, 65, -129) for Fortress assault!`);

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
