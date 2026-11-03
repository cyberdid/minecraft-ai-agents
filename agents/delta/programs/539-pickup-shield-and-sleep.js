// programs/539-pickup-shield-and-sleep.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: PICKUP SHIELD & COOPERATIVE SLEEP ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, TimeOfDay: ${bot.time.timeOfDay}`);

// Step 1: Pickup any dropped items in base (like the shield Alpha tossed)
try {
  await lib.pickup(4);
} catch (e) {}

// Step 2: Check chest for shield or food
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock && cBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(cBlock);
    const shieldItem = chest.containerItems().find(i => i.name === 'shield');
    if (shieldItem && lib.count('shield') === 0) {
      console.log('Withdrawing shield from chest...');
      await chest.withdraw(shieldItem.type, null, 1);
    }
    const foodItem = chest.containerItems().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken'].includes(i.name));
    if (foodItem) {
      console.log(`Withdrawing food: ${foodItem.name} x${foodItem.count}`);
      await chest.withdraw(foodItem.type, null, foodItem.count);
    }
    chest.close();
  } catch (e) {
    console.log('Chest access error:', e.message);
  }
}

// Step 3: Equip shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('SHIELD EQUIPPED IN OFFHAND!');
    bot.chat('delta: Shield equipped in offhand! Thank you Alpha!');
  }
} catch (e) {}

// Step 4: Eat if food available
try {
  const foodItem = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken'].includes(i.name));
  if (foodItem) {
    console.log(`Eating ${foodItem.name}...`);
    await bot.equip(foodItem, 'hand');
    await bot.consume();
  }
} catch (e) {}

// Step 5: Wait for nightfall (tick 12542) and sleep in bed
const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
console.log('Bed block:', bedBlock ? lib.fmt(bedBlock.position) : 'none');

bot.chat('delta: Ready at bed! Awaiting tick 12542 for synchronized night sleep!');

const start = Date.now();
while (!isCancelled() && Date.now() - start < 75000) {
  const t = bot.time.timeOfDay;
  
  if (t >= 12542 && t <= 23460) {
    console.log(`Night active! (timeOfDay=${t}). Sleeping in bed...`);
    if (bedBlock) {
      try {
        await bot.sleep(bedBlock);
        console.log('Delta is now sleeping in bed!');
        bot.chat('delta: In bed sleeping!');
        
        while (bot.isSleeping && !isCancelled()) {
          await sleep(500);
        }
        console.log(`Woke up! timeOfDay=${bot.time.timeOfDay}`);
        bot.chat('delta: Good morning! Night skipped successfully!');
        break;
      } catch (err) {
        console.log('Sleep attempt:', err.message);
        await sleep(1000);
      }
    }
  } else {
    // If night already passed (morning)
    if (t < 12000 && Date.now() - start > 15000) {
      console.log(`Daytime restored! (timeOfDay=${t})`);
      break;
    }
    await sleep(800);
  }
}

console.log('=== STATUS ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Shield: ${lib.count('shield')}, Offhand: ${bot.inventory.slots[45]?.name}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  shield: lib.count('shield'),
  offhand: bot.inventory.slots[45]?.name,
  time: bot.time.timeOfDay
};
