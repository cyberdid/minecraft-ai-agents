// programs/456-hunt-food-and-cobblestone.js
console.log('=== Program 456: Food, Cobblestone & Sword ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check armor slots
const armorSlots = {
  head: bot.inventory.slots[5]?.name,
  torso: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
};
console.log('Armor worn:', JSON.stringify(armorSlots));

// 2. Step outside base
console.log('Exiting base...');
try {
  await passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 3. Mine 16 cobblestone
console.log('Mining 16 cobblestone...');
const stoneBlocks = bot.findBlocks({
  matching: mcData.blocksByName.stone.id,
  maxDistance: 16,
  count: 20
});
console.log(`Found ${stoneBlocks.length} stone blocks`);
const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (pick) await bot.equip(pick, 'hand');

for (const sp of stoneBlocks) {
  if (lib.count('cobblestone') >= 20) break;
  try {
    const b = bot.blockAt(sp);
    if (!b || b.name !== 'stone') continue;
    await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
    await bot.dig(b);
    await lib.pickup(3);
  } catch (e) {}
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 4. Hunt 2 animals for food (cows, pigs, sheep)
console.log('Hunting animals for food...');
const animal = bot.nearestEntity(e => ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 32);
if (animal) {
  console.log(`Found ${animal.name} at ${lib.fmt(animal.position)}`);
  try {
    await lib.hunt(animal.name, 2);
  } catch (err) {
    console.log('Hunt note:', err.message);
  }
}

console.log('Inventory after hunt:', JSON.stringify(lib.inv()));

// 5. Return to base
console.log('Returning to base...');
await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
await passDoorIn();

// 6. Craft stone_sword at base crafting table
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  if (lib.count('stick') < 1) await lib.craft('stick', 4);
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

// 7. Smelt raw meat if any
const rawMeat = bot.inventory.items().find(i => ['beef', 'porkchop', 'mutton', 'chicken'].includes(i.name));
if (rawMeat) {
  console.log(`Smelting ${rawMeat.count} ${rawMeat.name}...`);
  try {
    const fuel = bot.inventory.items().find(i => ['coal', 'charcoal', 'oak_planks', 'stick'].includes(i.name));
    if (fuel) {
      await lib.smelt(rawMeat.name, fuel.name, rawMeat.count);
      console.log('Smelting complete!');
    }
  } catch (err) {
    console.log('Smelt note:', err.message);
  }
}

// 8. Eat food if food < 20
if (bot.food < 18) {
  try {
    await lib.eat();
    console.log('Ate food! Hunger is now:', bot.food);
  } catch (e) {}
}

await lib.equipWeapon();
await lib.equipArmor();

console.log('SUMMARY:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha ready for Nether! HP: ${bot.health}, Food: ${bot.food}, Gear: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}`);
