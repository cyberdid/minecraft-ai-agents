// programs/290-check-surface-above.js
console.log('=== Program 290: Surface Above Inspection ===');

for (let y = 60; y <= 75; y++) {
  const p = new Vec3(336, y, -70);
  const b = bot.blockAt(p);
  console.log(`y=${y}: ${b?.name}`);
}

// Ask Beta about obsidian
bot.chat('beta: Beta, what is your obsidian count? Are you holding 10 obsidian?');
