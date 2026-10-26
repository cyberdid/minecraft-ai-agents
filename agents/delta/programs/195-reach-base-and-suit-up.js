// programs/195-reach-base-and-suit-up.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Walk to base at (293, 72, -54)
bot.pathfinder.stop();
console.log('Walking final 50m to base...');
try {
  await lib.goTo(293, 72, -54, 2);
} catch (err) {
  console.log('goTo base notice:', err.message);
  // Fallback direct move
  await bot.lookAt(new Vec3(293, 72, -54), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  bot.setControlState('jump', true);
  await sleep(6000);
  bot.setControlState('forward', false);
  bot.setControlState('sprint', false);
  bot.setControlState('jump', false);
}

console.log('At base area pos:', lib.fmt(bot.entity.position));

// 2. Enter base shelter through door
const doorPos = new Vec3(294, 73, -54);
const door = bot.blockAt(doorPos) || bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door')) {
  try {
    await lib.goThroughDoor(door.position.x, door.position.y, door.position.z);
    console.log('Entered base through door!');
  } catch (err) {
    console.log('goThroughDoor error:', err.message);
    await lib.goTo(293, 72, -55, 1);
  }
} else {
  await lib.goTo(293, 72, -55, 1);
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// 3. Set spawn point at bed
try {
  await lib.setSpawn();
  console.log('Spawn successfully set at base bed!');
  bot.chat('delta: Inside Base Camp! Bed spawn point locked.');
} catch (err) {
  console.log('setSpawn notice:', err.message);
}

// 4. Check chest and withdraw any available equipment/leather
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name === 'chest') {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Chest contents:', items.map(i => `${i.name}x${i.count}`).join(', '));
    
    // Check if leather is available for boots
    const leather = items.find(i => i.name === 'leather');
    if (leather && leather.count >= 4 && lib.count('leather_boots') === 0) {
      console.log('Withdrawing leather for boots...');
      await chest.withdraw(leather.type, null, 4);
    }
    chest.close();
  } catch (err) {
    console.log('Chest inspection error:', err.message);
  }
}

// Craft leather boots if leather in inventory
if (lib.count('leather') >= 4 && lib.count('leather_boots') === 0) {
  try {
    await lib.craft('leather_boots', 1);
    await lib.equipArmor();
    console.log('Crafted and equipped leather boots!');
  } catch (err) {
    console.log('Craft boots error:', err.message);
  }
}

// 5. Check nearby players
for (const name in bot.players) {
  const p = bot.players[name];
  if (p && p.entity && p !== bot.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

console.log('Delta inventory:', JSON.stringify(lib.inv()));
console.log('Delta status:', JSON.stringify(lib.status()));
