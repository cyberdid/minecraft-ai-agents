// programs/268-craft-iron-helmet-sleep-night.js
console.log('=== Step 26: Craft iron helmet, equip armor, sleep/shelter during night ===');

// 1. Craft iron helmet (5 iron ingots)
if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
  console.log('Crafting iron_helmet...');
  try {
    await lib.craft('iron_helmet', 1);
    await lib.equipArmor();
    console.log('Iron helmet crafted and equipped!');
  } catch (e) {
    console.log('Iron helmet craft note:', e.message);
  }
}

console.log('Beta armor and gear:', {
  inv: lib.inv(),
  tools: lib.tools()
});

// 2. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 3. Sleep in bed
console.log('Attempting sleep in bed...');
try {
  await lib.sleepInBed();
  console.log('Slept in bed!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

// 4. Stay safe in base until dawn (timeOfDay >= 23460 or day)
const dl = Date.now() + 45000;
while (Date.now() < dl && !isCancelled()) {
  const t = lib.time();
  if (t.phase === 'day') {
    console.log('Day has broken!');
    break;
  }
  await sleep(3000);
}

console.log('Beta pos:', lib.fmt(bot.entity.position));
console.log('Current time:', lib.time());
bot.chat('alpha: Safe in base with iron helmet, shield, iron pickaxe, water bucket. Ready to support portal prep.');
