// programs/215-bridge-forward-to-175.js
console.log('--- BRIDGE FLOOR FORWARD ALONG X=44 TOWARDS SPAWNER ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Cobblestone count:', lib.count('cobblestone'));

// Equip cobblestone
const cobbleItem = mcData.itemsByName.cobblestone.id;

bot.chat('gamma bridging solid cobblestone walkway North along x=44 towards Blaze Spawner...');

let currentZ = -163;
// Ensure we are standing on (44.5, 65, -162.5)
await lib.walkTo(44.5, -162.5, 2000);
bot.clearControlStates();

for (let z = -163; z >= -173 && lib.count('cobblestone') > 0 && !isCancelled(); z--) {
  const nextTarget = new Vec3(44, 64, z - 1);
  const nextBlock = bot.blockAt(nextTarget);

  if (!nextBlock || nextBlock.boundingBox !== 'block') {
    const curRef = bot.blockAt(new Vec3(44, 64, z));
    if (!curRef || curRef.boundingBox !== 'block') {
      console.log(`No support block at (44, 64, ${z}) to bridge from!`);
      break;
    }
    
    console.log(`Placing floor at (44, 64, ${z - 1})...`);
    await bot.equip(cobbleItem, 'hand');
    try {
      await bot.placeBlock(curRef, new Vec3(0, 0, -1));
      await sleep(150);
    } catch (e) {
      console.log(`Place error at ${z - 1}:`, e.message);
      // Try lib.place
      try { await lib.place('cobblestone', 44, 64, z - 1); } catch (e2) {}
    }
  }

  // Verify next block is solid before stepping
  const verified = bot.blockAt(nextTarget);
  if (verified && verified.boundingBox === 'block') {
    console.log(`Floor at (44, 64, ${z - 1}) verified (${verified.name})! Stepping forward...`);
    await lib.walkTo(44.5, (z - 1) + 0.5, 2000);
    bot.clearControlStates();
  } else {
    console.log(`Failed to verify floor at ${z - 1}! Halting advance.`);
    break;
  }

  // Check for nearby blazes to defend against
  const nearBlaze = bot.nearestEntity(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 5);
  if (nearBlaze) {
    console.log(`Blaze in attack range at ${lib.fmt(nearBlaze.position)}!`);
    await lib.equipWeapon();
    await bot.lookAt(nearBlaze.position);
    for (let h = 0; h < 4 && nearBlaze.isValid; h++) {
      bot.attack(nearBlaze);
      await sleep(650);
    }
    await lib.pickup(4);
  }

  // Periodic report
  if ((z - 1) % 3 === 0) {
    bot.chat(`gamma bridge advanced to (44, 64, ${z - 1})! Cobble remaining: ${lib.count('cobblestone')}`);
  }
}

console.log('Bridge advance finished! Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma walkway extended to ${lib.fmt(bot.entity.position)}! Only ~${bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1)}m from Blaze Spawner.`);
