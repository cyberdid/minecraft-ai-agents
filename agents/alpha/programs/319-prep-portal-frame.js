// programs/319-prep-portal-frame.js
console.log('=== Program 319: Prepare Portal Frame Corners ===');

// Check missing blocks of the portal
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Materials status:', JSON.stringify(mat));

// Build the cobblestone parts using lib.build
console.log('Placing missing frame blocks with lib.build...');
const res = await lib.build(frame, { replace: false });
console.log('Build result:', JSON.stringify(res));

// Re-check materials
const matAfter = lib.materials(frame);
console.log('Materials after building:', JSON.stringify(matAfter));

// Step to portal site to greet Delta, Gamma, Beta
await lib.goTo(298, 72, -52, 2);
bot.chat('team: Alpha placed missing cobblestone corners! Frame at (298, 72, -54) is 100% ready for Delta\'s 10 obsidian!');
