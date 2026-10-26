// programs/258-check-iron-and-hunt-sheep-or-craft-shears.js
console.log('=== Step 16: Check Alpha iron/wool, deposit food, get 3rd wool ===');

const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

// Deposit cooked food for Alpha
console.log('Depositing 6 cooked meats for Alpha into base chest...');
await lib.deposit({ cooked_porkchop: 4, cooked_mutton: 2 }, chestPos.x, chestPos.y, chestPos.z);

// Load 2 beef into F2
const f2Block = bot.blockAt(new Vec3(295, 72, -57));
if (f2Block && lib.count('beef') > 0) {
  const f2 = await bot.openFurnace(f2Block);
  if (!f2.inputItem()) {
    await f2.putInput(mcData.itemsByName.beef.id, null, lib.count('beef'));
    console.log('Loaded beef into F2.');
  }
  f2.close();
}

// Check if Alpha put iron into chest
if (chest.raw_iron || chest.iron_ingot) {
  const withdrawItems = {};
  if (chest.raw_iron) withdrawItems.raw_iron = chest.raw_iron;
  if (chest.iron_ingot) withdrawItems.iron_ingot = chest.iron_ingot;
  await lib.withdraw(withdrawItems, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew iron from chest. Beta inv now:', JSON.stringify(lib.inv()));
}

// If we have 2+ iron ingots, craft shears!
if (lib.count('shears') === 0 && lib.count('iron_ingot') >= 2) {
  try {
    console.log('Crafting shears...');
    await lib.craft('shears', 1);
    console.log('Crafted shears!');
  } catch (e) {
    console.log('Shears craft error:', e.message);
  }
}

// Exit base to search for sheep
console.log('Exiting base door to hunt/shear 1 sheep...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// Look for sheep within 48 blocks
let sheep = Object.values(bot.entities).find(e => e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48);

if (!sheep) {
  console.log('Exploring towards (340, 72, -20) to find sheep...');
  try {
    await lib.goToXZ(340, -20, { timeoutMs: 20000 });
    sheep = Object.values(bot.entities).find(e => e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48);
  } catch (e) {
    console.log('Exploration note:', e.message);
  }
}

if (sheep) {
  console.log('Found sheep at:', lib.fmt(sheep.position));
  if (lib.count('shears') > 0) {
    // Shear sheep
    await bot.equip(mcData.itemsByName.shears.id, 'hand');
    await lib.goTo(sheep.position.x, sheep.position.y, sheep.position.z, 2);
    await bot.activateEntity(sheep);
    await sleep(500);
    await lib.pickup(6);
  } else {
    // Attack sheep
    await lib.equipWeapon();
    bot.pvp.attack(sheep);
    const deadline = Date.now() + 15000;
    while (bot.entities[sheep.id] && Date.now() < deadline) await sleep(250);
    bot.pvp.stop();
    await lib.pickup(6);
  }
}

// Return to base
console.log('Returning to base at (294, 72, -54)...');
await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 });
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Returned to base. Wool: ${JSON.stringify(Object.fromEntries(Object.entries(lib.inv()).filter(([k]) => k.includes('wool'))))}. Night in ${lib.time().secondsUntilNight}s.`);
