import { ValueTransformer } from 'typeorm';

export class BoolBitTransformer implements ValueTransformer {
  to(value: boolean | null): Buffer | null {
    if (value === null) {
      return null;
    }
    const res = new Buffer(1);
    res[0] = value ? 1 : 0;
    return res;
  }

  from(value: Buffer): boolean | null {
    if (value === null) {
      return null;
    }
    return value[0] === 1;
  }
}
