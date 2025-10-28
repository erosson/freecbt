import * as IO from "io-ts"
import * as E from "fp-ts/lib/Either"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"

export function decodeOrThrow<A, I = unknown>(
  codec: IO.Decoder<I, A>
): (enc: I) => A
export function decodeOrThrow<A, I = unknown>(
  codec: IO.Decoder<I, A>,
  enc: I
): A
export function decodeOrThrow<A, I = unknown>(
  codec: IO.Decoder<I, A>,
  enc?: any
): A | ((enc: I) => A) {
  if (arguments.length == 1) {
    return (enc: I) => decodeOrThrow(codec, enc)
  }

  const dec = codec.decode(enc)
  if (E.isRight(dec)) {
    return dec.right
  } else {
    ThrowReporter.report(dec)
    throw new Error("unreachable")
  }
}
