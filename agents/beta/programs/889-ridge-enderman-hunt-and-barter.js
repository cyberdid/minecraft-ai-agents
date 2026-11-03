// programs/889-ridge-enderman-hunt-and-barter.js
console.log('=== Program 889: Ridge Enderman Hunt & Piglin Barter ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

// Equip sword
const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

globalThis.configureFireAvoidance();
console.log('Beta start pos:', lib.fmt(bot.entity.position));

// Ridge waypoints South towards Portal / (49, 35, -22)
const southWps = [
  new Vec3(61, 66, -100),
  new Vec3(62.0, 67.0, -80),
  new Vec3(61.5, 67.0, -65),
  new Vec3(63, 66, -35),
  new Vec3(63, 65, -20)
];

for (let i = 0; i < southWps.length && !checkCancelled(); i++) {
  const wp = southWps[i];
  console.log(`Advancing to ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 7000 });
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0)); } catch (e2) {}
  }

  // Scan for Endermen
  const endermen = Object.values(bot.entities).filter(e =>
    e.isValid &&
    e.name === 'enderman' &&
    bot.entity.position.distanceTo(e.position) <= 32
  );

  if (endermen.length > 0) {
    console.log(`Spotted ${endermen.length} Endermen near ${lib.fmt(bot.entity.position)}!`);
    const end = endermen[0];

    // Ensure 2-high protective ceiling over player
    const p = bot.entity.position;
    const ceilPos = new Vec3(Math.floor(p.x), Math.floor(p.y) + 2, Math.floor(p.z));
    const cb = bot.blockAt(ceilPos);
    if (!cb || cb.boundingBox !== 'block') {
      const mat = bot.inventory.items().find(it => it.name === 'cobblestone' || it.name === 'netherrack');
      if (mat) {
        try { await lib.place(mat.name, ceilPos.x, ceilPos.y, ceilPos.z); } catch (e) {}
      }
    }

    // Provoke Enderman by looking at head
    bot.chat(`Beta: Provoking Enderman at ${lib.fmt(end.position)} from 2-high protective cover!`);
    await bot.lookAt(end.position.offset(0, 2.7, 0), true);
    await sleep(1000);

    // Strike if within melee reach
    const startW = Date.now();
    while (Date.now() - startW < 10000 && !checkCancelled()) {
      const target = Object.values(bot.entities).find(e =>
        e.isValid && e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 4.0
      );
      if (target) {
        if (sword) await bot.equip(sword, 'hand');
        await bot.lookAt(target.position.offset(0, 1.5, 0), true);
        bot.attack(target);
        await sleep(650);
      } else {
        await sleep(300);
      }
    }

    await lib.pickup(5.0);
    const pCount = lib.count('ender_pearl');
    if (pCount > 0) {
      bot.chat(`Beta: ENDER PEARL HARVESTED! Total pearls: ${pCount}/12!`);
      break;
    }
  }

  // Scan for Piglins to barter
  const piglins = Object.values(bot.entities).filter(e =>
    e.isValid &&
    e.name === 'piglin' &&
    bot.entity.position.distanceTo(e.position) <= 16
  );

  if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
    const pig = piglins[0];
    const gold = bot.inventory.items().find(it => it.name === 'gold_ingot');
    if (gold) {
      bot.chat(`Beta: Bartering gold ingot with Piglin at ${lib.fmt(pig.position)}!`);
      await bot.lookAt(pig.position.offset(0, 1.0, 0), true);
      await bot.toss(gold.type, null, 1);
      await sleep(7500);
      await lib.pickup(5.0);
      const pCount = lib.count('ender_pearl');
      if (pCount > 0) {
        bot.chat(`Beta: ENDER PEARL HARVESTED FROM BARTER! Total pearls: ${pCount}/12!`);
        break;
      }
    }
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`Beta: Ridge hunt update — Pos: ${lib.fmt(bot.entity.position)}, Pearls: ${lib.count('ender_pearl')}, Gold: ${lib.count('gold_ingot')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot')
};
