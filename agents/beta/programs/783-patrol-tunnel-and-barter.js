// programs/783-patrol-tunnel-and-barter.js
console.log('=== Program 783: Patrol Covered Tunnel, Mine Gold & Barter ===');
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

// Step 1: Scan for all entities within 48m
const allNearby = Object.values(bot.entities).filter(e => e.isValid);
const piglins = allNearby.filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 48);
const endermen = allNearby.filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 48);
const teammates = allNearby.filter(e => e.type === 'player' && e.username !== bot.username && bot.entity.position.distanceTo(e.position) <= 48);

console.log(`Scan: Piglins: ${piglins.length}, Endermen: ${endermen.length}, Teammates: ${teammates.length}`);
for (const pig of piglins) {
  console.log(` - Piglin at ${lib.fmt(pig.position)}, dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}
for (const em of endermen) {
  console.log(` - Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}
for (const tm of teammates) {
  console.log(` - Teammate ${tm.username} at ${lib.fmt(tm.position)}, dist: ${bot.entity.position.distanceTo(tm.position).toFixed(1)}m`);
}

// Step 2: Vacuum any dropped items along the covered tunnel
console.log('Vacuuming dropped items along covered tunnel...');
await lib.pickup(8.0);
let pearls = lib.count('ender_pearl');
console.log(`Ender Pearls currently held: ${pearls}/12`);

// Step 3: If Piglin within reach and Beta or Gamma has gold, barter!
if (piglins.length > 0) {
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const piglin = piglins[0];
  const pDist = bot.entity.position.distanceTo(piglin.position);

  if (lib.count('gold_ingot') > 0) {
    console.log(`Approaching Piglin at ${lib.fmt(piglin.position)} to barter...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.5));
      await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
      bot.chat('Beta: Bartering gold ingot with neutral Piglin in covered tunnel!');
      await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
      bot.activateItem(true);
      await sleep(8500);
      await lib.pickup(6.0);

      const newPearls = lib.count('ender_pearl');
      if (newPearls > pearls) {
        bot.chat(`Beta: GOT ENDER PEARL FROM BARTER! Total: ${newPearls}/12!`);
        pearls = newPearls;
      }
    } catch (e) {
      console.log('Barter note:', e.message);
    }
  }
}

// Step 4: Scan for nether_gold_ore in mountain walls along tunnel (z=-127 to z=-165)
const ores = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 16,
  count: 8
}).filter(p => p.y >= 63 && p.y <= 68);

console.log(`Found ${ores.length} gold ores in tunnel walls:`, ores.map(p => lib.fmt(p)).join(', '));
let mined = 0;

for (const op of ores) {
  if (isCancelled()) break;
  console.log(`Mining gold ore at ${lib.fmt(op)} with iron pickaxe...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.2));
    const b = bot.blockAt(op);
    if (b && b.name === 'nether_gold_ore') {
      const ironPick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (ironPick) await bot.equip(ironPick, 'hand');
      await bot.dig(b);
      mined++;
      await sleep(150);
      await lib.pickup(4.0);
    }
  } catch (e) {
    console.log(`Mining note at ${lib.fmt(op)}:`, e.message);
  }
}

await lib.pickup(6.0);
const nuggets = lib.count('gold_nugget');
console.log(`Mined ${mined} gold ores. Nuggets on Beta: ${nuggets} (${Math.floor(nuggets/9)} ingots)`);

if (mined > 0) {
  bot.chat(`Beta: Mined ${mined} gold ores in tunnel walls! Holding ${nuggets} nuggets for Milestone 9!`);
}

bot.activateItem(true); // Keep shield raised

console.log('=== Program 783 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet slot:', bot.inventory.slots[8]?.name);
console.log('Ender Pearls on Beta:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'), 'nuggets:', lib.count('gold_nugget'));
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
  mined_ores: mined,
  piglins_nearby: piglins.length,
  endermen_nearby: endermen.length
};
