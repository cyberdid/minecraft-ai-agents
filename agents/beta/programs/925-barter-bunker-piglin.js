console.log('=== Program 925: Barter with Bunker Piglin (45, 65, -125) ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'gold_ingots:', lib.count('gold_ingot'));

// 1. Move to (44, 65, -126) near the Piglin at (45, 65, -125)
const targetPos = new Vec3(44.0, 65.0, -127.0);
console.log(`Moving towards bunker entrance ${lib.fmt(targetPos)}...`);

try {
  await lib.goTo(targetPos.x, targetPos.y, targetPos.z, 1.5, { timeoutMs: 6000, dig: false });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 1.5));
  } catch (e2) {}
}

console.log('Arrived at:', lib.fmt(bot.entity.position));

// 2. Find the closest Piglin within 8m
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 8.0
);

console.log(`Piglins within 8m: ${piglins.length}`);
for (const p of piglins) {
  console.log(`  Piglin id=${p.id} at ${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

let ingots = lib.count('gold_ingot');
const initialPearls = lib.count('ender_pearl');

if (piglins.length > 0 && ingots > 0) {
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const pig = piglins[0];
  console.log(`Bartering with Piglin id=${pig.id} at ${lib.fmt(pig.position)} (dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)...`);

  // Move right up to 2m
  try {
    await bot.pathfinder.goto(new goals.GoalNear(pig.position.x, pig.position.y, pig.position.z, 2.0));
  } catch (e) {}

  for (let round = 1; round <= ingots && !checkCancelled(); round++) {
    const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!gold) break;

    // Equip gold in hand
    await bot.equip(gold, 'hand');
    await bot.lookAt(pig.position.offset(0, 1.0, 0), true);
    
    console.log(`Round ${round}: Attempting direct give to Piglin...`);
    bot.activateEntity(pig);
    await sleep(400);

    // If still have the same number of ingots, toss it
    if (lib.count('gold_ingot') === ingots - (round - 1)) {
      console.log('Direct give did not consume ingot; tossing 1 gold ingot to Piglin feet...');
      await bot.lookAt(pig.position.offset(0, 0.2, 0), true);
      await bot.toss(gold.type, null, 1);
    } else {
      console.log('Direct give succeeded! Piglin is inspecting ingot.');
    }

    bot.chat(`Beta: Barter round #${round} initiated with neutral Piglin!`);
    console.log('Waiting 8.0s for Piglin barter trade...');
    await sleep(8000);

    // Step close and pickup barter drops
    try {
      await bot.pathfinder.goto(new goals.GoalNear(pig.position.x, pig.position.y, pig.position.z, 1.0));
    } catch (e) {}
    await lib.pickup(4.0);

    const curPearls = lib.count('ender_pearl');
    console.log(`Round ${round} complete. Ender Pearls in inventory: ${curPearls}`);
    if (curPearls > initialPearls) {
      bot.chat(`Beta: MILESTONE 9 UPDATE: Acquired Ender Pearl(s)! Total: ${curPearls}/12!`);
    }
  }
} else {
  console.log(`Cannot barter: piglins=${piglins.length}, ingots=${ingots}`);
}

const finalPearls = lib.count('ender_pearl');
console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`Beta: Barter round finished! Pearls: ${finalPearls}/12, Remaining gold: ${lib.count('gold_ingot')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  ender_pearls: finalPearls,
  gold_ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
