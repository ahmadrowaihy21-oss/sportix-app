export function formatSar(amount: number) {
  return `${amount.toLocaleString("en-US")} SAR`;
}

export function formatPoints(amount: number) {
  return amount.toLocaleString("en-US");
}

export const POINT_SAR = 1;

export function pointsToSar(points: number) {
  return points * POINT_SAR;
}

export function maxCoverable(priceSar: number, availablePoints: number) {
  return Math.min(priceSar, pointsToSar(availablePoints));
}

export function trustLabel(trust: string) {
  switch (trust) {
    case "verified-partner":
      return "Verified Partner";
    case "verified-academy":
      return "Verified Academy";
    case "verified-coach":
      return "Verified Coach";
    case "verified-facility":
      return "Verified Facility";
    case "verified-provider":
      return "Verified Provider";
    default:
      return "Verified";
  }
}
