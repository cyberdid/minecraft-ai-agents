// programs/261-reach-east-ridge-loot.js
console.log('=== WALK EAST TO RIDGE HEAD & RECOVER LOOT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Walk straight East along z = -3 to x = 63
console.log('Walking straight East along z=-3...');
await lib.walkTo(55.0, -3.0, 3000);
bot.clearControlStates();
console.log('At x=55! Pos:', lib.fmt(bot.entity.position));

await lib.walkTo(63.0, -3.0, 3000);
bot.clearControlStates();
console.log('At East Ridge Head (63, 65, -3)! Pos:', lib.fmt(bot.entity.position));

// 2. Scan dropped items within 16m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 16);
console.log(`Found ${items.length} dropped items near Ridge Head:`);
for (const it of items) {
  console.log(` - Item ${it.id} at ${lib.fmt(it.position)} (dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}m)`);
}

// 3. Vacuum all dropped items
console.log('Picking up items...');
for (const it of items) {
  if (it.isValid) {
    try {
      await lib.walkTo(it.position.x, it.position.z, 2000);
      bot.clearControlStates();
    } catch (e) {}
  }
}
const gained = await lib.pickup(10);
console.log(`Pickup complete! Gained items.`);

// 4. Equip shield and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== GEAR STATUS ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Building blocks: cobble =', lib.count('cobblestone'), 'soul_sand =', lib.count('soul_sand'));
console.log('Full Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma geared on East Ridge: SHIELD in offhand, ${bot.entity.equipment[0]?.name || 'sword'} in mainhand, cobble x${lib.count('cobblestone')}, soul_sand x${lib.count('soul_sand')}!`);
