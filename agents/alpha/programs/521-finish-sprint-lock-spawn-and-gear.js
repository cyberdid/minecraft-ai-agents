// programs/521-finish-sprint-lock-spawn-and-gear.js
console.log('=== Program 521: Finish Sprint, Lock Spawn & Gear Up ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Time until night:', lib.time().secondsUntilNight);

bot.pathfinder.stop();
await sleep(100);

// 1. Finish sprint to base camp
const waypoints = [
  new Vec3(250, 63, -50),
  new Vec3(290, 72, -54)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Heading to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}: ${e.message}`);
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(2500);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

console.log('Arrived outside base at:', lib.fmt(bot.entity.position));

// 2. Enter base through door at (294, 72, -54)
console.log('Entering base...');
try {
  await passDoorIn();
} catch (e) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (err) {
    console.log('Door attempt note:', err.message);
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Permanently lock spawn at base bed
console.log('Locking spawn at base bed...');
try {
  const result = await lib.setSpawn();
  console.log('Spawn set result:', result);
  bot.chat('alpha: Spawn permanently locked at base bed! Never returning to world spawn.');
} catch (err) {
  console.log('Set spawn note:', err.message);
}

// 4. Check furnace at (295, 72, -55) and collect any smelted iron
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    if (furnace.outputItem()) {
      console.log(`Taking ${furnace.outputItem().name} x${furnace.outputItem().count} from furnace!`);
      await furnace.takeOutput();
    }
    await furnace.close();
  } catch (err) {
    console.log('Furnace check note:', err.message);
  }
}

// 5. Check chest at (293, 72, -57) for gear or materials
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('Chest items:', chest.containerItems().map(i => `${i.name} x${i.count}`).join(', ') || 'empty');
    for (const item of chest.containerItems()) {
      if (item.name.includes('iron') || item.name.includes('plank') || item.name.includes('log') || item.name.includes('cobble') || item.name.includes('sword') || item.name.includes('pickaxe') || item.name.includes('shield')) {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name} x${item.count}`);
      }
    }
    await chest.close();
  } catch (err) {
    console.log('Chest note:', err.message);
  }
}

// 6. Equip armor/shield/weapon
await lib.equipArmor();
await lib.equipWeapon();

console.log('=== Base Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
