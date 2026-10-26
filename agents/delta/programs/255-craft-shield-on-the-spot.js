// programs/255-craft-shield-on-the-spot.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

bot.pathfinder.stop();
await sleep(300);

// 1. Craft planks from 2 oak_logs
console.log('Crafting planks...');
if (lib.count('oak_planks') < 8 && lib.count('oak_log') > 0) {
  await lib.craft('oak_planks', 8);
}
console.log('Planks count:', lib.count('oak_planks'));

// 2. Craft furnace from 8 cobblestone
console.log('Crafting furnace...');
if (lib.count('furnace') < 1 && lib.count('cobblestone') >= 8) {
  await lib.craft('furnace', 1);
}
console.log('Furnace ready:', lib.count('furnace'));

// 3. Smelt raw_iron into iron_ingot
console.log('Smelting 1 raw_iron with oak_planks...');
if (lib.count('raw_iron') > 0 && lib.count('iron_ingot') < 1) {
  bot.chat('delta: Smelting iron for a shield!');
  await lib.smelt('raw_iron', 'oak_planks', 1);
  console.log('Iron ingot smelted! Ingot count:', lib.count('iron_ingot'));
}

// 4. Craft shield
console.log('Crafting shield...');
if (lib.count('iron_ingot') > 0 && lib.count('shield') < 1) {
  if (lib.count('oak_planks') < 6 && lib.count('oak_log') > 0) {
    await lib.craft('oak_planks', 4);
  }
  await lib.craft('shield', 1);
  console.log('Shield crafted!');
  bot.chat('delta: Shield crafted! 100% Blaze fireball immunity achieved!');
}

// 5. Equip shield in off-hand
if (lib.count('shield') > 0) {
  await bot.equip(mcData.itemsByName.shield.id, 'off-hand');
  console.log('Shield equipped in off-hand!');
}

// 6. Craft stone swords
console.log('Crafting stone swords...');
if (lib.count('stone_sword') < 2) {
  try {
    if (lib.count('stick') < 2) {
      await lib.craft('stick', 4);
    }
    await lib.craft('stone_sword', 2);
    console.log('Stone swords crafted!');
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

console.log('Ready to enter Nether! Inv:', JSON.stringify(lib.inv()));

// 7. Walk to Nether portal at (298, 72, -54)
console.log('Moving to Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {
  console.log('Path to portal note:', e.message);
  await lib.goTo(298, 72, -54, 2);
}

// Step into portal
console.log('Stepping into portal frame...');
await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal frame. Waiting for dimension transition...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat(`delta: Re-entered Nether at ${lib.fmt(bot.entity.position)} with shield equipped in offhand!`);
}
