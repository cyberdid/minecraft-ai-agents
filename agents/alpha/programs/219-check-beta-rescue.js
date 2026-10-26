// programs/219-check-beta-rescue.js
console.log('=== Program 219: Coordinate with Beta & Check Rescue Status ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Check Beta
const beta = bot.players.beta;
if (beta && beta.entity) {
  console.log('Beta pos:', lib.fmt(beta.entity.position), 'held:', beta.entity.heldItem?.name);
} else {
  console.log('Beta entity not in render distance right now.');
}

// Ask Beta for rescue status
bot.chat('beta: Alpha at surface (303, 66, -110). Did you recover diamond_pickaxe / water_bucket? Heading to base (294, 72, -54).');

// Head towards base (294, 72, -54)
console.log('Moving towards base entrance (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 2, { timeoutMs: 35000 });
  console.log('Arrived near base! Pos:', lib.fmt(bot.entity.position));
  if (typeof passDoorIn === 'function') await passDoorIn();
} catch (e) {
  console.log('Move to base error:', e.message);
}

// Inspect base chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest contents:', JSON.stringify(contents));
} catch (e) {
  console.log('Chest read error:', e.message);
}

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
