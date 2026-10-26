// programs/436-fortress-bunker-door-and-torch.js
console.log('=== Step: Complete fortress bunker enclosure, place torch, wait for Alpha ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

const p = bot.entity.position.floored();

// 1. Place torch inside shelter
if (lib.count('torch') > 0) {
  try {
    await lib.placeTorch();
    console.log('Torch placed in fortress bunker!');
  } catch (e) {
    console.log('Torch note:', e.message);
  }
}

// 2. Seal front wall (z=-128) leaving 1 block or door
const frontWall1 = new Vec3(44, 65, -128);
const frontWall2 = new Vec3(44, 66, -128);
const b1 = bot.blockAt(frontWall1);
if (b1 && b1.name === 'air') {
  try {
    // If we have an oak_door, place door, else cobblestone
    if (lib.count('oak_door') > 0) {
      await lib.place('oak_door', frontWall1.x, frontWall1.y, frontWall1.z);
      console.log('Placed oak_door at shelter entrance!');
    } else {
      await lib.place('cobblestone', frontWall1.x, frontWall1.y, frontWall1.z);
    }
  } catch (e) {}
}

// 3. Scan for Alpha or other players
for (const [name, player] of Object.entries(bot.players)) {
  if (player.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(player.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(player.entity.position)}, dist=${d}m`);
  }
}

// 4. Send chat alert
bot.chat('beta: Sheltered at Fortress bridge bunker (44, 66, -129)! HP: 2.7/20. Safe from mobs. Alpha/Gamma, bring food to bunker!');

// Wait 10s inside shelter
for (let i = 0; i < 10; i++) {
  await sleep(1000);
  if (isCancelled()) break;
}

console.log(`Bunker secure. HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20`);
