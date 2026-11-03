// programs/881-return-to-base-regear-milestone13.js
console.log('=== Program 881: Return to Base & Regear for Milestone 13 ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('alpha: VICTORY! [Free the End] & [The Next Generation] ACHIEVED! Returning to Base House (293, 72, -55) to unite with team for Milestone 13!');

// 1. Pathfind to Base House (293, 72, -55)
const baseDoor = new Vec3(294.0, 72.0, -54.0);
console.log(`Pathfinding from ${lib.fmt(bot.entity.position)} to Base Door at ${lib.fmt(baseDoor)}...`);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(baseDoor.x, baseDoor.y, baseDoor.z, 1.5));
} catch (e) {
  console.log('Pathfinder error, trying goToXZ:', e.message);
  try {
    await lib.goToXZ(baseDoor.x, baseDoor.z, { timeoutMs: 25000 });
  } catch (e2) {}
}

// 2. Go through base door into house
console.log('Entering Base House...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(293, 72, -56));
  } catch (e2) {}
}

console.log(`Inside Base: pos=${lib.fmt(bot.entity.position)}`);

// 3. Greet teammates
const team = Object.values(bot.entities).filter(e => ['beta', 'gamma', 'delta'].includes(e.username));
console.log(`Teammates inside/near base: ${team.length}`);
for (const tm of team) {
  console.log(`  ${tm.username} at ${lib.fmt(tm.position)}`);
}
bot.chat('alpha: United with team at Base House! Ready for Milestone 13 Outer End & Elytra expedition!');

// 4. Access Base Chest at (293, 72, -57) to deposit blocks and restock
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Base Chest items:', chest.items().map(i => `${i.name}x${i.count}`).join(', '));
    
    // Deposit excess stone/dirt
    for (const item of bot.inventory.items()) {
      if (['cobbled_deepslate', 'granite', 'diorite', 'andesite', 'soul_sand'].includes(item.name)) {
        try {
          await chest.deposit(item.type, null, item.count);
          console.log(`Deposited ${item.name}x${item.count}`);
        } catch (de) {}
      }
    }
    
    // Withdraw food if needed
    const food = chest.items().find(i => ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread'].includes(i.name));
    if (food && lib.count(food.name) < 16) {
      await chest.withdraw(food.type, null, Math.min(food.count, 16 - lib.count(food.name)));
    }
    
    chest.close();
  } catch (e) {
    console.log('Chest interaction note:', e.message);
  }
}

// 5. Equip armor and Netherite Sword
try { await lib.equipArmor(); } catch (e) {}
const ns = bot.inventory.items().find(i => i.name.includes('netherite_sword') || i.name.includes('sword'));
if (ns) await bot.equip(ns, 'hand');

console.log('Alpha restocked and ready for Milestone 13!');
console.log(`Final state: HP=${bot.health}, Food=${bot.food}, Inv: ${JSON.stringify(lib.inv())}`);
