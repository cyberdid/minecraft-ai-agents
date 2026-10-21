const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = require('minecraft-data')(bot.version);
const { Vec3 } = require('vec3');

console.log("Navigating towards cabin entrance at (40, 77, -19)...");
const moves = new Movements(bot, mcData);
moves.canDig = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(40, 77, -19, 1.5));
} catch (e) {
  console.log("Nav warning:", e.message);
}

// Equip dirt
const dirtItem = bot.inventory.items().find(i => i.name === 'dirt');
if (!dirtItem) {
  console.log("No dirt found in inventory!");
  return;
}
await bot.equip(dirtItem, 'hand');

// Pave the floor at Y=76 for X in [39..41], Z in [-22..-20]
let paved = 0;
for (let x = 39; x <= 41; x++) {
  for (let z = -22; z <= -20; z++) {
    const targetPos = new Vec3(x, 76, z);
    const blk = bot.blockAt(targetPos);
    if (blk && (blk.name === 'air' || blk.name === 'cave_air')) {
      const baseBlock = bot.blockAt(new Vec3(x, 75, z));
      if (baseBlock && baseBlock.name !== 'air') {
        console.log(`Paving floor at (${x}, 76, ${z}) against ${baseBlock.name}...`);
        try {
          await bot.lookAt(targetPos.offset(0.5, 0.5, 0.5));
          await bot.placeBlock(baseBlock, new Vec3(0, 1, 0));
          paved++;
          await bot.waitForTicks(5);
        } catch (err) {
          console.log(`Place error at (${x}, 76, ${z}):`, err.message);
        }
      }
    }
  }
}

console.log(`Paved ${paved} floor blocks with dirt!`);
bot.chat("Floor is paved! Nice and level.");
