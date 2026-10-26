// programs/191-return-to-base-and-check-chest.js
console.log('--- Step 1: Alpha returning to base ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Helper to kill nearby animal if one is right in front of us
async function tryQuickHunt() {
  const animals = ['cow', 'pig', 'sheep', 'chicken'];
  const target = Object.values(bot.entities).find(e => 
    e && animals.includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < 10
  );
  if (target) {
    console.log(`Quick hunt: attacking nearby ${target.name} at ${lib.fmt(target.position)}`);
    const axe = mcData.itemsByName.stone_axe?.id;
    if (axe) await bot.equip(axe, 'hand');
    const id = target.id;
    bot.pvp.attack(target);
    const deadline = Date.now() + 5000;
    while (bot.entities[id] && Date.now() < deadline) {
      await sleep(250);
    }
    bot.pvp.stop();
    await sleep(400);
    await lib.pickup(6);
  }
}

await tryQuickHunt();

// Path to base in 40-block stages to prevent A* search timeout
const waypoints = [
  { x: 370, z: -55 },
  { x: 330, z: -55 },
  { x: 298, z: -53 },
  { x: 294, z: -52 }
];

for (const wp of waypoints) {
  if (bot.entity.position.distanceTo(new Vec3(wp.x, bot.entity.position.y, wp.z)) > 5) {
    console.log(`Moving toward waypoint (${wp.x}, ${wp.z})...`);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 30000 });
      console.log(`Reached waypoint near (${wp.x}, ${wp.z}), pos: ${lib.fmt(bot.entity.position)}`);
      await tryQuickHunt();
    } catch (e) {
      console.log(`Waypoint (${wp.x}, ${wp.z}) warning: ${e.message}`);
    }
  }
}

// Final approach outside base door
console.log('Navigating to outside base door (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 1, { timeoutMs: 20000 });
} catch (e) {
  console.log('Approach door note:', e.message);
}

console.log('Position before entering door:', lib.fmt(bot.entity.position));

// Enter through door
if (bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 4) {
  console.log('Passing through base door into base...');
  try {
    if (typeof passDoorIn === 'function') {
      await passDoorIn();
    } else {
      await lib.goThroughDoor(294, 72, -54);
    }
    console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Door pass error:', e.message);
  }
}

// Inspect base chest
const chestPos = new Vec3(293, 72, -57);
console.log('Inspecting base chest at', lib.fmt(chestPos));
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
  
  // Check for any food in chest
  const foods = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'beef', 'porkchop', 'mutton', 'chicken'];
  const foodToTake = {};
  for (const f of foods) {
    if (contents[f] && contents[f] > 0) {
      foodToTake[f] = contents[f];
    }
  }
  if (Object.keys(foodToTake).length > 0) {
    console.log('Found food in chest:', JSON.stringify(foodToTake));
    // Withdraw up to 16 food
    const firstFood = Object.keys(foodToTake)[0];
    const takeCount = Math.min(foodToTake[firstFood], 16);
    await lib.withdraw({ [firstFood]: takeCount }, chestPos.x, chestPos.y, chestPos.z);
    console.log(`Withdrew ${takeCount} of ${firstFood}`);
    
    // Eat if needed
    if (firstFood.startsWith('cooked_') || firstFood === 'bread' || firstFood === 'apple') {
      console.log('Eating withdrawn food...');
      const foodItem = bot.inventory.items().find(i => i.name === firstFood);
      if (foodItem) {
        await bot.equip(foodItem, 'hand');
        bot.deactivateItem();
        bot.activateItem();
        await sleep(2000);
        bot.deactivateItem();
        console.log('Ate! Food now:', bot.food, 'Health:', bot.health);
      }
    }
  } else {
    console.log('No food found in base chest.');
  }
} catch (e) {
  console.log('Chest inspection error:', e.message);
}

// Check beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Beta at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

bot.chat(`beta: At base. Health: ${bot.health}/20, Food: ${bot.food}/20.`);
console.log('Finished 191. Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight, 's');
