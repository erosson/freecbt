/**
 * compile-time check that two types match. Usage:
 *
 *     static_assert<A extends B ? true : false>()
 *
 * credit to https://stackoverflow.com/questions/72943268/typescript-compile-time-validation-that-two-types-are-equal
 */
export function type_assert<T extends true>() {}

// some tests - these have no runtime impact
type_assert<number extends number ? true : false>;
type_assert<3 extends number ? true : false>;
// below fails, as expected
// static_assert<number extends 3 ? true : false>
// static_assert<number extends string ? true : false>;
// static_assert<string extends number ? true : false>;
