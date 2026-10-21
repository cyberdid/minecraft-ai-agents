// programs/098-pickup-and-climb-up.js
// 1. Pickup all dropped items around (290, 52, -56)
// 2. Equip armor immediately
// 3. Walk back up stairs to base at (294, 72, -54)

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Move to (290, 52, -56) and sweep pickup
console.log('Sweeping pickup...');
try {
  await lib.goTo(290, 52, -56, 1);
} catch (e) {
  console.log('GoTo note:', e.message);
}

const picked = await lib.pickup(12);
console.log('Picked up count:', picked);

// 2. Equip armor
try {
  await lib.equipArmor();
  console.log('Armor equipped!');
} catch (e) {
  console.log('Equip armor note:', e.message);
}

// 3. Climb back up to base at (294, 72, -54)
console.log('Climbing up to base...');
try {
  await lib.goTo(294, 72, -54, 2);
  console.log('Back at base!');
} catch (e) {
  console.log('Climb note:', e.message);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Alpha pos:', lib.fmt(bot.entity.position), '| health:', bot.health);
bot.chat('alpha: Recovered all items from staircase and heading to base!');
