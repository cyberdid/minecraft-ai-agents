// programs/153-recover-death-items.js
console.log('--- RECOVERING DEATH ITEMS ---');
console.log('Starting pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

const deathPos = new Vec3(293.7, 48.0, -54.3);
console.log('Target death pos:', lib.fmt(deathPos));

// 1. Move towards death position
try {
  console.log('Pathing down to death spot...');
  await lib.goTo(deathPos.x, deathPos.y, deathPos.z, 2, { dig: true });
} catch (e) {
  console.log('goTo error:', e.message);
  try {
    await lib.goTo(deathPos.x, deathPos.y + 2, deathPos.z, 3);
  } catch (e2) {
    console.log('goTo fallback error:', e2.message);
  }
}

console.log('At death area! Pos:', lib.fmt(bot.entity.position));

// 2. Pick up items
console.log('Picking up items...');
for (let p = 0; p < 4; p++) {
  try {
    const gained = await lib.pickup(10);
    console.log(`Pickup pass ${p + 1}: gained ${gained} items.`);
    await sleep(500);
  } catch (e) {
    console.log('Pickup error:', e.message);
  }
}

// 3. Equip recovered armor and weapon
try {
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Equipped recovered gear!');
} catch (e) {
  console.log('Equip error:', e.message);
}

console.log('Inventory recovered:', JSON.stringify(lib.inv()));

// 4. Return up to base
console.log('Returning up to base (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
} catch (e) {
  console.log('Climb error:', e.message);
  try {
    await lib.goTo(294, 72, -53, 2);
  } catch (e2) {}
}

// 5. Enter base through door
if (bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 6) {
  try {
    await lib.door(294, 72, -54, true);
    await sleep(200);
    await lib.walkTo(293.5, -56.0, 3000);
    await lib.door(294, 72, -54, false);
    console.log('Safely inside base!');
  } catch (e) {}
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Recovered items! Inventory: ${Object.keys(lib.inv()).length} items recovered.`);
