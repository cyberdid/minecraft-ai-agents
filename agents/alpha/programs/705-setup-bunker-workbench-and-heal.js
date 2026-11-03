// programs/705-setup-bunker-workbench-and-heal.js
console.log('=== Program 705: Setup Bunker Workbench, Heal & Coordinate ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Raise shield against any Nether threats
bot.activateItem(true);
globalThis.configureFireAvoidance();

// 2. Place crafting table securely inside bunker trench
if (lib.count('crafting_table') > 0) {
  const tablePos = new Vec3(42, 60, -6);
  const cur = bot.blockAt(tablePos);
  if (cur && (cur.name === 'air' || cur.name === 'cave_air')) {
    try {
      await lib.place('crafting_table', tablePos.x, tablePos.y, tablePos.z);
      console.log(`Placed crafting table at ${lib.fmt(tablePos)}!`);
      bot.chat('alpha: Placed crafting table at Nether bunker trench (42, 60, -6)!');
    } catch (e) {
      console.log('Place table note:', e.message);
    }
  }
}

// 3. Check for nearby teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist ${dist}m), held: ${p.entity.heldItem?.name}`);
  }
}

// 4. Pickup any items nearby
await lib.pickup(4.0);

// Wait a few seconds for natural HP regeneration from food (food = 19/20)
console.log('Regenerating HP... current HP:', bot.health);
await sleep(4000);
console.log('HP after regen:', bot.health);

// Scan for nether_gold_ore within 24m
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
if (goldOreId) {
  const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 24, count: 10 });
  console.log(`Found ${ores.length} gold ores within 24m:`, ores.map(p => lib.fmt(p)).join(', '));
}

// Scan for nearby Piglins
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Found ${piglins.length} Piglins:`);
for (const pig of piglins.slice(0, 5)) {
  console.log(` - Piglin at ${lib.fmt(pig.position)} dist=${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}

bot.chat(`alpha: Bunker fortified. HP: ${bot.health.toFixed(1)}/20. Holding 2 gold ingots + 1 nugget. Ready for Piglin bartering!`);
console.log('=== Program 705 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
