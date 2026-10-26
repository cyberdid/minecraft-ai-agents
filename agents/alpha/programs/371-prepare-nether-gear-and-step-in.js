// programs/371-prepare-nether-gear-and-step-in.js
console.log('=== Program 371: Final Prep & Enter Nether Portal ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Withdraw available iron ingots from furnace (295, 72, -55)
try {
  const fBlock = bot.blockAt(new Vec3(295, 72, -55));
  if (fBlock) {
    const f = await bot.openFurnace(fBlock);
    const out = f.outputItem();
    if (out) {
      console.log(`Withdrawing ${out.count} ${out.name} from furnace...`);
      await f.takeOutput();
    }
    f.close();
  }
} catch (e) {
  console.log('Furnace note:', e.message);
}

// 2. Withdraw 1 oak_door from chest for Nether bunker
try {
  const chest = await lib.chestContents(293, 72, -57);
  if (chest['oak_door'] && chest['oak_door'] > 0) {
    console.log('Withdrawing 1 oak_door for Nether bunker...');
    await lib.withdraw({ oak_door: 1 }, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Alpha gear & inventory prepared:');
console.log('Inventory:', JSON.stringify(lib.inv()));
console.log('Cobblestone count:', lib.count('cobblestone'));

// 3. Announce to team
bot.chat('team: All Iron Age milestones complete! Alpha entering Nether portal (299, 73, -54) to establish Nether bridgehead!');

// 4. Exit base shelter to portal
console.log('Exiting base shelter...');
try {
  await globalThis.passDoorOut();
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// 5. Walk to Nether portal at (299, 73, -54)
console.log('Stepping into Nether portal block (299.5, 73, -54.5)...');
try {
  await lib.goTo(299.5, 73, -54.5, 0, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo portal note:', e.message);
  // Direct walk if close
  await bot.lookAt(new Vec3(299.5, 73, -54.5));
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

console.log('Inside portal frame! Waiting for teleportation to the_nether...');
// Standing inside portal takes ~4 seconds in survival
for (let wait = 0; wait < 20; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** TELEPORTED TO THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension);
console.log('Alpha position:', lib.fmt(bot.entity.position));
console.log('Surrounding environment:');
const p = bot.entity.position;
for (let dy = -1; dy <= 2; dy++) {
  const b = bot.blockAt(p.offset(0, dy, 0));
  console.log(`  dy=${dy}: ${b?.name}`);
}

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether! Portal arrived at ${lib.fmt(bot.entity.position)}. Setting up cobblestone bunker!`);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
