// programs/274-meet-alpha-at-base-and-coordinate-obsidian.js
console.log('=== Step 32: Meet Alpha and coordinate obsidian gathering ===');

// Wait up to 30s for Alpha to reach the surface/base
const dl = Date.now() + 25000;
while (Date.now() < dl && !isCancelled()) {
  const alpha = bot.players['alpha']?.entity;
  if (alpha) {
    const dist = alpha.position.distanceTo(bot.entity.position);
    console.log(`Alpha at: ${lib.fmt(alpha.position)}, distance: ${dist.toFixed(1)}`);
    if (dist < 8) {
      console.log('Alpha is right here at base!');
      break;
    }
  }
  await sleep(2000);
}

// Check chest
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents now:', JSON.stringify(chest));

if (chest.diamond_pickaxe) {
  console.log('Alpha placed diamond_pickaxe in chest! Withdrawing...');
  await lib.withdraw({ diamond_pickaxe: 1 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Beta now holds diamond_pickaxe!');
}

console.log('Beta inventory:', JSON.stringify(lib.inv()));
console.log('Beta tools:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);

bot.chat('alpha: Welcome back! Frame needs 10 obsidian. Both of us have water buckets. Ready to quench lava and mine obsidian!');
