// programs/154-pickup-remaining-items.js
console.log('--- Picking up remaining dropped items ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Locate all dropped items
const itemDrops = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position && e.position.distanceTo(bot.entity.position) < 16);
console.log(`Found ${itemDrops.length} item drops nearby.`);

for (const drop of itemDrops) {
  console.log(`Item drop at ${lib.fmt(drop.position)} (dist: ${drop.position.distanceTo(bot.entity.position).toFixed(1)})`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(drop.position.x, drop.position.y, drop.position.z, 0.5));
    await sleep(200);
  } catch (e) {
    console.log('Path to item error:', e.message);
  }
}

// Pickup sweep
await lib.pickup(8);

// 2. Equip armor and weapon immediately
await lib.equipArmor();
await lib.equipWeapon();

console.log('Armor worn:', bot.inventory.slots.slice(5, 9).map(s => s?.name));
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Inventory now:', JSON.stringify(lib.inv()));

// 3. Path back up to surface/base
console.log('Navigating up to base (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(293.5, -56.0, 3000);
  await lib.door(294, 72, -54, false);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Return error:', e.message);
}

bot.chat(`alpha: Recovered gear! Status: armor=${bot.inventory.slots[6]?.name ? 'yes' : 'no'}, bucket=${lib.count('water_bucket') + lib.count('bucket')}`);
