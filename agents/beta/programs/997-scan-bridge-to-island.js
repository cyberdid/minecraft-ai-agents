console.log('=== Program 997: Scan & Bridge to Main Island ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Cobblestone count:', lib.count('cobblestone'));

// Scan blocks along the line from x=100 down to x=60 at z=0, z=1, z=2
console.log('Scanning line towards Main Island (x=100 down to x=60)...');
let firstSolidIslandX = null;

for (let x = 100; x >= 60; x--) {
  let hasSolid = false;
  for (let z = -2; z <= 2; z++) {
    for (let y = 45; y <= 60; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.boundingBox === 'block' && b.name !== 'air') {
        hasSolid = true;
        if (b.name === 'end_stone' && firstSolidIslandX === null) {
          firstSolidIslandX = x;
        }
      }
    }
  }
  if (!hasSolid) {
    console.log(`Gap at x=${x}: no solid block in z=[-2..2], y=[45..60]`);
  }
}

console.log(`First solid end_stone island block detected at x=${firstSolidIslandX}`);

// Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) {
  console.log('No cobblestone!');
  return { pos: bot.entity.position };
}

await bot.equip(cobble, 'hand');

// Bridge safely from current X down to the solid island
// Sneak to prevent falling off edges
bot.setControlState('sneak', true);

// Keep gaze down to avoid Enderman aggro
await bot.look(0, -Math.PI / 3, true);

let curPos = bot.entity.position.clone();
console.log(`Starting safe bridge build from pos ${lib.fmt(curPos)}...`);

for (let targetX = Math.floor(curPos.x); targetX >= 65 && !isCancelled(); targetX--) {
  // Check block under targetX at y=48
  const floorPos = new Vec3(targetX, 48, 0);
  const floorBlock = bot.blockAt(floorPos);

  if (!floorBlock || floorBlock.boundingBox !== 'block') {
    // Need to place floor block at floorPos
    // We can place against the previous block at (targetX + 1, 48, 0)
    const prevPos = new Vec3(targetX + 1, 48, 0);
    const prevBlock = bot.blockAt(prevPos);

    if (prevBlock && prevBlock.boundingBox === 'block') {
      console.log(`Placing bridge floor block at ${lib.fmt(floorPos)} against ${lib.fmt(prevPos)}...`);
      try {
        await bot.lookAt(prevPos.offset(0.5, 0.5, 0.5), true);
        await bot.placeBlock(prevBlock, new Vec3(-1, 0, 0));
        await sleep(200);
      } catch (err) {
        console.log(`Place error at x=${targetX}:`, err.message);
      }
    }
  }

  // Also place width expansion at z=1 for 2-wide bridge
  const floorPos2 = new Vec3(targetX, 48, 1);
  const floorBlock2 = bot.blockAt(floorPos2);
  if (!floorBlock2 || floorBlock2.boundingBox !== 'block') {
    const neighbor = bot.blockAt(floorPos);
    if (neighbor && neighbor.boundingBox === 'block') {
      try {
        await bot.lookAt(floorPos.offset(0.5, 0.5, 0.5), true);
        await bot.placeBlock(neighbor, new Vec3(0, 0, 1));
        await sleep(150);
      } catch (e) {}
    }
  }

  // Step forward onto placed block if floor is verified solid
  const stepTarget = new Vec3(targetX + 0.5, 49.0, 0.5);
  const checkFloor = bot.blockAt(new Vec3(targetX, 48, 0));
  if (checkFloor && checkFloor.boundingBox === 'block') {
    await bot.lookAt(stepTarget, true);
    bot.setControlState('forward', true);
    const sStart = Date.now();
    while (bot.entity.position.distanceTo(stepTarget) > 0.4 && Date.now() - sStart < 1500 && !isCancelled()) {
      await sleep(50);
    }
    bot.setControlState('forward', false);
  } else {
    console.log(`Floor at x=${targetX} not solid; stopping advance!`);
    break;
  }
}

bot.setControlState('sneak', false);

console.log('Bridge advance finished. Current pos:', lib.fmt(bot.entity.position));
console.log('Cobblestone remaining:', lib.count('cobblestone'));

return {
  pos: bot.entity.position,
  cobble: lib.count('cobblestone'),
  hp: bot.health
};
