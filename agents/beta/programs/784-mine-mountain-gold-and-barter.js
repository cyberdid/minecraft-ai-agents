// programs/784-mine-mountain-gold-and-barter.js
console.log('=== Program 784: Mine Mountain Gold & Barter at Cross-Bridge ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden_boots equipped
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Feet slot:', bot.inventory.slots[8]?.name);

// Shield in offhand
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}
bot.activateItem(true); // Keep shield raised

// Equip iron weapon
const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// Patrol waypoints along covered tunnel to Spawner Cross-Bridge (38, 65, -176)
const waypoints = [
  new Vec3(44, 65, -155),
  new Vec3(44, 65, -165),
  new Vec3(41, 65, -172),
  new Vec3(38, 65, -176)
];

let minedOres = 0;
let barters = 0;
let initialPearls = lib.count('ender_pearl');

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Advancing to tunnel WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  bot.activateItem(true); // Raise shield

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }

  // Scan for nether_gold_ore within 8m of this waypoint
  const localOres = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 8,
    count: 5
  }).filter(p => p.y >= 63 && p.y <= 68);

  for (const op of localOres) {
    if (isCancelled()) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.2));
      const b = bot.blockAt(op);
      if (b && b.name === 'nether_gold_ore') {
        const ironPick = bot.inventory.items().find(it => it.name === 'iron_pickaxe') || bot.inventory.items().find(it => it.name.includes('pickaxe'));
        if (ironPick) await bot.equip(ironPick, 'hand');
        await bot.dig(b);
        minedOres++;
        await sleep(150);
        await lib.pickup(3.5);
      }
    } catch (e) {}
  }

  // Scan for adult Piglins within 16m
  const piglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
  );

  if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
    const targetPiglin = piglins[0];
    console.log(`Found Piglin at ${lib.fmt(targetPiglin.position)}! Tossing gold ingot...`);
    try {
      await bot.lookAt(targetPiglin.position.offset(0, 1.2, 0), true);
      await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
      barters++;
      bot.activateItem(true);
      await sleep(8500);
      await lib.pickup(5.0);

      const curPearls = lib.count('ender_pearl');
      if (curPearls > initialPearls) {
        bot.chat(`Beta: GOT ENDER PEARL FROM PIGLIN BARTER! Total: ${curPearls}/12!`);
        initialPearls = curPearls;
      }
    } catch (e) {}
  }

  // Scan for Endermen outside tunnel (dist <= 24m)
  const endermen = Object.values(bot.entities).filter(e =>
    e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 24
  );

  if (endermen.length > 0) {
    const em = endermen[0];
    console.log(`Enderman spotted at ${lib.fmt(em.position)}! Staring from under 2-high tunnel roof...`);
    try {
      // Look at Enderman head to aggro
      await bot.lookAt(em.position.offset(0, 2.8, 0), true);
      await sleep(2500);

      // Equip sword
      const curSword = bot.inventory.items().find(it => it.name === 'iron_sword') || bot.inventory.items().find(it => it.name.includes('sword'));
      if (curSword) await bot.equip(curSword, 'hand');

      // Attack if it comes within melee reach (<= 4.0m)
      const attackStart = Date.now();
      while (Date.now() - attackStart < 8000 && em.isValid && (em.health === undefined || em.health > 0) && !isCancelled()) {
        const dist = bot.entity.position.distanceTo(em.position);
        if (dist <= 4.2) {
          bot.attack(em);
          await sleep(650);
        } else {
          await bot.lookAt(em.position.offset(0, 1.5, 0), true);
          await sleep(200);
        }
      }
      await sleep(500);
      await lib.pickup(5.0);
      const pearlsAfter = lib.count('ender_pearl');
      if (pearlsAfter > initialPearls) {
        bot.chat(`Beta: SLAIN ENDERMAN! GAINED ENDER PEARL! Total: ${pearlsAfter}/12!`);
        initialPearls = pearlsAfter;
      }
    } catch (e) {
      console.log('Enderman combat note:', e.message);
    }
  }

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), holding safe position.`);
    break;
  }
}

await lib.pickup(6.0);
bot.activateItem(true); // Keep shield raised

console.log('=== Program 784 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet slot:', bot.inventory.slots[8]?.name);
console.log('Ender Pearls on Beta:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'), 'Nuggets:', lib.count('gold_nugget'));
console.log('Mined ores:', minedOres, 'Barters:', barters);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  mined_ores: minedOres,
  barters_done: barters
};
