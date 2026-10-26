// programs/252-craft-kit-and-enter-nether.js
console.log('=== CRAFT KIT, RESUPPLY & TRANSIT TO NETHER ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Check base furnaces for iron/coal
for (const fp of [new Vec3(295, 72, -55), new Vec3(295, 72, -54)]) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      if (f.outputItem()) {
        console.log(`Withdrawing ${f.outputItem().name} x ${f.outputItem().count} from furnace...`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }
}

// 2. Check base chest for wood/supplies
try {
  const chest = await bot.openContainer(bot.blockAt(new Vec3(293, 72, -57)));
  for (const it of chest.items()) {
    if (['iron_ingot', 'shield', 'stick', 'birch_log', 'oak_log', 'birch_planks', 'oak_planks', 'stone_sword', 'stone_pickaxe'].includes(it.name)) {
      console.log(`Withdrawing ${it.name} x ${it.count} from chest...`);
      await chest.withdraw(it.type, null, it.count);
    }
  }
  await chest.close();
} catch (e) {}

console.log('Inv after chest/furnaces:', JSON.stringify(lib.inv()));

// 3. If no wood/sticks, step out door and chop 2 logs
if (lib.count('*_planks') === 0 && lib.count('stick') === 0) {
  console.log('Stepping outside door to get 2 logs...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  
  const logs = lib.find('*_log', { maxDistance: 24, count: 5 });
  if (logs.length > 0) {
    console.log(`Chopping log at ${lib.fmt(logs[0].position)}...`);
    try {
      await lib.dig(logs[0].position.x, logs[0].position.y, logs[0].position.z);
      await lib.pickup(6);
    } catch (e) {}
  }
  
  // Return inside base
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

// Craft planks & sticks
const logItem = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logItem) {
  const plankName = logItem.replace('_log', '_planks');
  await lib.craft(plankName, 4);
}
if (lib.count('*_planks') > 0 && lib.count('stick') < 2) {
  await lib.craft('stick', 4);
}

// 4. Craft tools: stone_pickaxe, stone_sword, and shield if iron available
if (lib.count('cobblestone') >= 5 && lib.count('stick') >= 2) {
  console.log('Crafting stone tools...');
  try {
    await lib.craft('stone_pickaxe', 1);
    await lib.craft('stone_sword', 1);
  } catch (e) {
    console.log('Tools craft note:', e.message);
  }
}

if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting SHIELD...');
  try {
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED!');
  } catch (e) {}
}

// Equip
try { await lib.equipWeapon(); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}

console.log('=== GEAR SUMMARY ===');
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Cobblestone:', lib.count('cobblestone'));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma geared: ${bot.entity.equipment[0]?.name || 'pickaxe'} in hand, cobble x${lib.count('cobblestone')}! Sprinting to Nether portal.`);

// 5. Step out door to Nether portal
console.log('Walking to Nether portal...');
try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

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
  console.log('TRANSIT SUCCESSFUL!');
  await sleep(400);
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();
  console.log('Nether bunker pos:', lib.fmt(bot.entity.position));
  bot.chat(`gamma in Nether! Cobble: x${lib.count('cobblestone')}. Marching along cleared East Ridge to Fortress!`);
}
