// programs/225-prep-portal-site-and-assist-beta.js
console.log('=== Program 225: Prep Portal Frame & Assist Beta ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time());

// 1. Exit base
console.log('Stepping outside base...');
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door exit note:', e.message);
}

// 2. Go to portal site at (298, 72, -54)
console.log('Moving to portal site (298, 72, -54)...');
try {
  await lib.goTo(298, 72, -52, 2, { timeoutMs: 20000 });
} catch (e) {
  console.log('Go to portal note:', e.message);
}

// 3. Inspect portal frame requirements
const frame = lib.shapes.portal(298, 72, -54, 'x');
console.log('Portal frame materials status before build:', JSON.stringify(lib.materials(frame)));

// Place the cobblestone corners if any missing
try {
  const result = await lib.build(frame, { replace: false });
  console.log('lib.build frame result:', JSON.stringify(result));
} catch (e) {
  console.log('lib.build note:', e.message);
}

const afterMat = lib.materials(frame);
console.log('Portal frame materials status after build:', JSON.stringify(afterMat));

// 4. Check Beta
if (bot.players.beta) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', b ? lib.fmt(b.position) : 'unknown', 'held:', b?.heldItem?.name);
}

bot.chat(`beta: Portal frame ready at (298, 72, -54). Missing: ${JSON.stringify(afterMat.missing)}. Waiting for your 10 obsidian!`);

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Inventory:', JSON.stringify(lib.inv()));
