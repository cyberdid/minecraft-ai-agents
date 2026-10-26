// programs/269-get-wool-for-bed2-and-flint.js
console.log('=== Step 27: Get wool for Bed 2 and flint for portal lighter ===');

// 1. Exit base
console.log('Exiting base door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Search for sheep
console.log('Searching for sheep near (320, 64, -40)...');
try {
  await lib.goToXZ(320, -40, { timeoutMs: 20000 });
} catch (e) {}

let sheep = Object.values(bot.entities).find(e => 
  e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48
);

if (!sheep) {
  console.log('Exploring towards (350, -30) for sheep...');
  try {
    await lib.goToXZ(350, -30, { timeoutMs: 20000 });
    sheep = Object.values(bot.entities).find(e => 
      e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48
    );
  } catch (e) {}
}

if (sheep) {
  console.log(`Found sheep at ${lib.fmt(sheep.position)}! Shearing...`);
  try {
    await bot.equip(mcData.itemsByName.shears.id, 'hand');
    await lib.goTo(sheep.position.x, sheep.position.y, sheep.position.z, 2, { timeoutMs: 15000 });
    await bot.activateEntity(sheep);
    await sleep(600);
    await lib.pickup(8);
    console.log('Sheared sheep successfully!');
  } catch (e) {
    console.log('Shear error:', e.message);
  }
}

// 3. Search for gravel for flint
console.log('Searching for gravel blocks near river...');
const gravels = bot.findBlocks({
  matching: b => b && b.name === 'gravel',
  maxDistance: 32,
  count: 10
});
console.log(`Found ${gravels.length} gravel blocks.`);

if (gravels.length > 0 && lib.count('flint') === 0) {
  console.log('Digging gravel for flint...');
  for (const gp of gravels.slice(0, 5)) {
    if (isCancelled() || lib.count('flint') > 0 || lib.time().secondsUntilNight < 120) break;
    try {
      await lib.goTo(gp.x, gp.y + 1, gp.z, 2, { timeoutMs: 12000 });
      await bot.equip(mcData.itemsByName.stone_axe.id, 'hand'); // or shovel/hand
      await lib.dig(gp.x, gp.y, gp.z);
      await lib.pickup(6);
    } catch (e) {
      console.log('Gravel dig note:', e.message);
    }
  }
}

// 4. Return to base
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -54, { timeoutMs: 30000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Return error:', e.message);
}

// 5. Inspect chest and combine wool for Bed 2
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Base chest contents:', JSON.stringify(chest));

const woolTypes = ['gray', 'light_gray', 'white', 'black', 'brown'];
let bedDone = false;
for (const wt of woolTypes) {
  const wn = `${wt}_wool`;
  const total = (chest[wn] || 0) + lib.count(wn);
  console.log(`Total ${wn}: ${total}`);
  if (total >= 3) {
    if (chest[wn]) {
      await lib.withdraw({ [wn]: chest[wn] }, chestPos.x, chestPos.y, chestPos.z);
    }
    const bn = `${wt}_bed`;
    console.log(`Crafting ${bn}...`);
    try {
      await lib.craft(bn, 1);
      console.log(`Placing ${bn} at (293, 72, -56)...`);
      await lib.place(bn, 293, 72, -56);
      console.log(`Verified Bed 2 block: ${lib.blockAt(293, 72, -56)?.name}`);
      bot.chat(`alpha: Bed 2 placed at (293, 72, -56)! Milestone 4 complete!`);
      bedDone = true;
      break;
    } catch (e) {
      console.log('Bed error:', e.message);
    }
  }
}

// 6. Craft flint and steel if flint acquired
if (lib.count('flint_and_steel') === 0 && lib.count('flint') > 0 && lib.count('iron_ingot') > 0) {
  console.log('Crafting flint_and_steel...');
  try {
    await lib.craft('flint_and_steel', 1);
    console.log('Flint and steel crafted!');
    bot.chat('alpha: Flint and steel crafted! Portal igniter ready.');
  } catch (e) {
    console.log('Flint and steel craft note:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Turn update. Bed 2: ${lib.blockAt(293, 72, -56)?.name}, flint_and_steel: ${lib.count('flint_and_steel')}, water_bucket: ${lib.count('water_bucket')}.`);
