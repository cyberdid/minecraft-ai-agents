console.log('=== Program 923: Barter With Tunnel Piglin ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'gold_ingots:', lib.count('gold_ingot'));

// 1. Ensure golden boots equipped
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Feet slot 8:', bot.inventory.slots[8]?.name);

// 2. Advance inside covered tunnel towards (44, 65, -138)
const tunnelTarget = new Vec3(44.0, 65.0, -138.0);
console.log(`Advancing along covered tunnel to ${lib.fmt(tunnelTarget)}...`);

try {
  await lib.goTo(tunnelTarget.x, tunnelTarget.y, tunnelTarget.z, 1.5, { timeoutMs: 6000, dig: false });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(tunnelTarget.x, tunnelTarget.y, tunnelTarget.z, 1.5));
  } catch (e2) {}
}

console.log('At tunnel position:', lib.fmt(bot.entity.position));

// 3. Find nearby Piglins
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'piglin' &&
  bot.entity.position.distanceTo(e.position) <= 12
);

console.log(`Nearby Piglins (${piglins.length}):`);
for (const p of piglins) {
  console.log(`  Piglin at ${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

let ingots = lib.count('gold_ingot');
const initialPearls = lib.count('ender_pearl');

if (piglins.length > 0 && ingots > 0) {
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const targetPiglin = piglins[0];
  console.log(`Targeting Piglin at ${lib.fmt(targetPiglin.position)} for bartering!`);

  for (let r = 0; r < ingots && !checkCancelled(); r++) {
    const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!gold) break;

    bot.chat(`Beta: Barter round #${r + 1}: Tossing gold ingot to neutral Piglin!`);
    await bot.lookAt(targetPiglin.position.offset(0, 1.0, 0), true);
    await bot.toss(gold.type, null, 1);
    console.log('Tossed 1 gold ingot! Waiting 8.0s for bartering...');
    await sleep(8000);

    // Vacuum drops
    await lib.pickup(5.0);
    const curPearls = lib.count('ender_pearl');
    console.log(`Round ${r + 1} complete. Ender Pearls: ${curPearls}`);
    if (curPearls > initialPearls) {
      bot.chat(`Beta: ENDER PEARL ACQUIRED! Total pearls: ${curPearls}/12!`);
    }
  }
} else if (ingots === 0) {
  console.log('No gold ingots in inventory.');
} else {
  console.log('No Piglins within 12m of tunnel position.');
}

const finalPearls = lib.count('ender_pearl');
console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`Beta: Barter cycle complete. Ender Pearls: ${finalPearls}/12, Remaining Gold: ${lib.count('gold_ingot')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  ender_pearls: finalPearls,
  gold_ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
