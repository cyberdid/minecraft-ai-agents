// programs/088-clear-grid-and-ascend.js
console.log('--- RECOVER & ASCEND TO SURFACE ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Recover any stuck items in crafting grid
try {
  await lib.clearCraftingGrid();
  await lib.stowCursor();
} catch (e) {
  console.log('Grid clear note:', e.message);
}

console.log('Inventory after grid clear:', JSON.stringify(lib.inv()));

// 2. Ascend via Main Shaft staircase:
// Shaft entrance is at (302, 71, -44), running down to y=48..54
console.log('Navigating to shaft waypoint y=50: (302, 50, -44)...');
try {
  await lib.goTo(302, 50, -44, 2, { dig: true, timeoutMs: 25000 });
  console.log('At shaft y=50:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft y=50 note:', e.message);
}

console.log('Navigating to shaft waypoint y=60: (302, 60, -44)...');
try {
  await lib.goTo(302, 60, -44, 2, { dig: true, timeoutMs: 25000 });
  console.log('At shaft y=60:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft y=60 note:', e.message);
}

console.log('Navigating to surface shaft entrance: (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 25000 });
  console.log('SURFACE REACHED! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft surface note:', e.message);
}

// 3. Move to base door (294, 72, -53)
console.log('Moving to base door exterior at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  console.log('At base door exterior:', lib.fmt(bot.entity.position));
  await lib.goThroughDoor(294, 72, -54);
  console.log('INSIDE BASE SHELTER! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Base door enter note:', e.message);
}

// 4. Report status
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma at ${lib.fmt(bot.entity.position)}. Health: ${bot.health}, Food: ${bot.food}. Ready to craft stone tools.`);
