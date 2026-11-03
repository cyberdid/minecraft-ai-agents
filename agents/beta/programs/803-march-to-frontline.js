// programs/803-march-to-frontline.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 803: March to Frontline using Autoload Helper ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Equipped golden_boots on feet'); } catch (e) {}
  }
}

// Ensure shield in offhand
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); console.log('Equipped shield in off-hand'); } catch (e) {}
}

// Ensure weapon in main hand
const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sw) {
  try { await bot.equip(sw, 'hand'); } catch (e) {}
}

// Announce to team
bot.chat('Beta: Marching into Nether via marchToSpawnerPillbox helper to unite with team for Milestone 9!');

// Execute fast battle-tested march
const marchResult = await globalThis.marchToSpawnerPillbox();
console.log('marchToSpawnerPillbox finished:', JSON.stringify(marchResult));

// Re-verify golden boots after march
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Re-equipped golden_boots!'); } catch (e) {}
  }
}

// Check surroundings at arrival
console.log('Current pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Teammates nearby:', teammates.map(t => `${t.username} at ${lib.fmt(t.position)}`).join(', '));

const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) < 20);
console.log(`Piglins nearby (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) < 30);
console.log(`Endermen nearby (${endermen.length}):`, endermen.map(e => `${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`).join(', '));

console.log('Ender pearls in inventory:', lib.count('ender_pearl'));
console.log('Gold ingots in inventory:', lib.count('gold_ingot'));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  piglins: piglins.length,
  endermen: endermen.length,
  ender_pearls: lib.count('ender_pearl')
};
