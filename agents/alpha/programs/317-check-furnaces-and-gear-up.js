// programs/317-check-furnaces-and-gear-up.js
console.log('=== Program 317: Check Furnaces & Gear Up Alpha ===');

// Ask Delta about obsidian
bot.chat('delta: Delta, do you have the 10 obsidian and flint/steel? Ascend to base portal (298, 72, -54)!');

// Enter base door
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 5000 });
  await lib.goThroughDoor(294, 72, -54);
  await lib.door(294, 72, -54, false).catch(() => {});
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door note:', e.message);
}

// Check furnace array
const furnaces = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const f of furnaces) {
  try {
    const res = await lib.smeltStatus(f.x, f.y, f.z);
    console.log(`Furnace at ${lib.fmt(f)}:`, JSON.stringify(res));
    // Withdraw smelted items if any
    if (res.output && res.output.count > 0) {
      console.log(`Withdrawing ${res.output.count} ${res.output.name}...`);
      await lib.smeltCollect(f.x, f.y, f.z);
    }
  } catch (e) {
    console.log(`Furnace at ${lib.fmt(f)} note:`, e.message);
  }
}

// Check what items Alpha now has
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
