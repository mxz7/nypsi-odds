export default function percentChance(percent: number) {
  if (percent >= 100) throw new TypeError("percent must be less than 100");
  if (percent < 0.0001) throw new TypeError("cannot accurately create a chance less than 0.0001%");
  let max = 100;

  while (percent < 1 || Boolean(percent % 1)) {
    max *= 10;
    percent *= 10;
  }

  if (percent >= Math.floor(Math.random() * max) + 1) return true;
  return false;
}
