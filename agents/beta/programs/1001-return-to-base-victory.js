console.log('=== Program 1001: Return to Base House - Victory Celebration ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

bot.chat('Beta: VICTORY! Ender Dragon defeated! [Free the End] & [The Next Generation] achieved! Returning to Base House!');

// Navigate back to Base House at (293, 72, -55) (~92m away)
const baseDoor = new Vec3(294, 72, -54);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

console.log(`Walking back to Base House entrance ${lib.fmt(baseDoor)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(294.0, 72.0, -53.0, 1.5));
} catch (err) {
  console.log('Pathfinder info:', err.message);
  try {
    await lib.goToXZ(294, -53, { timeoutMs: 15000 });
  } catch (e2) {}
}

console.log('At base entrance! Passing through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door passage info:', e.message);
}

console.log(`Inside Base House! Pos: ${lib.fmt(bot.entity.position)}`);

// Deposit inventory clutter into Base Chest (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const junk = ['granite', 'andesite', 'lapis_lazuli', 'stone_bricks', 'end_stone', 'crying_obsidian', 'blackstone', 'bone', 'blaze_powder'];
    for (const j of junk) {
      const it = bot.inventory.items().find(i => i.name === j);
      if (it) try { await chest.deposit(it.type, null, it.count); } catch (e) {}
    }
    chest.close();
  } catch (e) {}
}

// Equip Netherite Sword
const nSword = bot.inventory.items().find(i => i.name === 'netherite_sword');
if (nSword) try { await bot.equip(nSword, 'hand'); } catch (e) {}

// Equip armor
try { await lib.equipArmor(); } catch (e) {}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
