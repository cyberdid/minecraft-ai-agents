// programs/041-return-smelt-armor-batch1.js
// Return to base, smelt 17 raw iron, craft fresh iron pickaxe, iron chestplate, iron leggings, equip!

console.log('alpha at:', lib.fmt(bot.entity.position));
console.log('Raw iron count:', lib.count('raw_iron'));

// 1. Return to base doorstep at (294, 72, -52)
console.log('Returning to base at (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1, { dig: true });

// Step inside base
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Walking inside...');
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 2. Craft planks and sticks from logs
if (lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 8);
  console.log('Planks count:', lib.count('oak_planks'));
}
if (lib.count('stick') < 4 && lib.count('*_planks') > 0) {
  await lib.craft('stick', 4);
}

// 3. Smelt 17 raw iron in furnace
const rawIronCount = lib.count('raw_iron');
console.log(`Smelting ${rawIronCount} raw iron...`);
if (rawIronCount > 0) {
  try {
    const smeltRes = await lib.smelt('raw_iron', 'oak_planks', rawIronCount);
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

console.log('Iron ingots available now:', lib.count('iron_ingot'));

// 4. Craft fresh iron_pickaxe (3 ingots + 2 sticks)
if (lib.count('iron_pickaxe') === 0 && lib.count('iron_ingot') >= 3) {
  await lib.craft('iron_pickaxe', 1);
  console.log('Crafted fresh iron_pickaxe!');
}

// 5. Craft iron_chestplate (8 ingots)
if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
  await lib.craft('iron_chestplate', 1);
  console.log('Crafted iron_chestplate!');
}

// 6. Craft iron_leggings (7 ingots)
if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
  await lib.craft('iron_leggings', 1);
  console.log('Crafted iron_leggings!');
}

// 7. Equip armor
await lib.equipArmor();
await lib.equipWeapon();

bot.chat(`alpha: Armored up! Chestplate: ${lib.count('iron_chestplate')}, Leggings: ${lib.count('iron_leggings')}, Fresh Pickaxe: ${lib.count('iron_pickaxe')}. Ingots left: ${lib.count('iron_ingot')}`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  chestplate: lib.count('iron_chestplate'),
  leggings: lib.count('iron_leggings'),
  pickaxe: lib.count('iron_pickaxe'),
  ingots: lib.count('iron_ingot'),
  time: time.secondsUntilNight
};
