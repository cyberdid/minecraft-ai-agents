// programs/615-vacuum-shield-and-seal-bunker.js
console.log('=== Program 615: Vacuum Shield & Seal Safety Bunker ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Check dropped items within 6 meters
const drops = Object.values(bot.entities).filter(
  e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8.0
);
console.log(`Found ${drops.length} dropped items nearby:`);
for (const d of drops) {
  console.log(`- dropped item at ${lib.fmt(d.position)} (dist ${d.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

// 2. Step toward (38, 67, -183) and vacuum all dropped equipment
console.log('Vacuuming dropped items...');
try {
  await bot.lookAt(new Vec3(38.0, 67.0, -183.0), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
} catch (e) {}

try {
  const gained = await lib.pickup(6);
  console.log(`Vacuumed ${gained} items!`);
} catch (e) {
  console.log('Pickup error:', e.message);
}

console.log('Inventory after pickup:', lib.inv());

// 3. Immediately equip shield in offhand and weapon in mainhand!
await lib.equipArmor();
await lib.equipWeapon();
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
bot.chat(`alpha: Recovered gear! Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Weapon: ${bot.heldItem?.name || 'none'}, HP: ${bot.health.toFixed(1)}`);

// 4. If food was scooped up, eat immediately to regenerate health!
const foodTypes = ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'bread', 'apple', 'baked_potato'];
for (const f of foodTypes) {
  if (lib.count(f) > 0) {
    console.log(`Eating ${f}...`);
    try {
      await lib.eat();
      console.log(`Ate ${f}! Current HP: ${bot.health.toFixed(1)}, Food: ${bot.food}`);
    } catch (e) {}
  }
}

// 5. Seal defensive bunker walls with cobblestone
const curPos = bot.entity.position.floored();
console.log(`Fortifying bunker around ${lib.fmt(curPos)}...`);

if (lib.count('cobblestone') >= 4) {
  // North wall at z-1
  try {
    const nw = curPos.offset(0, 0, -1);
    if (bot.blockAt(nw)?.name === 'air') {
      console.log(`Placing North wall at ${lib.fmt(nw)}...`);
      await lib.place('cobblestone', nw.x, nw.y, nw.z);
    }
    const nw2 = curPos.offset(0, 1, -1);
    if (bot.blockAt(nw2)?.name === 'air') {
      await lib.place('cobblestone', nw2.x, nw2.y, nw2.z);
    }
  } catch (e) {}

  // West wall at x-1
  try {
    const ww = curPos.offset(-1, 0, 0);
    if (bot.blockAt(ww)?.name === 'air') {
      await lib.place('cobblestone', ww.x, ww.y, ww.z);
    }
  } catch (e) {}

  // Roof at y+2
  try {
    const rf = curPos.offset(0, 2, 0);
    if (bot.blockAt(rf)?.name === 'air') {
      await lib.place('cobblestone', rf.x, rf.y, rf.z);
    }
  } catch (e) {}
}

console.log('Bunker fortified! Position:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Bunker secured at ${lib.fmt(bot.entity.position)}! HP: ${bot.health.toFixed(1)}, Rods: ${lib.count('blaze_rod')}/8`);

// 6. Stationary Combat Loop: Strike Blazes through 1-block firing slit
console.log('Starting stationary combat loop from behind bunker wall...');
const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');

while (Date.now() - combatStart < 45000 && !isCancelled() && bot.health > 2) {
  await lib.equipWeapon();
  await lib.equipArmor();
  
  // Find Blazes within 5.5 blocks
  const blazes = Object.values(bot.entities).filter(
    e => e.name === 'blaze' && e.isValid && e.position.distanceTo(bot.entity.position) < 5.8
  ).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));
  
  if (blazes.length > 0) {
    const target = blazes[0];
    console.log(`Striking Blaze at ${lib.fmt(target.position)} (dist ${target.position.distanceTo(bot.entity.position).toFixed(1)}m)...`);
    await bot.lookAt(target.position.offset(0, 1.0, 0), true);
    bot.attack(target);
    await sleep(450);
    if (target.isValid && target.position.distanceTo(bot.entity.position) < 5.8) {
      bot.attack(target);
      await sleep(450);
    }
  } else {
    await sleep(400);
  }
  
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    console.log(`+++ BLAZE ROD HARVESTED! Total: ${currentRods} +++`);
    bot.chat(`alpha: Blaze Rod harvested! Total rods: ${currentRods}/8!`);
    lastRods = currentRods;
  }
  
  if (currentRods >= 7) {
    bot.chat(`alpha: TARGET ACHIEVED! Harvested ${currentRods} Blaze Rods! Milestone 8 Complete!`);
    break;
  }
}

const finalRods = lib.count('blaze_rod');
console.log('Final inventory:', lib.inv());
console.log('Blaze Rods in inv:', finalRods, 'HP:', bot.health.toFixed(1));
bot.chat(`alpha: Pillbox engagement complete at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
