// programs/277-check-alpha-progress-and-night-prep.js
console.log('=== Step 35: Track Alpha obsidian mining and manage night ===');

// Check Alpha position & equipment
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log(`Alpha at: ${lib.fmt(alpha.position)}, dist: ${alpha.position.distanceTo(bot.entity.position).toFixed(1)}`);
  if (alpha.heldItem) console.log('Alpha held item:', alpha.heldItem.name);
}

// Check chest
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

let totalObs = (chest.obsidian || 0) + lib.count('obsidian');
console.log(`Total obsidian on Beta + chest: ${totalObs}`);

if (chest.obsidian) {
  console.log(`Withdrawing ${chest.obsidian} obsidian from chest...`);
  await lib.withdraw({ obsidian: chest.obsidian }, chestPos.x, chestPos.y, chestPos.z);
  totalObs = lib.count('obsidian');
}

// If 10 obsidian available, build and ignite portal
if (lib.count('obsidian') >= 10) {
  const frame = lib.shapes.portal(298, 72, -54, 'x');
  console.log('Building portal frame...');
  const res = await lib.build(frame);
  console.log('Build result:', JSON.stringify(res));

  console.log('Igniting portal at (299, 72, -54)...');
  const ig = await lib.ignite(299, 72, -54);
  console.log('Ignite result:', ig);
  bot.chat('alpha: NETHER PORTAL IS LIT AT (298, 72, -54)! MILESTONE 7 COMPLETE!');
}

// Check time until night
console.log('Time status:', lib.time());

// If night falls, ensure door is closed and sleep
if (lib.time().secondsUntilNight < 90) {
  try {
    await lib.door(294, 72, -54, false);
    console.log('Door safely closed for night.');
  } catch (e) {}

  if (lib.time().canSleep) {
    try {
      console.log('Sleeping in bed...');
      await lib.sleepInBed();
      console.log('Slept in bed!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}

console.log('Beta inv now:', JSON.stringify(lib.inv()));
bot.chat(`beta: At base door. Obsidian: ${totalObs}/10. Flint & steel ready. Night in ${lib.time().secondsUntilNight}s.`);
