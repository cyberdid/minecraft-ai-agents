// programs/405-fast-stone-gear-and-portal.js
console.log('=== Program 405: Fast Stone Gear & Enter Nether ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Mine 6 stone blocks for stone pickaxe and sword
console.log('Mining stone for tools...');
try {
  await lib.collect('cobblestone', 8);
  console.log('Cobblestone mined:', lib.count('cobblestone'));
} catch (e) {
  console.log('Cobble collect note:', e.message);
}

// 2. Craft stone_pickaxe and stone_sword
try {
  if (lib.count('stick') < 4 && lib.count('*_planks') > 0) {
    await lib.craft('stick', 4);
  }
  if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  }
  if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  }
} catch (e) {
  console.log('Craft note:', e.message);
}

// 3. Mine 16 more cobblestone with stone pickaxe
console.log('Collecting additional cobblestone for Nether bridge/parapets...');
try {
  await lib.collect('cobblestone', 16);
  console.log('Total cobblestone in inv:', lib.count('cobblestone'));
} catch (e) {}

// 4. Equip stone sword
await lib.equipWeapon();

// 5. Walk into Nether portal at (299.5, 73.0, -54.0)
console.log('Moving into Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo portal note:', e.message);
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0));
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1000);
  bot.setControlState('jump', false);
  await sleep(500);
  bot.setControlState('forward', false);
}

// 6. Stand inside portal for dimension change
console.log('Waiting inside portal for Nether transit...');
for (let wait = 0; wait < 25; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** ARRIVED IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether! Pos=${lib.fmt(bot.entity.position)}, Cobble=${lib.count('cobblestone')}. Moving to Blaze Spawner (32, 68, -190)!`);
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
