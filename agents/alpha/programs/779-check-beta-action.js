// programs/779-check-beta-action.js
console.log('=== Program 779: Check Beta Action ===');
const beta = bot.players['beta']?.entity;
console.log(`Beta at: ${beta ? lib.fmt(beta.position) : 'unknown'}, held: ${beta?.heldItem?.name}`);

return {
  betaPos: beta ? lib.fmt(beta.position) : null,
  betaHeld: beta?.heldItem?.name || null
};
