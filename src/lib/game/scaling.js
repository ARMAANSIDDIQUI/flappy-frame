export function scaleImage(img, maxSize) {
  const ratio = Math.min(maxSize / img.width, maxSize / img.height);
  return {
    width: img.width * ratio,
    height: img.height * ratio
  };
}

export function calculatePipeGap(score, baseGap = 180, minGap = 120) {
  const reduction = Math.min(score * 2, baseGap - minGap);
  return baseGap - reduction;
}

export function calculateGameSpeed(score, baseSpeed = 3, maxSpeed = 6) {
  const increase = Math.min(score * 0.05, maxSpeed - baseSpeed);
  return baseSpeed + increase;
}

export function interpolateColor(startColor, endColor, factor) {
  const result = startColor.map((start, i) => {
    return Math.round(start + (endColor[i] - start) * factor);
  });
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}
