// programs/457-craft-sword-climb-up-and-hunt.js
console.log('=== Program 457: Climb Up, Craft Sword & Food ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Climb up from pit (y < 71) to base floor y=72
if (bot.entity.position.y < 71) {
  console.log(`Climbing up from y=${bot.entity.position.y.toFixed(1)} to y=72...`);
  try {
    await lib.goTo(294, 72, -54, 1);
  } catch (e) {
    console.log('lib.goTo error, towering up manually:', e.message);
    for (let i = 0; i < 8 && bot.entity.position.y < 71.5; i++) {
      const mat = bot.inventory.items().find(it => ['dirt', 'cobblestone', 'tuff', 'oak_planks'].includes(it.name));
      if (!mat) break;
      await bot.equip(mat, 'hand');
      bot.setControlState('jump', true);
      await sleep(250);
      const floorBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (floorBlock) {
        try { await bot.placeBlock(floorBlock, new Vec3(0, 1, 0)); } catch (err) {}
      }
      bot.setControlState('jump', false);
      await sleep(250);
    }
  }
}
console.log('Now at base floor:', lib.fmt(bot.entity.position));

// 2. Ensure base floor hole is plugged
const pitBlock = bot.blockAt(new Vec3(293, 71, -55));
if (pitBlock && pitBlock.name === 'air') {
  console.log('Plugging floor pit at (293, 71, -55)...');
  try {
    await lib.place('cobblestone', 293, 71, -55);
  } catch (e) {}
}

// 3. Craft stone_sword at base crafting table (295, 72, -56)
console.log('Crafting stone_sword...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(295, 72, -56, 2));
  await lib.craft('stone_sword', 1);
  console.log('Stone sword crafted successfully!');
} catch (err) {
  console.log('Sword craft note:', err.message);
}

await lib.equipWeapon();

// 4. Step outside base to hunt animals for meat
console.log('Stepping outside to hunt animals...');
try {
  await passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// Find nearest animal
const animalTypes = ['cow', 'pig', 'sheep', 'chicken'];
const targets = bot.entities;
let bestTarget = null;
let bestDist = 48;
for (const e of Object.values(targets)) {
  if (animalTypes.includes(e.name)) {
    const dist = e.position.distanceTo(bot.entity.position);
    if (dist < bestDist) {
      bestDist = dist;
      bestTarget = e;
    }
  }
}

if (bestTarget) {
  console.log(`Hunting ${bestTarget.name} at ${lib.fmt(bestTarget.position)} (dist ${bestDist.toFixed(1)}m)...`);
  try {
    await lib.hunt(bestTarget.name, 2);
    console.log('Hunt successful!');
  } catch (err) {
    console.log('Hunt note:', err.message);
  }
} else {
  console.log('No animals found within 48m, checking wider area...');
  try {
    await lib.hunt('cow', 1);
  } catch (e) {
    try { await lib.hunt('sheep', 1); } catch (e2) {}
  }
}

console.log('Inventory after hunt:', JSON.stringify(lib.inv()));

// 5. Return to base
console.log('Returning to base...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 6. Smelt raw meat in base furnace
const meat = bot.inventory.items().find(i => ['beef', 'porkchop', 'mutton', 'chicken'].includes(i.name));
if (meat) {
  console.log(`Smelting ${meat.count} ${meat.name}...`);
  try {
    const fuel = bot.inventory.items().find(i => ['coal', 'charcoal', 'oak_planks', 'stick'].includes(i.name)) || { name: 'oak_planks' };
    await lib.smelt(meat.name, fuel.name, meat.count);
    console.log('Meat cooked!');
  } catch (err) {
    console.log('Smelting note:', err.message);
  }
}

// 7. Eat food to restore hunger
if (bot.food < 18) {
  try {
    await lib.eat();
    console.log('Ate food! Food level is now:', bot.food);
  } catch (e) {}
}

console.log('FINAL SUMMARY:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha ready! HP: ${bot.health}, Food: ${bot.food}, Gear: ${JSON.stringify(lib.tools())}`);
