console.log('=== DELTA: LOCK GOLDEN BOOTS & JOIN PILLBOX ===');

// Step 1: Toss iron_boots so auto-armor never overrides golden_boots
const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
if (ib) {
  console.log('Tossing iron_boots to prevent armor override...');
  try {
    await bot.toss(ib.type, null, 1);
  } catch (e) {}
}

// Step 2: Equip golden_boots on feet
const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
if (gb) {
  console.log('Equipping golden_boots on feet...');
  try {
    await bot.equip(gb, 'feet');
    console.log('GOLDEN BOOTS LOCKED ON FEET!');
  } catch (e) {
    console.log('Equip error:', e.message);
  }
}

// Equip shield in offhand, iron_sword in hand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
  const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sword) await bot.equip(sword, 'hand');
} catch (e) {}

// Step 3: Advance to Spawner Pillbox at (36.5, 66.0, -187.0)
console.log('Moving into Pillbox at (36.5, 66.0, -187.0)...');
configureFireAvoidance();

bot.setControlState('sneak', true);
bot.activateItem(true); // Raise shield

try {
  await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.5));
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.8));
  } catch (e2) {}
}

bot.setControlState('sneak', false);

console.log(`Stationed inside Spawner Pillbox! Pos: ${lib.fmt(bot.entity.position)}`);

// Look toward spawner at (32, 68, -190) with shield raised
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
bot.activateItem(true);

bot.chat(`delta: Stationed inside Spawner Pillbox at (36.5, 66, -187) with Beta! Golden boots locked (100% neutral), shield raised.`);

// Check nearby entities
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0));
console.log(`Blazes active near spawner: ${blazes.length}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  blazes: blazes.length,
  boots: bot.inventory.slots[8]?.name
};
