// programs/156-step-down-pickup-all-gear.js
console.log('--- Picking Up All Dropped Gear ---');
console.log('Starting pos:', lib.fmt(bot.entity.position));

const targets = [
  new Vec3(294, 51, -53),
  new Vec3(296, 51, -55),
  new Vec3(296, 50, -52),
  new Vec3(296, 51, -61)
];

for (const p of targets) {
  console.log(`Walking to target ${lib.fmt(p)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(p.x, p.y, p.z, 0.5));
    await sleep(400);
  } catch (e) {
    console.log(`Goto ${lib.fmt(p)} error:`, e.message);
  }
}

// Equip armor & weapon
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

console.log('Armor worn:', bot.inventory.slots.slice(5, 9).map(s => s?.name));
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Inventory:', JSON.stringify(lib.inv()));

// Navigate back up to base (294, 72, -53)
console.log('Navigating back up to base...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  console.log('At base entrance!');
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(293.5, -56.0, 3000);
  await lib.door(294, 72, -54, false);
  console.log('Inside base!');
} catch (e) {
  console.log('Ascent error:', e.message);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Recovered gear! Wearing: ${bot.inventory.slots.slice(5, 9).map(s => s?.name).filter(Boolean).join(', ')}.`);
