// programs/296-sleep-night-and-gear-up.js
console.log('=== Step 52: Sleep night, withdraw cobblestone, craft basic tools ===');

// 1. Wait for bedtime (tick 12542) and sleep
console.log('Waiting for sleep tick 12542...');
const deadline = Date.now() + 45000;
let slept = false;

while (Date.now() < deadline && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep && !slept) {
    console.log(`Sleep tick reached (${t.timeOfDay}). Sleeping...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
      slept = true;
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
  await sleep(1500);
  if (slept && lib.time().phase === 'day') {
    console.log('Morning arrived!');
    break;
  }
}

// 2. Withdraw cobblestone from chest
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.withdraw({ cobblestone: 32 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew 32 cobblestone from chest.');
} catch (e) {
  console.log('Withdraw note:', e.message);
}

// 3. Exit base door in morning to get wood for sticks
console.log('Exiting base to chop 6 logs for tools & fuel...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

try {
  const got = await lib.collect('*_log', 6);
  console.log('Collected logs:', JSON.stringify(got));
} catch (e) {
  console.log('Collect log note:', e.message);
}

// 4. Return to base and craft tools
await lib.goTo(294, 72, -53, 1);
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

if (lib.count('*_log') > 0) {
  const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  await lib.craft(logType.replace('_log', '_planks'), 16);
  await lib.craft('stick', 12);
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_axe', 1);
  await lib.craft('stone_sword', 1);
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time status:', lib.time());

bot.chat(`beta: Re-geared with stone tools from base chest. Ready to gather iron!`);
