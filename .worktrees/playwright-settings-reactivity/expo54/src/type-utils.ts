/**
 * compile-time check that two types match. Usage: replace...
 *
 *     type NNumber = number | null
 *     const val: NNumber = 3
 *
 * ...with...
 *
 *     type NNumber = number | null
 *     const val: AssertExtends<NNumber, number> = 3
 *
 * ...or, without an instance:
 *
 *     type NNumber = number | null
 *     type checkNNumber = AssertExtends<NNumber, number>
 *
 * fails with a typescript compile error if A does not, in fact, extend B:
 *
 *     type NNumber = number | null
 *     // this fails to compile!
 *     type checkNNumber = AssertExtends<NNumber, string>
 *
 * credit to https://stackoverflow.com/questions/72943268/typescript-compile-time-validation-that-two-types-are-equal
 */

export type AssertExtends<A extends B, B> = A;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const check1: AssertExtends<3, number> = 3;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const check2: AssertExtends<number, number> = 4;
// below fails typechecking, as expected
// const check3: AssertExtends<number, 3> = 4;
