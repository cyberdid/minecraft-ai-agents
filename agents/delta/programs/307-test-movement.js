// programs/307-test-movement.js
console.log('Pos:', bot.entity.position);
console.log('On ground:', bot.entity.onGround);
console.log('Velocity:', bot.entity.velocity);
console.log('In water:', bot.entity.isInWater);
console.log('In lava:', bot.entity.isInLava);

// Check if riding anything
console.log('Vehicle:', bot.vehicle);

// Inspect block at exact position
const blockUnder = bot.blockAt(bot.entity.position.offset(0, -0.1, 0));
const blockAtFeet = bot.blockAt(bot.entity.position);
const blockAtHead = bot.blockAt(bot.entity.position.offset(0, 1.6, 0));
console.log(`Block under: ${blockUnder?.name}, at feet: ${blockAtFeet?.name}, at head: ${blockAtHead?.name}`);

// Try jumping
console.log('Testing jump...');
bot.setControlState('jump', true);
await sleep(300);
console.log('Pos during jump:', bot.entity.position, 'vel:', bot.entity.velocity);
bot.setControlState('jump', false);
await sleep(300);

// Try walking South (+Z towards portal)
console.log('Testing South (+Z)...');
await bot.lookAt(new Vec3(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z + 5), true);
bot.setControlState('forward', true);
await sleep(500);
console.log('Pos after South move:', bot.entity.position);
bot.clearControlStates();

// Try walking West (-X)
console.log('Testing West (-X)...');
await bot.lookAt(new Vec3(bot.entity.position.x - 5, bot.entity.position.y, bot.entity.position.z), true);
bot.setControlState('forward', true);
await sleep(500);
console.log('Pos after West move:', bot.entity.position);
bot.clearControlStates();
