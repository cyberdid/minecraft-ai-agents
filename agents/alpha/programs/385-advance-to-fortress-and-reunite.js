// programs/385-advance-to-fortress-and-reunite.js
console.log('=== Program 385: Advance to Fortress & Reunite with Beta ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Check if Nether bunker has a chest
const nearbyChests = bot.findBlocks({
  matching: mcData.blocksByName.chest?.id,
  maxDistance: 8,
  count: 3
});
console.log(`Bunker chests found: ${nearbyChests.length}`);
if (nearbyChests.length > 0) {
  try {
    const cp = nearbyChests[0];
    const items = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log('Bunker chest contents:', JSON.stringify(items));
    const toTake = {};
    for (const [name, count] of Object.entries(items)) {
      if (['iron_sword', 'stone_sword', 'iron_pickaxe', 'stone_pickaxe', 'shield', 'cobblestone', 'bread', 'cooked_beef'].includes(name)) {
        toTake[name] = count;
      }
    }
    if (Object.keys(toTake).length > 0) {
      await lib.withdraw(toTake, cp.x, cp.y, cp.z);
      await lib.equipArmor();
    }
  } catch (e) {
    console.log('Bunker chest read error:', e.message);
  }
}

// 2. Alert Beta that Alpha is advancing along the ridge trail
bot.chat('team: Alpha moving from Nether portal along ridge trail to Fortress (45, 65, -131)!');

// 3. Stage 1: Ridge Checkpoint (55, 64, -67)
console.log('Moving towards Stage 1: Ridge Checkpoint (55, 64, -67)...');
try {
  await lib.goTo(55, 64, -67, 3, { timeoutMs: 30000 });
  console.log('Reached Ridge Checkpoint at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 note:', e.message);
  try {
    await lib.goToXZ(55, -67, { timeoutMs: 25000 });
  } catch (e2) {}
}

console.log('Alpha pos:', lib.fmt(bot.entity.position));

// 4. Stage 2: Fortress Entrance (45, 65, -116)
console.log('Advancing to Stage 2: Fortress Entrance (45, 65, -116)...');
try {
  await lib.goTo(45, 65, -116, 3, { timeoutMs: 30000 });
  console.log('Reached Fortress Entrance at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 2 note:', e.message);
  try {
    await lib.goToXZ(45, -116, { timeoutMs: 25000 });
  } catch (e2) {}
}

console.log('Alpha pos:', lib.fmt(bot.entity.position));

// 5. Stage 3: Walkway Drop recovery & Beta linkup (45, 65, -131)
console.log('Advancing along walkway to (45, 65, -131)...');
try {
  await lib.goTo(45, 65, -131, 2, { timeoutMs: 20000 });
} catch (e) {
  console.log('Stage 3 note:', e.message);
  try {
    await lib.goToXZ(45, -131, { timeoutMs: 15000 });
  } catch (e2) {}
}

console.log('Alpha at recovery site:', lib.fmt(bot.entity.position));

// 6. Collect all item drops in area
console.log('Collecting drops...');
await sleep(500);
await lib.pickup(12);

// Re-equip full armor and shield
await lib.equipArmor();

// Locate Beta
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log(`Beta located at ${lib.fmt(beta.entity.position)}, dist=${bot.entity.position.distanceTo(beta.entity.position).toFixed(1)}m`);
}

bot.chat(`team: Alpha linked with Beta at Fortress (${lib.fmt(bot.entity.position)})! Recovered gear: ${JSON.stringify(lib.tools())}. HP: ${bot.health}/20.`);

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
