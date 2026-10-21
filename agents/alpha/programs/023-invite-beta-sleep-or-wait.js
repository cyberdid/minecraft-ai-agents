// programs/023-invite-beta-sleep-or-wait.js
// Message beta to sleep, deposit doors, sleep in bed

console.log('alpha status: timeOfDay', lib.time().timeOfDay, 'phase:', lib.time().phase);

// Wake if in bed so we can interact
try {
  await bot.wake();
  await sleep(500);
} catch (e) {}

// Deposit spare doors and saplings into chest
const chestPos = { x: 293, y: 72, z: -57 };
try {
  await lib.deposit({ oak_door: 'all', oak_sapling: 'all' }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Deposited spare doors/sapling');
} catch (e) {
  console.log('Deposit note:', e.message);
}

// Chat to beta
bot.chat('alpha: Beta, sleep in your bed now (await lib.sleepInBed()) so the server skips night to day!');

// Sleep in bed
console.log('Going to sleep in bed...');
try {
  await lib.sleepInBed();
  console.log('Alpha is now in bed');
} catch (e) {
  console.log('Sleep note:', e.message);
}

// Wait to see if night skips or monitor time
let skipped = false;
for (let i = 0; i < 30; i++) {
  await sleep(1000);
  const t = lib.time();
  if (!t.night || t.timeOfDay < 1000 || t.timeOfDay >= 23460) {
    skipped = true;
    console.log(`Night over! timeOfDay: ${t.timeOfDay}`);
    break;
  }
}

const time = lib.time();
console.log('Current time:', time);
return { time, skipped };
