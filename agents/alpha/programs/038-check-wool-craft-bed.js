// programs/038-check-wool-craft-bed.js
// Check chest for wool, craft second bed, place and sleep!

const chestPos = { x: 293, y: 72, z: -57 };
let contents = {};
try {
  contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
} catch (e) {
  console.log('Chest note:', e.message);
}

// Check for wool
const woolTypes = Object.keys(contents).filter(k => k.endsWith('_wool'));
console.log('Wool in chest:', woolTypes.map(w => `${w}: ${contents[w]}`).join(', '));

if (woolTypes.length > 0 && contents[woolTypes[0]] >= 3) {
  const woolName = woolTypes[0];
  console.log(`Withdrawing 3 ${woolName}...`);
  await lib.withdraw({ [woolName]: 3 }, chestPos.x, chestPos.y, chestPos.z);
  
  if (lib.count('*_planks') < 3 && lib.count('*_log') > 0) {
    await lib.craft('oak_planks', 4);
  }
  
  const bedName = woolName.replace('_wool', '_bed');
  console.log(`Crafting ${bedName}...`);
  await lib.craft(bedName, 1);
  console.log('Crafted bed! Total beds in inventory:', lib.count('*_bed'));
  
  // Find an empty spot for bed 2 (needs 2 blocks of solid ground)
  // Let's place at (295, 72, -56) or (293, 72, -55)
  try {
    await lib.place(bedName, 293, 72, -55);
    console.log('Placed second bed at (293, 72, -55)');
  } catch (e) {
    console.log('Place bed note:', e.message);
  }
}

// Now try sleeping in the second bed
const beds = lib.find('*_bed', { maxDistance: 5, count: 5 });
console.log('Total bed blocks nearby:', beds.length);
for (const b of beds) {
  try {
    const bedBlock = bot.blockAt(b.position);
    await bot.sleep(bedBlock);
    console.log(`Sleeping in bed at ${lib.fmt(b.position)}!`);
    break;
  } catch (e) {
    // try next
  }
}

// Wait for morning
while (!isCancelled()) {
  const t = lib.time();
  if (!t.night && (t.timeOfDay < 1000 || t.timeOfDay >= 23460)) {
    console.log(`Morning reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  await sleep(1500);
}

const finalTime = lib.time();
console.log('Final time:', finalTime);
return { time: finalTime };
