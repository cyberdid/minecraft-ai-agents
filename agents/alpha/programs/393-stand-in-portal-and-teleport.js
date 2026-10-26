// programs/393-stand-in-portal-and-teleport.js
console.log('=== Program 393: Step Centered into Portal & Teleport ===');

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Move to exact center of portal block (299.5, 73.0, -54.0)
console.log('Centering inside portal block (299.5, 73.0, -54.0)...');
await bot.lookAt(new Vec3(299.5, 73.0, -54.0));
bot.setControlState('forward', true);
await sleep(350);
bot.setControlState('forward', false);

console.log('Current pos:', lib.fmt(bot.entity.position));
const atFeet = bot.blockAt(bot.entity.position);
console.log('Block at feet:', atFeet?.name);

// 2. Stand completely still inside portal for 4+ seconds
console.log('Standing completely still inside portal to trigger Nether transit...');
for (let wait = 0; wait < 20; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** SUCCESS: ENTERED THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('team: Alpha arrived in the Nether! Advancing along ridge trail to Beta at Fortress Workshop (44, 65, -129)!');

  // Move along ridge trail to Fortress Workshop
  console.log('Navigating to Fortress Workshop (44, 65, -129)...');
  try {
    await lib.goTo(55, 64, -67, 3, { timeoutMs: 20000 });
    await lib.goTo(44, 65, -129, 2, { timeoutMs: 25000 });
    console.log('Arrived at Fortress Workshop!');
  } catch (e) {
    console.log('Trail advance note:', e.message);
  }
}

bot.chat(`team: Alpha status: Dimension=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}/20.`);

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
