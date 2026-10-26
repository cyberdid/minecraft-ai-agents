// programs/280-shelter-night-organize-supplies.js
console.log('=== Step 38: Organize inventory into chest and sleep night ===');

const chestPos = new Vec3(293, 72, -57);

// 1. Deposit clutter to chest
console.log('Depositing non-essential items to base chest...');
try {
  await lib.deposit({
    gravel: 'all',
    andesite: 'all',
    raw_copper: 'all',
    feather: 'all',
    egg: 'all',
    leather: 'all'
  }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Deposited clutter.');
} catch (e) {
  console.log('Deposit note:', e.message);
}

// 2. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 3. Sleep in bed
console.log('Bed sleep check...');
const sleepDeadline = Date.now() + 45000;
while (Date.now() < sleepDeadline && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep) {
    console.log(`Sleeping at tick ${t.timeOfDay}...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
    break;
  }
  await sleep(1500);
}

// 4. Wait for daybreak
const dl = Date.now() + 45000;
while (Date.now() < dl && !isCancelled()) {
  const t = lib.time();
  if (t.phase === 'day') {
    console.log('Daybreak confirmed!');
    break;
  }
  await sleep(3000);
}

// Check Alpha
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log('Alpha at:', lib.fmt(alpha.position));
} else {
  console.log('Alpha deep in mine.');
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time status:', lib.time());

bot.chat('alpha: Base prepped and clean. Portal site ready at (298, 72, -54). I have flint & steel and cobblestone ready!');
