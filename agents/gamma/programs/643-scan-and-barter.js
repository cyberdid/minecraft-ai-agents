// programs/643-scan-and-barter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 643: SCAN SURROUNDINGS & BARTER GOLD ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Scan players
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
console.log(`Teammates within tracking range (${players.length}):`);
for (const p of players) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// 3. Scan nearby entities (piglins, endermen, items, hostiles)
const entities = Object.values(bot.entities).filter(e => e !== bot.entity && e.position);
const piglins = entities.filter(e => e.name === 'piglin' && e.isValid);
const endermen = entities.filter(e => e.name === 'enderman' && e.isValid);
const items = entities.filter(e => e.name === 'item' && e.isValid);
const hostiles = entities.filter(e => ['hoglin', 'wither_skeleton', 'blaze', 'ghast', 'zombified_piglin'].includes(e.name) && e.isValid);

console.log(`Piglins found: ${piglins.length}`);
for (const pg of piglins) {
  console.log(`  Piglin at ${lib.fmt(pg.position)}, dist: ${bot.entity.position.distanceTo(pg.position).toFixed(1)}m`);
}
console.log(`Endermen found: ${endermen.length}`);
for (const em of endermen) {
  console.log(`  Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}
console.log(`Ground items nearby: ${items.length}`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}, dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}
console.log(`Hostiles nearby: ${hostiles.length}`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.position)}, dist: ${bot.entity.position.distanceTo(h.position).toFixed(1)}m`);
}

// 4. Pickup any nearby ground items first
try {
  await lib.pickup(6.0);
} catch (e) {}

// 5. Check if we have gold ingots to barter
let goldIngots = lib.count('gold_ingot');
console.log(`Current gold ingots in inventory: ${goldIngots}, ender_pearls: ${lib.count('ender_pearl')}`);

// 6. Direct Barter with nearest adult piglin if we have gold
if (goldIngots > 0 && piglins.length > 0) {
  // Find closest piglin
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const targetPiglin = piglins[0];
  const dist = bot.entity.position.distanceTo(targetPiglin.position);
  console.log(`Targeting Piglin at ${lib.fmt(targetPiglin.position)} (dist: ${dist.toFixed(1)}m)`);

  if (dist > 3.5) {
    console.log('Moving closer to Piglin...');
    try {
      await bot.pathfinder.goto(new goals.GoalNear(targetPiglin.position.x, targetPiglin.position.y, targetPiglin.position.z, 2.5));
    } catch (e) {
      console.log('Pathfind near piglin failed:', e.message);
    }
  }

  // Ensure golden boots still equipped before bartering
  if (bot.inventory.slots[8]?.name !== 'golden_boots') {
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
  }

  const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
  if (ingot) {
    await bot.equip(ingot, 'hand');
    await bot.lookAt(targetPiglin.position.offset(0, 1.0, 0), true);
    console.log('Activating entity (handing gold ingot to Piglin)...');
    try {
      bot.activateEntity(targetPiglin);
      bot.chat(`gamma: Handed gold ingot to Piglin at ${lib.fmt(targetPiglin.position)}!`);
      console.log('Waiting 8.5 seconds for Piglin barter inspection...');
      await sleep(8500);
      console.log('Picking up barter rewards...');
      await lib.pickup(6.0);
    } catch (err) {
      console.log('Direct activateEntity failed, attempting toss:', err.message);
      await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
      await sleep(8500);
      await lib.pickup(6.0);
    }
  }
}

// 7. Check if we got food and eat if needed
const foods = ['cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_beef'];
for (const f of foods) {
  if (lib.count(f) > 0 && bot.food < 18) {
    console.log(`Eating ${f}...`);
    try { await lib.eat(); } catch (e) {}
    break;
  }
}

// Re-equip weapon
try { await lib.equipWeapon(); } catch (e) {}

const finalPearls = lib.count('ender_pearl');
console.log(`Program 643 complete. HP: ${bot.health}, Food: ${bot.food}, Pearls: ${finalPearls}, Gold: ${lib.count('gold_ingot')}`);
return { hp: bot.health, food: bot.food, pearls: finalPearls, pos: bot.entity.position, inv: lib.inv() };
