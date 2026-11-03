console.log('=== Program 927: Approach Ridge Piglins & Barter ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'gold_ingots:', lib.count('gold_ingot'));

// Verify golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Feet slot 8:', bot.inventory.slots[8]?.name);

// 1. Move to (43.5, 67.0, -117.5) where the 3 Piglins are grouped
const piglinSpot = new Vec3(43.5, 67.0, -117.5);
console.log(`Advancing to Piglin group at ${lib.fmt(piglinSpot)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(piglinSpot.x, piglinSpot.y, piglinSpot.z, 2.5));
} catch (e) {
  console.log('Pathfinder note:', e.message);
  try {
    await lib.goTo(piglinSpot.x, piglinSpot.y, piglinSpot.z, 2.5, { timeoutMs: 6000, dig: false });
  } catch (e2) {}
}

console.log('Arrived near Piglins! Pos:', lib.fmt(bot.entity.position));

// 2. Find closest Piglin
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 6.0
);

console.log(`Piglins within 6m: ${piglins.length}`);
for (const p of piglins) {
  console.log(`  Piglin id=${p.id} at ${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

let ingots = lib.count('gold_ingot');
const initialPearls = lib.count('ender_pearl');

if (piglins.length > 0 && ingots > 0) {
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const pig = piglins[0];
  console.log(`Bartering with Piglin id=${pig.id} at ${lib.fmt(pig.position)}!`);

  for (let r = 1; r <= ingots && !checkCancelled(); r++) {
    const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!gold) break;

    // Toss directly at Piglin feet
    await bot.lookAt(pig.position.offset(0, 0.2, 0), true);
    await bot.toss(gold.type, null, 1);
    bot.chat(`Beta: Barter round #${r} — Tossed gold ingot to neutral Piglin!`);
    console.log(`Tossed ingot for round #${r}. Waiting 8.0s for barter...`);
    await sleep(8000);

    // Step close and pickup
    try {
      await bot.pathfinder.goto(new goals.GoalNear(pig.position.x, pig.position.y, pig.position.z, 1.2));
    } catch (e) {}
    await lib.pickup(4.0);

    const curPearls = lib.count('ender_pearl');
    console.log(`Round #${r} complete. Ender Pearls in inventory: ${curPearls}`);
    if (curPearls > initialPearls) {
      bot.chat(`Beta: ENDER PEARL ACQUIRED! Total pearls: ${curPearls}/12!`);
    }
  }
} else {
  console.log(`Could not barter: piglins=${piglins.length}, ingots=${ingots}`);
}

const finalPearls = lib.count('ender_pearl');
console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`Beta: Barter session complete. Pearls: ${finalPearls}/12, Remaining Gold: ${lib.count('gold_ingot')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  ender_pearls: finalPearls,
  gold_ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
