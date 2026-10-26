// programs/217-bridge-slabs-to-183.js
console.log('--- CRAFT SLABS & BRIDGE TO Z=-183 ---');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Craft birch_slab (3 planks = 6 slabs)
try {
  console.log('Crafting birch_slab from birch_planks...');
  await lib.craft('birch_slab', 6);
  console.log('Slabs crafted! Count:', lib.count('birch_slab'));
} catch (e) {
  console.log('Slab craft note:', e.message);
}

console.log('Inv before bridging:', JSON.stringify(lib.inv()));

// 2. Bridge forward along x=44 from z=-174 towards z=-185
let currentZ = -174;
// Ensure we are standing on (44.5, 65, -173.5)
await lib.walkTo(44.5, -173.5, 2000);
bot.clearControlStates();

const bridgeMaterials = ['cobblestone', 'birch_slab', 'dirt', 'birch_planks'];

for (let z = -174; z >= -185 && !isCancelled(); z--) {
  const nextTarget = new Vec3(44, 64, z - 1);
  const nextBlock = bot.blockAt(nextTarget);

  if (!nextBlock || nextBlock.boundingBox !== 'block') {
    const curRef = bot.blockAt(new Vec3(44, 64, z));
    if (!curRef || curRef.boundingBox !== 'block') {
      console.log(`No support block at (44, 64, ${z}) to bridge from!`);
      break;
    }
    
    // Pick available material
    const mat = bridgeMaterials.find(m => lib.count(m) > 0);
    if (!mat) {
      console.log('Out of bridging materials! Halting at z=', z);
      break;
    }

    console.log(`Placing ${mat} floor at (44, 64, ${z - 1})...`);
    const matId = mcData.itemsByName[mat].id;
    await bot.equip(matId, 'hand');
    try {
      await bot.placeBlock(curRef, new Vec3(0, 0, -1));
      await sleep(150);
    } catch (e) {
      console.log(`Place error at ${z - 1}:`, e.message);
      try { await lib.place(mat, 44, 64, z - 1); } catch (e2) {}
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
  if ((z - 1) % 2 === 0) {
    bot.chat(`gamma bridge advanced to (44, 64, ${z - 1})! Only ${Math.abs((z - 1) - (-188))}m to Spawner platform.`);
  }
}

console.log('Bridge advance finished! Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma walkway extended to ${lib.fmt(bot.entity.position)}! Only ~${bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1)}m from Blaze Spawner!`);
