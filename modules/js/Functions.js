export function logStart(method) {
  console.log(`start : ${method}`);
}

export function logEnd(method) {
  console.log(`end   : ${method}`);
}

/**
 * return the list of player objects in the same order that they are referenced in
 * gamedatas.playerorder (which is the order of play of the players)
 */
export function getSortedPlayers(gamedatas) {
  let sortedPlayers = [];
  gamedatas.playerorder.forEach((playerId) => {
    let player = Object.values(gamedatas.players).filter(
      (player) => player.id == playerId,
    )[0];
    sortedPlayers.push(player);
  });
  return sortedPlayers;
}
