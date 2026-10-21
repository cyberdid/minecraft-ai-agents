// programs/013-night-vigil.js
// Stow clutter into chest, coordinate with beta, and wait safely until dawn (tick 23460)

const chestPos = { x: 293, y: 72, z: -57 };

// 1. Deposit clutter into chest (keep tools, 11 dirt, 4 cobble, apple)
try {
  await lib.deposit({ dioritex4: 'all', gravel: 'all', oak_door: 'all', oak_sapling: 'all' }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Deposited clutter into chest');
} catch (e) {
  // If exact keys differ, deposit specific items
  console.log('Deposit note:', e.message);
}

bot.chat('alpha: Stowed clutter. Ready for dawn to gather wood, make torches, and hunt sheep.');

// 2. Wait until dawn
console.log('Waiting inside base for dawn (tick 23460)...');
let lastReport = 0;
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay >= 0 && t.timeOfDay < 12000)) {
    console.log(`Dawn arrived! timeOfDay: ${t.timeOfDay}, phase: ${t.phase}`);
    break;
  }
  if (Date.now() - lastReport > 20000) {
    console.log(`Night vigil: timeOfDay ${t.timeOfDay}, hostiles in 16: ${lib.hostiles(16).length}`);
    lastReport = Date.now();
  }
  await sleep(5000);
}

const finalTime = lib.time();
console.log('Final time:', finalTime);
const hostiles = lib.hostiles(16);
console.log('Hostiles outside:', JSON.stringify(hostiles));

return {
  time: finalTime,
  hostiles: hostiles,
  inv: lib.inv()
};
