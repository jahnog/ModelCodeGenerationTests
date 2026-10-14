/**
 * Compile-time brand. Values stay plain strings and numbers at runtime.
 * Smart constructors cast to a brand only after they validate the input.
 */
declare const brand: unique symbol;

export type Brand<TValue, TName extends string> = TValue & {
  readonly [brand]: TName;
};
