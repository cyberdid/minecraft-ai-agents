// programs/283-ascend-and-complete-bed2.js
console.log('=== Step 41: Ascend shaft, shear sheep for 3rd wool, complete Bed 2 ===');

// 1. Ascend shaft from (322, 18, -69) to surface (302, 71, -44)
console.log('Ascending shaft to surface...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 35000, dig: true });
  console.log('Reached surface! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent note:', e.message);
}

// 2. Head towards grassland (410, 72, 30) to find sheep
console.log('Heading towards grassland (410, 72, 30) for sheep...');
let sheep = Object.values(bot.entities).find(e => 
  e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48
);

if (!sheep) {
  try {
    await lib.goToXZ(410, 30, { timeoutMs: 30000 });
    sheep = Object.values(bot.entities).find(e => 
      e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48
    );
  } catch (e) {
    console.log('Go to grassland note:', e.message);
  }
}

if (!sheep) {
  // Try nearby around current pos
  sheep = Object.values(bot.entities).find(e => e && e.name === 'sheep' && e.position);
}

if (sheep) {
  console.log(`Found sheep at ${lib.fmt(sheep.position)}! Shearing...`);
  try {
    await bot.equip(mcData.itemsByName.shears.id, 'hand');
    await lib.goTo(sheep.position.x, sheep.position.y, sheep.position.z, 2, { timeoutMs: 15000 });
    await bot.activateEntity(sheep);
    await sleep(600);
    await lib.pickup(8);
    console.log('Sheared sheep! Inventory now has wool:', JSON.stringify(Object.fromEntries(Object.entries(lib.inv()).filter(([k]) => k.includes('wool')))));
  } catch (e) {
    console.log('Shear note:', e.message);
    // If shear fails, try attack
    try {
      await lib.equipWeapon();
      bot.pvp.attack(sheep);
      const dl = Date.now() + 10000;
      while (bot.entities[sheep.id] && Date.now() < dl) await sleep(250);
      bot.pvp.stop();
      await lib.pickup(8);
    } catch (e2) {}
  }
}

// 3. Return to base
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -54, { timeoutMs: 30000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Return note:', e.message);
}

// 4. Combine wool with chest and craft Bed 2
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

const woolColors = ['gray', 'light_gray', 'white', 'black', 'brown'];
let bed2Done = false;

for (const c of woolColors) {
  const wn = `${c}_wool`;
  const total = (chest[wn] || 0) + lib.count(wn);
  console.log(`Checking ${wn}: total ${total}`);
  if (total >= 3) {
    if (chest[wn]) {
      console.log(`Withdrawing ${chest[wn]} ${wn} from chest...`);
      await lib.withdraw({ [wn]: chest[wn] }, chestPos.x, chestPos.y, chestPos.z);
    }
    const bn = `${c}_bed`;
    console.log(`Crafting ${bn}...`);
    try {
      await lib.craft(bn, 1);
      console.log(`Placing ${bn} at (293, 72, -56)...`);
      await lib.place(bn, 293, 72, -56);
      const placed = lib.blockAt(293, 72, -56)?.name;
      console.log(`Verified Bed 2 block: ${placed}`);
      if (placed && placed.includes('bed')) {
        bed2Done = true;
        bot.chat(`alpha: Bed 2 (${bn}) placed at (293, 72, -56)! Both beds ready. MILESTONE 4 COMPLETE!`);
      }
    } catch (e) {
      console.log('Bed craft/place error:', e.message);
    }
    break;
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Bed 2 status: ${lib.blockAt(293, 72, -56)?.name}. Night in ${lib.time().secondsUntilNight}s.`);
