// programs/004-prep-and-gather.js
// Gather wood and stone, flatten base footprint

console.log('--- Step 1: Collect logs ---');
try {
  const gotWood = await lib.collect('*_log', 5);
  console.log('Wood collected:', JSON.stringify(gotWood));
} catch (e) {
  console.log('Wood collect note:', e.message);
}

console.log('--- Step 2: Collect stone ---');
try {
  const gotStone = await lib.collect('stone', 25);
  console.log('Stone collected:', JSON.stringify(gotStone));
} catch (e) {
  console.log('Stone collect note:', e.message);
}

console.log('Inventory now: cobblestone:', lib.count('cobblestone'), 'logs:', lib.count('*_log'));

console.log('--- Step 3: Flatten base site (292, -58) to (296, -54) at y=72 ---');
try {
  await lib.flatten(292, -58, 296, -54, 72);
  console.log('Site flattened successfully');
} catch (e) {
  console.log('Flatten note:', e.message);
}

const time = lib.time();
console.log('Time remaining until night:', time.secondsUntilNight, 's');

return {
  cobblestone: lib.count('cobblestone'),
  logs: lib.count('*_log'),
  time: time.secondsUntilNight
};
