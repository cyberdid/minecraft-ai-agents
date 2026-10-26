// programs/373-step-up-and-enter-nether.js
console.log('=== Program 373: Step into Portal & Enter Nether ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Ensure step block exists at (299, 72, -53)
const stepBlock = bot.blockAt(new Vec3(299, 72, -53));
console.log('Block at (299, 72, -53):', stepBlock?.name);
if (!stepBlock || stepBlock.name === 'air') {
  console.log('Placing cobblestone step at (299, 72, -53)...');
  try {
    await lib.place('cobblestone', 299, 72, -53);
  } catch (e) {
    console.log('Place step note:', e.message);
  }
}

// 2. Walk onto the step and into the portal block
console.log('Moving into portal block at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0, { timeoutMs: 10000 });
} catch (e) {
  console.log('lib.goTo note:', e.message);
  // Manual movement
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0));
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(600);
  bot.setControlState('forward', false);
}

console.log('Alpha now at:', lib.fmt(bot.entity.position));
const atFeet = bot.blockAt(bot.entity.position);
console.log('Block at feet:', atFeet?.name);

// 3. Wait inside portal for dimension change to the_nether
console.log('Waiting inside portal for dimension change...');
const startWait = Date.now();
while (Date.now() - startWait < 25000) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** ARRIVED IN THE NETHER! ***');
    break;
  }
  // Keep standing still inside portal
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension);
console.log('Alpha position:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha has arrived in the Nether at ${lib.fmt(bot.entity.position)}!`);
  
  // Find Beta
  const beta = bot.players['beta'];
  if (beta && beta.entity) {
    console.log(`Beta is at: ${lib.fmt(beta.entity.position)}`);
  }
  
  // List nearby blocks
  console.log('Nether base camp coordinates:', lib.fmt(bot.entity.position));
}

console.log('Alpha status:', JSON.stringify(lib.status()));
