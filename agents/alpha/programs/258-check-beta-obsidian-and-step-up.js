// programs/258-check-beta-obsidian-and-step-up.js
console.log('=== Program 258: Step Up & Check Beta Obsidian ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position));

// 1. Jump and walk forward onto the step
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(400);
bot.setControlState('jump', false);
await sleep(500);
bot.setControlState('forward', false);

console.log('After jump step, pos:', lib.fmt(bot.entity.position));

// 2. Check Beta status
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

// 3. Check portal frame at (298, 72, -54)
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal frame missing:', JSON.stringify(mat.missing));

bot.chat('beta: What is your obsidian count now? Ready to meet at (298, 72, -54) to light the portal!');
console.log('Alpha status:', JSON.stringify(lib.status()));
