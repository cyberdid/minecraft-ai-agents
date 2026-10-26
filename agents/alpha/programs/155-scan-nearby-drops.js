// programs/155-scan-nearby-drops.js
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Check oxygen
console.log('Oxygen:', bot.oxygenLevel);

const items = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position);
console.log(`Found ${items.length} item entities in loaded world:`);
for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position);
  console.log(`  Drop at ${lib.fmt(it.position)} (dist: ${d.toFixed(1)})`);
}

// Check nearby blocks around feet and head
console.log('Feet block:', bot.blockAt(bot.entity.position)?.name);
console.log('Head block:', bot.blockAt(bot.entity.position.offset(0, 1, 0))?.name);
console.log('Above block:', bot.blockAt(bot.entity.position.offset(0, 2, 0))?.name);

// If there are items within 6 blocks, pick them up
if (items.some(it => bot.entity.position.distanceTo(it.position) < 8)) {
  console.log('Attempting pickup...');
  const gained = await lib.pickup(8);
  console.log('Pickup gained:', gained);
  await lib.equipArmor();
  await lib.equipWeapon();
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Armor:', bot.inventory.slots.slice(5, 9).map(s => s?.name));
