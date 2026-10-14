export const CartProblem = {
  invalidId: "invalid-id",
  invalidName: "invalid-name",
  invalidPrice: "invalid-price",
  invalidQuantity: "invalid-quantity",
  quantityOverflow: "quantity-overflow",
  lineTotalOverflow: "line-total-overflow",
  totalOverflow: "total-overflow",
  identityConflict: "identity-conflict",
  notFound: "not-found",
} as const satisfies Record<string, string>;

export type CartProblem = (typeof CartProblem)[keyof typeof CartProblem];

export type CartError =
  | { readonly kind: typeof CartProblem.invalidId }
  | { readonly kind: typeof CartProblem.invalidName }
  | { readonly kind: typeof CartProblem.invalidPrice }
  | { readonly kind: typeof CartProblem.invalidQuantity }
  | { readonly kind: typeof CartProblem.quantityOverflow }
  | { readonly kind: typeof CartProblem.lineTotalOverflow }
  | { readonly kind: typeof CartProblem.totalOverflow }
  | { readonly kind: typeof CartProblem.identityConflict; readonly id: string }
  | { readonly kind: typeof CartProblem.notFound; readonly id: string };

export function describeCartError(error: CartError): string {
  switch (error.kind) {
    case CartProblem.invalidId:
      return "Item id must be a non-empty string without control characters.";
    case CartProblem.invalidName:
      return "Item name must be a non-empty string without control characters.";
    case CartProblem.invalidPrice:
      return "Unit price must be a non-negative integer number of cents.";
    case CartProblem.invalidQuantity:
      return "Quantity must be a positive integer.";
    case CartProblem.quantityOverflow:
      return "Quantity exceeds the safe integer range.";
    case CartProblem.lineTotalOverflow:
      return "Line total exceeds the safe integer range.";
    case CartProblem.totalOverflow:
      return "Cart total exceeds the safe integer range.";
    case CartProblem.identityConflict:
      return `Item "${error.id}" is already in the cart with a different name or unit price.`;
    case CartProblem.notFound:
      return `Item "${error.id}" is not in the cart.`;
    default:
      return assertNever(error);
  }
}

function assertNever(unexpected: never): never {
  throw new Error(`Unhandled cart error: ${JSON.stringify(unexpected)}`);
}
