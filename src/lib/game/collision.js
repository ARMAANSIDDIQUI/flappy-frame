export function checkCollision(player, pipe) {
  const playerLeft = player.x - player.radius;
  const playerRight = player.x + player.radius;
  const playerTop = player.y - player.radius;
  const playerBottom = player.y + player.radius;

  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + pipe.width;

  if (playerRight > pipeLeft && playerLeft < pipeRight) {
    if (playerTop < pipe.topHeight || playerBottom > pipe.bottomY) {
      return true;
    }
  }

  return false;
}

export function checkBoundaryCollision(player, canvasHeight) {
  return player.y - player.radius < 0 || player.y + player.radius > canvasHeight;
}

export function checkPipePass(player, pipe) {
  const pipeCenter = pipe.x + pipe.width / 2;
  return !pipe.passed && player.x > pipeCenter;
}
