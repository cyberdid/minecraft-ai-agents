// programs/357-place-step-and-ascend.js
console.log('=== Place cobblestone step and climb to y=25 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Place cobblestone at (303, 23, -44)
console.log('Placing cobblestone step at (303, 23, -44)...');
try {
  await lib.place('cobblestone', 303, 23, -44);
  console.log('Placed step block!');
} catch (e) {
  console.log('Place note:', e.message);
}

// Step onto (303, 24, -44)
await bot.lookAt(new Vec3(303, 24, -44), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(600);
bot.clearControlStates();
console.log('Pos on step:', lib.fmt(bot.entity.position));

// Step onto (303, 25, -43)
await bot.lookAt(new Vec3(303, 25, -43), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(600);
bot.clearControlStates();
console.log('Pos on diorite:', lib.fmt(bot.entity.position));

// Step onto (303, 26, -42)
await bot.lookAt(new Vec3(303, 26, -42), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(600);
bot.clearControlStates();
console.log('Pos at y=26:', lib.fmt(bot.entity.position));

console.log('Final pos:', lib.fmt(bot.entity.position));
