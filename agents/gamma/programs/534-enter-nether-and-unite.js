// programs/534-enter-nether-and-unite.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 534: ENTER NETHER & UNITE FOR MILESTONE 9 ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Ensure golden_boots stay equipped
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    console.log('Equipped golden_boots!');
  }
}

// Step 2: Ensure shield in offhand and sword equipped
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}
try { await lib.equipWeapon(); } catch (e) {}

// Step 3: Enter Nether Portal using preloaded helper
bot.chat('gamma: Entering Nether Portal to unite with Alpha & Beta for Milestone 9!');
console.log('Entering Nether Portal...');
const portalRes = await globalThis.enterNetherPortal(25000);
console.log('Portal transit result:', JSON.stringify(portalRes));

if (bot.game.dimension !== 'the_nether') {
  console.log('Warp failed or still in Overworld. Pos:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('SUCCESS: Warped to the_nether! Pos:', lib.fmt(bot.entity.position));

// Step 4: Check teammates nearby in Nether
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Teammates in Nether (${players.length}):`);
for (const p of players) {
  const d = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`  ${p.username} at ${lib.fmt(p.position)} (dist: ${d}m), held: ${p.heldItem?.name}`);
}

bot.chat(`gamma: In the_nether at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20, Food: ${bot.food}/20. Golden boots equipped! Marching to Fortress Bunker!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  playersCount: players.length,
  goldenBoots: bot.inventory.slots[8]?.name === 'golden_boots',
  inv: lib.inv()
};
