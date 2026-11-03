// programs/413-secure-pillbox-and-harvest-rods.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'food:', bot.food);

// 1. Vacuum all ground items within reach (Blaze rods, dropped weapons)
try {
  const p = await lib.pickup(6);
  if (p > 0) console.log(`Picked up ${p} drops!`);
} catch (e) {
  console.log('Pickup note:', e.message);
}

// 2. Check for ground item entities nearby
const groundItems = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 12);
console.log(`Ground items within 12m (${groundItems.length}):`);
for (const item of groundItems) {
  console.log(`  Item at ${lib.fmt(item.position)} dist: ${bot.entity.position.distanceTo(item.position).toFixed(1)}m`);
}

// 3. Equip stone sword
try { await lib.equipWeapon(); } catch (e) {}
console.log('Equipped weapon:', bot.heldItem?.name);

// 4. Check nearby Blazes
const blazes = Object.values(bot.entities)
  .filter(e => e.name === 'blaze' && e.isValid && e.health > 0)
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Blazes nearby (${blazes.length}):`);
for (const b of blazes) {
  console.log(`  Blaze at ${lib.fmt(b.position)} dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m, HP: ${b.health}`);
}

// 5. Stationary strike: if a Blaze is within 4.2m reach and we have safe cover, attack!
for (let i = 0; i < 5; i++) {
  if (bot.health < 4) break;
  const target = blazes.find(b => bot.entity.position.distanceTo(b.position) <= 4.2);
  if (target) {
    await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
    bot.attack(target);
    console.log(`Attacked Blaze at dist ${bot.entity.position.distanceTo(target.position).toFixed(1)}m!`);
    await sleep(650);
  }
}

// 6. Vacuum drops again
try { await lib.pickup(5); } catch (e) {}

console.log('Current inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

const rods = lib.count('blaze_rod');
console.log(`Total Blaze Rods in hand: ${rods}`);
bot.chat(`delta: Holding Spawner Pillbox! Rods: ${rods}, HP: ${bot.health}/20`);
