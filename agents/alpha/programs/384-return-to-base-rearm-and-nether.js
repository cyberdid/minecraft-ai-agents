// programs/384-return-to-base-rearm-and-nether.js
console.log('=== Program 384: Respawn Recovery, Re-arm & Return to Nether ===');

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Alert team about death spot and deadline
bot.chat('team: Alpha items on fortress bridge at (45, 65, -131). Beta/Gamma please pick up if near! Alpha returning through portal now.');

// 2. Walk to base door exterior at (294.5, 72, -52)
console.log('Navigating back to base at (294.5, 72, -52)...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 25000 });
  console.log('Reached base exterior!');
} catch (e) {
  console.log('goTo base note:', e.message);
  try {
    await lib.goToXZ(294.5, -52, { timeoutMs: 20000 });
  } catch (e2) {}
}

// 3. Enter base shelter to check chest
console.log('Entering base...');
try {
  await globalThis.passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Re-arm from base chest (293, 72, -57)
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest items:', JSON.stringify(chest));

  // Take weapons, tools, cobble
  const toWithdraw = {};
  if (chest['iron_sword']) toWithdraw['iron_sword'] = 1;
  else if (chest['stone_sword']) toWithdraw['stone_sword'] = 1;
  
  if (chest['iron_pickaxe']) toWithdraw['iron_pickaxe'] = 1;
  else if (chest['stone_pickaxe']) toWithdraw['stone_pickaxe'] = 1;

  if (chest['cobblestone']) toWithdraw['cobblestone'] = Math.min(64, chest['cobblestone']);
  if (chest['cooked_beef']) toWithdraw['cooked_beef'] = Math.min(4, chest['cooked_beef']);
  if (chest['shield']) toWithdraw['shield'] = 1;
  if (chest['bow']) toWithdraw['bow'] = 1;
  if (chest['arrow']) toWithdraw['arrow'] = chest['arrow'];

  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing gear:', JSON.stringify(toWithdraw));
    await lib.withdraw(toWithdraw, 293, 72, -57);
    await lib.equipArmor();
  }
} catch (e) {
  console.log('Chest gear note:', e.message);
}

// 5. Exit base and step into Nether portal at (299, 73, -54)
console.log('Exiting base to Nether portal...');
try {
  await globalThis.passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Stepping into Nether portal (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0, { timeoutMs: 15000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0));
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(600);
  bot.setControlState('forward', false);
}

// Wait for Nether transit
console.log('Waiting for Nether teleportation...');
for (let wait = 0; wait < 20; wait++) {
  if (bot.game.dimension === 'the_nether') break;
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('team: Alpha back in the Nether! Advancing to Fortress (45, 65, -131) to rejoin team.');
}

console.log('Alpha status:', JSON.stringify(lib.status()));
