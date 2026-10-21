// programs/071-check-door.js
const bl = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door name:', bl.name);
console.log('Door props:', JSON.stringify(bl.getProperties()));
