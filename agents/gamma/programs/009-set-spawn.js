// programs/009-set-spawn.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Set spawn on bed
try {
  const res = await lib.setSpawn();
  console.log('setSpawn result:', res);
} catch (e) {
  console.log('setSpawn error:', e.message);
}

// Check door
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door) {
  console.log('Door isOpen:', door._properties ? door._properties.open : 'unknown');
  // Make sure it is closed
  try {
    await lib.door(294, 72, -54, false);
    console.log('Door closed successfully');
  } catch (e) {
    console.log('Door close error:', e.message);
  }
}

bot.chat('gamma spawn set at base!');
