// programs/076-recover-items.js
// Fast recovery of dropped items at (336.9, 70.0, -32.3) and return to base before night

console.log('Recovery started. Alpha at:', lib.fmt(bot.entity.position), '| night in:', lib.time().secondsUntilNight);

const deathPos = new Vec3(336.9, 70.0, -32.3);
bot.chat('alpha: Running to death spot at (337, 70, -32) to recover items before night.');

// 1. Move to death spot
console.log('Moving to death spot...');
try {
  await lib.goTo(deathPos.x, deathPos.y, deathPos.z, 2);
} catch (e) {
  console.log('GoTo note:', e.message);
  await lib.goToXZ(deathPos.x, deathPos.z);
}

// 2. Pickup items
console.log('Picking up items...');
const picked = await lib.pickup(12);
console.log('Picked up count:', picked);

// 3. Equip armor immediately
try {
  await lib.equipArmor();
  console.log('Armor equipped!');
} catch (e) {
  console.log('Equip armor note:', e.message);
}

// 4. Return to base immediately
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -53);
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Return note:', e.message);
  if (lib.time().secondsUntilNight < 90) {
    console.log('Night is here! Sheltering immediately...');
    await lib.shelter();
  }
}

console.log('Status: pos:', lib.fmt(bot.entity.position), '| night in:', lib.time().secondsUntilNight, '| inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Recovered items! In base with armor equipped. Night in ${lib.time().secondsUntilNight}s.`);
