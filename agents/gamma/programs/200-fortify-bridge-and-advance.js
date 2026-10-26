// programs/200-fortify-bridge-and-advance.js
console.log('--- FORTIFY BRIDGE GUARDRAIL & ADVANCE TO Z=-150 ---');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Equip weapon
await lib.equipWeapon();

// Check teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username}: ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

// Advance from z=-140 to z=-150 along x=44
for (let targetZ = -141; targetZ >= -150 && !isCancelled(); targetZ--) {
  console.log(`Advancing to z=${targetZ}...`);

  // 1. Verify floor is solid
  const floor = bot.blockAt(new Vec3(44, 64, targetZ));
  if (!floor || floor.boundingBox !== 'block') {
    console.log(`Placing floor at (44, 64, ${targetZ})...`);
    await lib.place('soul_sand', 44, 64, targetZ);
  }

  // 2. Place right-side parapet wall at (45, 65, targetZ) to block Blaze line of sight
  const rightWall = bot.blockAt(new Vec3(45, 65, targetZ));
  if ((!rightWall || rightWall.name === 'air') && lib.count('soul_sand') > 5) {
    try {
      await lib.place('soul_sand', 45, 65, targetZ);
      console.log(`Placed right parapet wall at (45, 65, ${targetZ})`);
    } catch (e) {
      // If place fails, continue
    }
  }

  // 3. Step forward
  await lib.walkTo(44.5, targetZ + 0.5, 2000);
  await lib.pickup(3);

  // Check health
  if (bot.health <= 12) {
    console.log('WARNING: Health taking damage! HP:', bot.health);
    break;
  }
}

console.log('Pos after advance:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

// Scan hostiles nearby
const hostiles = lib.hostiles(16);
console.log('Hostiles within 16m:', JSON.stringify(hostiles));

bot.chat(`gamma fortified bridge and reached ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20.`);
