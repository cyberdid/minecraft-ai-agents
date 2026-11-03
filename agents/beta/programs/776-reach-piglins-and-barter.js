// programs/776-reach-piglins-and-barter.js
console.log('=== Program 776: Reach Piglin Zone & Barter for Ender Pearls ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Gold ingots on Beta:', lib.count('gold_ingot'));
console.log('Wearing feet slot:', bot.inventory.slots[8]?.name);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden_boots equipped
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

// Equip stone pickaxe in hand, shield in offhand
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

configureFireAvoidance();

// Safe ridge waypoints leading to Piglin spawn area (z=-70 to z=-115)
const piglinZoneWaypoints = [
  new Vec3(61.5, 67, -70),
  new Vec3(61.5, 67, -75),
  new Vec3(62.0, 67, -80),
  new Vec3(61.0, 66, -90),
  new Vec3(61.0, 66, -100),
  new Vec3(50.0, 65, -115)
];

let bartersDone = 0;
let initialPearls = lib.count('ender_pearl');

for (let i = 0; i < piglinZoneWaypoints.length && !isCancelled(); i++) {
  const wp = piglinZoneWaypoints[i];
  console.log(`Marching to WP ${i + 1}/${piglinZoneWaypoints.length}: ${lib.fmt(wp)}...`);
  if (typeof globalThis.clearFireAhead === 'function') await globalThis.clearFireAhead();

  // Sneak and raise shield
  bot.setControlState('sneak', true);
  bot.activateItem(true);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.8));
    } catch (e2) {}
  }

  console.log(`Arrived near WP ${i + 1}. Pos: ${lib.fmt(bot.entity.position)}`);

  // Scan for adult Piglins within 25m
  const piglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' &&
    e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 25
  );

  console.log(`Piglins detected within 25m: ${piglins.length}`);

  if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
    piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
    const targetPiglin = piglins[0];
    const dist = bot.entity.position.distanceTo(targetPiglin.position);
    console.log(`Approaching Piglin at ${lib.fmt(targetPiglin.position)} (dist: ${dist.toFixed(1)}m)...`);
    bot.chat('Beta: Approaching neutral Piglin on ridge for bartering!');

    try {
      await bot.pathfinder.goto(new goals.GoalNear(targetPiglin.position.x, targetPiglin.position.y, targetPiglin.position.z, 3.5));
      await bot.lookAt(targetPiglin.position.offset(0, 1.2, 0), true);

      console.log('Tossing gold ingot to Piglin...');
      await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
      bartersDone++;

      console.log('Holding position with shield raised for 8.5s...');
      bot.activateItem(true);
      await sleep(8500);
      bot.deactivateItem();

      await lib.pickup(6.0);
      const newPearls = lib.count('ender_pearl');
      console.log(`Ender Pearls count now: ${newPearls} (gained: ${newPearls - initialPearls})`);

      if (newPearls > initialPearls) {
        bot.chat(`Beta: GOT ENDER PEARL FROM BARTER! Total: ${newPearls}/12!`);
        initialPearls = newPearls;
      }
    } catch (err) {
      console.log('Barter execution note:', err.message);
    }
  }

  // Scan for nether_gold_ore within 10m
  const localOres = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 10,
    count: 3
  }).filter(p => p.y >= 62);

  for (const op of localOres) {
    if (isCancelled()) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.2));
      const b = bot.blockAt(op);
      if (b && b.name === 'nether_gold_ore') {
        const curPick = bot.inventory.items().find(it => it.name.includes('pickaxe'));
        if (curPick) await bot.equip(curPick, 'hand');
        await bot.dig(b);
        await sleep(200);
        await lib.pickup(3.5);
      }
    } catch (e) {}
  }

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), holding position.`);
    break;
  }
}

bot.setControlState('sneak', false);
await lib.pickup(5.0);
bot.activateItem(true); // Keep shield raised at program termination

console.log('=== Program 776 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls on Beta:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'), 'Nuggets:', lib.count('gold_nugget'));
console.log('Barters performed:', bartersDone);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  barters_done: bartersDone
};
