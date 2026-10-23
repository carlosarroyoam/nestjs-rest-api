import { ValueTransformer } from 'typeorm';

/** Convierte entre `boolean` y `Buffer` de un byte (columna `BIT(1)`). */
export class BoolBitTransformer implements ValueTransformer {
  /**
   * Convierte el valor del modelo al valor que se guarda en la base de datos.
   *
   * @param value Valor booleano de la entidad.
   * @returns `Buffer` de un byte (`1` o `0`), o `null` si `value` es `null`.
   */
  to(value: boolean | null): Buffer | null {
    if (value === null) {
      return null;
    }

    const res = Buffer.alloc(1);
    res[0] = value ? 1 : 0;
    return res;
  }

  /**
   * Convierte el valor leído de la base de datos al valor del modelo.
   *
   * @param value `Buffer` devuelto por el driver para la columna `BIT(1)`.
   * @returns `true` si el primer byte es `1`, `false` en otro caso, o `null` si
   * `value` es `null`.
   */
  from(value: Buffer | null): boolean | null {
    if (value === null) {
      return null;
    }

    return value[0] === 1;
  }
}
