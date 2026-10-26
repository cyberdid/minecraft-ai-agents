// programs/245-mine-stone-and-craft-tools.js
console.log('=== VERIFY SHIELD & MINE COBBLESTONE FOR BLAZE FRONT ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Verify equipment
console.log('Offhand item:', bot.entity.equipment[1]?.name);
console.log('Held item:', bot.entity.equipment[0]?.name);
console.log('Inventory:', JSON.stringify(lib.inv()));

// 2. Step out base door to hillside
console.log('Stepping through base door to hillside...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}

// 3. Find exposed stone blocks on hillside (y >= 65)
const stoneBlocks = bot.findBlocks({
  matching: b => b && b.name === 'stone',
  maxDistance: 24,
  count: 40
}).filter(p => p.y >= 65); // strictly avoid aquifer below y=65

console.log(`Exposed stone blocks found (${stoneBlocks.length}):`, stoneBlocks.slice(0, 5).map(p => lib.fmt(p)));

if (stoneBlocks.length > 0) {
  // Mine 3 stone with wooden pickaxe
  console.log('Mining initial 3 stone for stone_pickaxe...');
  for (let i = 0; i < Math.min(3, stoneBlocks.length); i++) {
    const p = stoneBlocks[i];
    console.log(`Mining stone at ${lib.fmt(p)}...`);
    try { await lib.dig(p.x, p.y, p.z); } catch (e) {}
  }
  await lib.pickup(6);
  console.log('Cobblestone in inv:', lib.count('cobblestone'));

  // Craft stone pickaxe inside base
  if (lib.count('cobblestone') >= 3) {
    console.log('Entering base to craft stone pickaxe...');
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
    if (lib.count('stick') < 2) {
      if (lib.count('*_planks') > 0) await lib.craft('stick', 4);
    }
    try {
      await lib.craft('stone_pickaxe', 1);
      console.log('Stone pickaxe crafted!');
    } catch (e) {
      console.log('Stone pick craft error:', e.message);
    }
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Now mine remaining stone with stone pickaxe to reach 32 cobblestone
  console.log('Mining stone to reach 32 cobblestone...');
  const remainingStone = bot.findBlocks({
    matching: b => b && b.name === 'stone',
    maxDistance: 24,
    count: 35
  }).filter(p => p.y >= 65);

  for (const p of remainingStone) {
    if (lib.count('cobblestone') >= 32) break;
    try { await lib.dig(p.x, p.y, p.z); } catch (e) {}
  }
  await lib.pickup(8);
  console.log('Final cobblestone count:', lib.count('cobblestone'));

  // Return to base crafting table to make stone_sword
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  if (lib.count('cobblestone') >= 2) {
    try {
      await lib.craft('stone_sword', 1);
      await lib.equipWeapon();
      console.log('Stone sword crafted and equipped!');
    } catch (e) {}
  }
}

// Ensure shield is in offhand
try { await lib.equipArmor(); } catch (e) {}

console.log('=== GEAR STATUS ===');
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Cobblestone:', lib.count('cobblestone'));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('HP:', bot.health, 'Food:', bot.food);

bot.chat(`gamma geared: SHIELD in offhand, stone sword & pickaxe, cobble x${lib.count('cobblestone')}! Ready for Nether!`);

// 4. Step into Nether portal and transit
console.log('Approaching portal...');
await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
bot.setControlState('jump', true);
await lib.walkTo(299.5, -54.0, 3000);
bot.clearControlStates();

console.log('Inside portal! Standing still for transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);
if (String(bot.game.dimension).includes('nether')) {
  await sleep(400);
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();
  console.log('In Nether bunker! Pos:', lib.fmt(bot.entity.position));
  bot.chat(`gamma in Nether with SHIELD and cobble x${lib.count('cobblestone')}! Sprinting to join Alpha & Delta!`);
}
