// programs/660-test-load.js
delete require.cache[require.resolve('/home/cyberdid/Projects/Minecraft/agents/team/autoload.js')];
require('/home/cyberdid/Projects/Minecraft/agents/team/autoload.js');
delete require.cache[require.resolve('/home/cyberdid/Projects/Minecraft/agents/alpha/autoload.js')];
require('/home/cyberdid/Projects/Minecraft/agents/alpha/autoload.js');

console.log('Helpers available:');
console.log('quickRegear:', typeof globalThis.quickRegear);
console.log('enterNetherPortal:', typeof globalThis.enterNetherPortal);
console.log('marchToSpawnerPillbox:', typeof globalThis.marchToSpawnerPillbox);
console.log('safeMarchToPillbox:', typeof globalThis.safeMarchToPillbox);
console.log('farmBlazeRodsAtPillbox:', typeof globalThis.farmBlazeRodsAtPillbox);
console.log('retreatToOverworldBase:', typeof globalThis.retreatToOverworldBase);
