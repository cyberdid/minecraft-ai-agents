// programs/028-craft-iron-tools-and-gear.js
// Eat, craft planks/sticks, finish smelting, craft iron_sword, iron_axe, shield, equip!

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Eat food to restore hunger
if (bot.food < 18) {
  try {
    await lib.eat();
    console.log('Food after eating:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
  }
}

// 2. Craft planks and sticks from logs
if (lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 8);
  console.log('Crafted planks:', lib.count('oak_planks'));
}
if (lib.count('stick') < 6 && lib.count('*_planks') > 0) {
  await lib.craft('stick', 8);
  console.log('Crafted sticks:', lib.count('stick'));
}

// 3. Check remaining raw iron in inventory or furnace
const rawRemaining = lib.count('raw_iron');
if (rawRemaining > 0) {
  console.log(`Smelting ${rawRemaining} remaining raw iron...`);
  try {
    await lib.smelt('raw_iron', 'oak_planks', rawRemaining);
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

console.log('Iron ingots available now:', lib.count('iron_ingot'));

// 4. Craft iron_sword (2 ingots + 1 stick)
if (lib.count('iron_sword') === 0 && lib.count('iron_ingot') >= 2) {
  await lib.craft('iron_sword', 1);
  console.log('Crafted iron_sword!');
}

// 5. Craft iron_axe (3 ingots + 2 sticks)
if (lib.count('iron_axe') === 0 && lib.count('iron_ingot') >= 3) {
  await lib.craft('iron_axe', 1);
  console.log('Crafted iron_axe!');
}

// 6. Craft shield (1 ingot + 6 planks)
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  await lib.craft('shield', 1);
  console.log('Crafted shield!');
}

// 7. Equip shield and weapon
await lib.equipArmor();
await lib.equipWeapon();

// 8. If extra iron ingots, craft beta tools or deposit in chest
const chestPos = { x: 293, y: 72, z: -57 };
if (lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('iron_pickaxe', 1);
    console.log('Crafted second iron_pickaxe for beta');
    await lib.deposit({ iron_pickaxe: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited iron_pickaxe for beta into chest');
  } catch (e) {
    console.log('Beta pickaxe craft note:', e.message);
  }
}

bot.chat(`alpha: Iron tools crafted! Pickaxe: ${lib.count('iron_pickaxe')}, Sword: ${lib.count('iron_sword')}, Axe: ${lib.count('iron_axe')}, Shield: ${lib.count('shield')}`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  pickaxe: lib.count('iron_pickaxe'),
  sword: lib.count('iron_sword'),
  axe: lib.count('iron_axe'),
  shield: lib.count('shield'),
  ingots: lib.count('iron_ingot'),
  food: bot.food,
  time: time.secondsUntilNight
};
