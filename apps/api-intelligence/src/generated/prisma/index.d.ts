
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model IntelPerson
 * 
 */
export type IntelPerson = $Result.DefaultSelection<Prisma.$IntelPersonPayload>
/**
 * Model IntelPersonIdentifier
 * 
 */
export type IntelPersonIdentifier = $Result.DefaultSelection<Prisma.$IntelPersonIdentifierPayload>
/**
 * Model IntelBiometricProfile
 * 
 */
export type IntelBiometricProfile = $Result.DefaultSelection<Prisma.$IntelBiometricProfilePayload>
/**
 * Model IntelRiskSignal
 * 
 */
export type IntelRiskSignal = $Result.DefaultSelection<Prisma.$IntelRiskSignalPayload>
/**
 * Model IntelPersonTenantPresence
 * 
 */
export type IntelPersonTenantPresence = $Result.DefaultSelection<Prisma.$IntelPersonTenantPresencePayload>
/**
 * Model IntelReviewCase
 * 
 */
export type IntelReviewCase = $Result.DefaultSelection<Prisma.$IntelReviewCasePayload>
/**
 * Model IntelWatchlistEntry
 * 
 */
export type IntelWatchlistEntry = $Result.DefaultSelection<Prisma.$IntelWatchlistEntryPayload>
/**
 * Model IntelLinkageEvent
 * 
 */
export type IntelLinkageEvent = $Result.DefaultSelection<Prisma.$IntelLinkageEventPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more IntelPeople
 * const intelPeople = await prisma.intelPerson.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more IntelPeople
   * const intelPeople = await prisma.intelPerson.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.intelPerson`: Exposes CRUD operations for the **IntelPerson** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntelPeople
    * const intelPeople = await prisma.intelPerson.findMany()
    * ```
    */
  get intelPerson(): Prisma.IntelPersonDelegate<ExtArgs>;

  /**
   * `prisma.intelPersonIdentifier`: Exposes CRUD operations for the **IntelPersonIdentifier** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntelPersonIdentifiers
    * const intelPersonIdentifiers = await prisma.intelPersonIdentifier.findMany()
    * ```
    */
  get intelPersonIdentifier(): Prisma.IntelPersonIdentifierDelegate<ExtArgs>;

  /**
   * `prisma.intelBiometricProfile`: Exposes CRUD operations for the **IntelBiometricProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntelBiometricProfiles
    * const intelBiometricProfiles = await prisma.intelBiometricProfile.findMany()
    * ```
    */
  get intelBiometricProfile(): Prisma.IntelBiometricProfileDelegate<ExtArgs>;

  /**
   * `prisma.intelRiskSignal`: Exposes CRUD operations for the **IntelRiskSignal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntelRiskSignals
    * const intelRiskSignals = await prisma.intelRiskSignal.findMany()
    * ```
    */
  get intelRiskSignal(): Prisma.IntelRiskSignalDelegate<ExtArgs>;

  /**
   * `prisma.intelPersonTenantPresence`: Exposes CRUD operations for the **IntelPersonTenantPresence** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntelPersonTenantPresences
    * const intelPersonTenantPresences = await prisma.intelPersonTenantPresence.findMany()
    * ```
    */
  get intelPersonTenantPresence(): Prisma.IntelPersonTenantPresenceDelegate<ExtArgs>;

  /**
   * `prisma.intelReviewCase`: Exposes CRUD operations for the **IntelReviewCase** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntelReviewCases
    * const intelReviewCases = await prisma.intelReviewCase.findMany()
    * ```
    */
  get intelReviewCase(): Prisma.IntelReviewCaseDelegate<ExtArgs>;

  /**
   * `prisma.intelWatchlistEntry`: Exposes CRUD operations for the **IntelWatchlistEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntelWatchlistEntries
    * const intelWatchlistEntries = await prisma.intelWatchlistEntry.findMany()
    * ```
    */
  get intelWatchlistEntry(): Prisma.IntelWatchlistEntryDelegate<ExtArgs>;

  /**
   * `prisma.intelLinkageEvent`: Exposes CRUD operations for the **IntelLinkageEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntelLinkageEvents
    * const intelLinkageEvents = await prisma.intelLinkageEvent.findMany()
    * ```
    */
  get intelLinkageEvent(): Prisma.IntelLinkageEventDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    IntelPerson: 'IntelPerson',
    IntelPersonIdentifier: 'IntelPersonIdentifier',
    IntelBiometricProfile: 'IntelBiometricProfile',
    IntelRiskSignal: 'IntelRiskSignal',
    IntelPersonTenantPresence: 'IntelPersonTenantPresence',
    IntelReviewCase: 'IntelReviewCase',
    IntelWatchlistEntry: 'IntelWatchlistEntry',
    IntelLinkageEvent: 'IntelLinkageEvent'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "intelPerson" | "intelPersonIdentifier" | "intelBiometricProfile" | "intelRiskSignal" | "intelPersonTenantPresence" | "intelReviewCase" | "intelWatchlistEntry" | "intelLinkageEvent"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      IntelPerson: {
        payload: Prisma.$IntelPersonPayload<ExtArgs>
        fields: Prisma.IntelPersonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntelPersonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntelPersonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload>
          }
          findFirst: {
            args: Prisma.IntelPersonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntelPersonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload>
          }
          findMany: {
            args: Prisma.IntelPersonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload>[]
          }
          create: {
            args: Prisma.IntelPersonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload>
          }
          createMany: {
            args: Prisma.IntelPersonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntelPersonCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload>[]
          }
          delete: {
            args: Prisma.IntelPersonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload>
          }
          update: {
            args: Prisma.IntelPersonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload>
          }
          deleteMany: {
            args: Prisma.IntelPersonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntelPersonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IntelPersonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonPayload>
          }
          aggregate: {
            args: Prisma.IntelPersonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntelPerson>
          }
          groupBy: {
            args: Prisma.IntelPersonGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntelPersonGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntelPersonCountArgs<ExtArgs>
            result: $Utils.Optional<IntelPersonCountAggregateOutputType> | number
          }
        }
      }
      IntelPersonIdentifier: {
        payload: Prisma.$IntelPersonIdentifierPayload<ExtArgs>
        fields: Prisma.IntelPersonIdentifierFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntelPersonIdentifierFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntelPersonIdentifierFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload>
          }
          findFirst: {
            args: Prisma.IntelPersonIdentifierFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntelPersonIdentifierFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload>
          }
          findMany: {
            args: Prisma.IntelPersonIdentifierFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload>[]
          }
          create: {
            args: Prisma.IntelPersonIdentifierCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload>
          }
          createMany: {
            args: Prisma.IntelPersonIdentifierCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntelPersonIdentifierCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload>[]
          }
          delete: {
            args: Prisma.IntelPersonIdentifierDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload>
          }
          update: {
            args: Prisma.IntelPersonIdentifierUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload>
          }
          deleteMany: {
            args: Prisma.IntelPersonIdentifierDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntelPersonIdentifierUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IntelPersonIdentifierUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonIdentifierPayload>
          }
          aggregate: {
            args: Prisma.IntelPersonIdentifierAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntelPersonIdentifier>
          }
          groupBy: {
            args: Prisma.IntelPersonIdentifierGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntelPersonIdentifierGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntelPersonIdentifierCountArgs<ExtArgs>
            result: $Utils.Optional<IntelPersonIdentifierCountAggregateOutputType> | number
          }
        }
      }
      IntelBiometricProfile: {
        payload: Prisma.$IntelBiometricProfilePayload<ExtArgs>
        fields: Prisma.IntelBiometricProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntelBiometricProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntelBiometricProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload>
          }
          findFirst: {
            args: Prisma.IntelBiometricProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntelBiometricProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload>
          }
          findMany: {
            args: Prisma.IntelBiometricProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload>[]
          }
          create: {
            args: Prisma.IntelBiometricProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload>
          }
          createMany: {
            args: Prisma.IntelBiometricProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntelBiometricProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload>[]
          }
          delete: {
            args: Prisma.IntelBiometricProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload>
          }
          update: {
            args: Prisma.IntelBiometricProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload>
          }
          deleteMany: {
            args: Prisma.IntelBiometricProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntelBiometricProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IntelBiometricProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelBiometricProfilePayload>
          }
          aggregate: {
            args: Prisma.IntelBiometricProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntelBiometricProfile>
          }
          groupBy: {
            args: Prisma.IntelBiometricProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntelBiometricProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntelBiometricProfileCountArgs<ExtArgs>
            result: $Utils.Optional<IntelBiometricProfileCountAggregateOutputType> | number
          }
        }
      }
      IntelRiskSignal: {
        payload: Prisma.$IntelRiskSignalPayload<ExtArgs>
        fields: Prisma.IntelRiskSignalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntelRiskSignalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntelRiskSignalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload>
          }
          findFirst: {
            args: Prisma.IntelRiskSignalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntelRiskSignalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload>
          }
          findMany: {
            args: Prisma.IntelRiskSignalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload>[]
          }
          create: {
            args: Prisma.IntelRiskSignalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload>
          }
          createMany: {
            args: Prisma.IntelRiskSignalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntelRiskSignalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload>[]
          }
          delete: {
            args: Prisma.IntelRiskSignalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload>
          }
          update: {
            args: Prisma.IntelRiskSignalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload>
          }
          deleteMany: {
            args: Prisma.IntelRiskSignalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntelRiskSignalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IntelRiskSignalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelRiskSignalPayload>
          }
          aggregate: {
            args: Prisma.IntelRiskSignalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntelRiskSignal>
          }
          groupBy: {
            args: Prisma.IntelRiskSignalGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntelRiskSignalGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntelRiskSignalCountArgs<ExtArgs>
            result: $Utils.Optional<IntelRiskSignalCountAggregateOutputType> | number
          }
        }
      }
      IntelPersonTenantPresence: {
        payload: Prisma.$IntelPersonTenantPresencePayload<ExtArgs>
        fields: Prisma.IntelPersonTenantPresenceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntelPersonTenantPresenceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntelPersonTenantPresenceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload>
          }
          findFirst: {
            args: Prisma.IntelPersonTenantPresenceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntelPersonTenantPresenceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload>
          }
          findMany: {
            args: Prisma.IntelPersonTenantPresenceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload>[]
          }
          create: {
            args: Prisma.IntelPersonTenantPresenceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload>
          }
          createMany: {
            args: Prisma.IntelPersonTenantPresenceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntelPersonTenantPresenceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload>[]
          }
          delete: {
            args: Prisma.IntelPersonTenantPresenceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload>
          }
          update: {
            args: Prisma.IntelPersonTenantPresenceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload>
          }
          deleteMany: {
            args: Prisma.IntelPersonTenantPresenceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntelPersonTenantPresenceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IntelPersonTenantPresenceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelPersonTenantPresencePayload>
          }
          aggregate: {
            args: Prisma.IntelPersonTenantPresenceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntelPersonTenantPresence>
          }
          groupBy: {
            args: Prisma.IntelPersonTenantPresenceGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntelPersonTenantPresenceGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntelPersonTenantPresenceCountArgs<ExtArgs>
            result: $Utils.Optional<IntelPersonTenantPresenceCountAggregateOutputType> | number
          }
        }
      }
      IntelReviewCase: {
        payload: Prisma.$IntelReviewCasePayload<ExtArgs>
        fields: Prisma.IntelReviewCaseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntelReviewCaseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntelReviewCaseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload>
          }
          findFirst: {
            args: Prisma.IntelReviewCaseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntelReviewCaseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload>
          }
          findMany: {
            args: Prisma.IntelReviewCaseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload>[]
          }
          create: {
            args: Prisma.IntelReviewCaseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload>
          }
          createMany: {
            args: Prisma.IntelReviewCaseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntelReviewCaseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload>[]
          }
          delete: {
            args: Prisma.IntelReviewCaseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload>
          }
          update: {
            args: Prisma.IntelReviewCaseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload>
          }
          deleteMany: {
            args: Prisma.IntelReviewCaseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntelReviewCaseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IntelReviewCaseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelReviewCasePayload>
          }
          aggregate: {
            args: Prisma.IntelReviewCaseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntelReviewCase>
          }
          groupBy: {
            args: Prisma.IntelReviewCaseGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntelReviewCaseGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntelReviewCaseCountArgs<ExtArgs>
            result: $Utils.Optional<IntelReviewCaseCountAggregateOutputType> | number
          }
        }
      }
      IntelWatchlistEntry: {
        payload: Prisma.$IntelWatchlistEntryPayload<ExtArgs>
        fields: Prisma.IntelWatchlistEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntelWatchlistEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntelWatchlistEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload>
          }
          findFirst: {
            args: Prisma.IntelWatchlistEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntelWatchlistEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload>
          }
          findMany: {
            args: Prisma.IntelWatchlistEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload>[]
          }
          create: {
            args: Prisma.IntelWatchlistEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload>
          }
          createMany: {
            args: Prisma.IntelWatchlistEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntelWatchlistEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload>[]
          }
          delete: {
            args: Prisma.IntelWatchlistEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload>
          }
          update: {
            args: Prisma.IntelWatchlistEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload>
          }
          deleteMany: {
            args: Prisma.IntelWatchlistEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntelWatchlistEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IntelWatchlistEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelWatchlistEntryPayload>
          }
          aggregate: {
            args: Prisma.IntelWatchlistEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntelWatchlistEntry>
          }
          groupBy: {
            args: Prisma.IntelWatchlistEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntelWatchlistEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntelWatchlistEntryCountArgs<ExtArgs>
            result: $Utils.Optional<IntelWatchlistEntryCountAggregateOutputType> | number
          }
        }
      }
      IntelLinkageEvent: {
        payload: Prisma.$IntelLinkageEventPayload<ExtArgs>
        fields: Prisma.IntelLinkageEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntelLinkageEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntelLinkageEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload>
          }
          findFirst: {
            args: Prisma.IntelLinkageEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntelLinkageEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload>
          }
          findMany: {
            args: Prisma.IntelLinkageEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload>[]
          }
          create: {
            args: Prisma.IntelLinkageEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload>
          }
          createMany: {
            args: Prisma.IntelLinkageEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntelLinkageEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload>[]
          }
          delete: {
            args: Prisma.IntelLinkageEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload>
          }
          update: {
            args: Prisma.IntelLinkageEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload>
          }
          deleteMany: {
            args: Prisma.IntelLinkageEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntelLinkageEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IntelLinkageEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntelLinkageEventPayload>
          }
          aggregate: {
            args: Prisma.IntelLinkageEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntelLinkageEvent>
          }
          groupBy: {
            args: Prisma.IntelLinkageEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntelLinkageEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntelLinkageEventCountArgs<ExtArgs>
            result: $Utils.Optional<IntelLinkageEventCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type IntelPersonCountOutputType
   */

  export type IntelPersonCountOutputType = {
    identifiers: number
    biometrics: number
    riskSignals: number
    tenantPresences: number
    reviewCases: number
  }

  export type IntelPersonCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    identifiers?: boolean | IntelPersonCountOutputTypeCountIdentifiersArgs
    biometrics?: boolean | IntelPersonCountOutputTypeCountBiometricsArgs
    riskSignals?: boolean | IntelPersonCountOutputTypeCountRiskSignalsArgs
    tenantPresences?: boolean | IntelPersonCountOutputTypeCountTenantPresencesArgs
    reviewCases?: boolean | IntelPersonCountOutputTypeCountReviewCasesArgs
  }

  // Custom InputTypes
  /**
   * IntelPersonCountOutputType without action
   */
  export type IntelPersonCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonCountOutputType
     */
    select?: IntelPersonCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * IntelPersonCountOutputType without action
   */
  export type IntelPersonCountOutputTypeCountIdentifiersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelPersonIdentifierWhereInput
  }

  /**
   * IntelPersonCountOutputType without action
   */
  export type IntelPersonCountOutputTypeCountBiometricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelBiometricProfileWhereInput
  }

  /**
   * IntelPersonCountOutputType without action
   */
  export type IntelPersonCountOutputTypeCountRiskSignalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelRiskSignalWhereInput
  }

  /**
   * IntelPersonCountOutputType without action
   */
  export type IntelPersonCountOutputTypeCountTenantPresencesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelPersonTenantPresenceWhereInput
  }

  /**
   * IntelPersonCountOutputType without action
   */
  export type IntelPersonCountOutputTypeCountReviewCasesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelReviewCaseWhereInput
  }


  /**
   * Models
   */

  /**
   * Model IntelPerson
   */

  export type AggregateIntelPerson = {
    _count: IntelPersonCountAggregateOutputType | null
    _avg: IntelPersonAvgAggregateOutputType | null
    _sum: IntelPersonSumAggregateOutputType | null
    _min: IntelPersonMinAggregateOutputType | null
    _max: IntelPersonMaxAggregateOutputType | null
  }

  export type IntelPersonAvgAggregateOutputType = {
    globalRiskScore: number | null
    fraudSignalCount: number | null
    verificationConfidence: number | null
  }

  export type IntelPersonSumAggregateOutputType = {
    globalRiskScore: number | null
    fraudSignalCount: number | null
    verificationConfidence: number | null
  }

  export type IntelPersonMinAggregateOutputType = {
    id: string | null
    globalRiskScore: number | null
    isWatchlisted: boolean | null
    hasDuplicateFlag: boolean | null
    fraudSignalCount: number | null
    verificationConfidence: number | null
    fullName: string | null
    dateOfBirth: string | null
    address: string | null
    gender: string | null
    photoUrl: string | null
    verificationStatus: string | null
    verificationProvider: string | null
    verificationCountryCode: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IntelPersonMaxAggregateOutputType = {
    id: string | null
    globalRiskScore: number | null
    isWatchlisted: boolean | null
    hasDuplicateFlag: boolean | null
    fraudSignalCount: number | null
    verificationConfidence: number | null
    fullName: string | null
    dateOfBirth: string | null
    address: string | null
    gender: string | null
    photoUrl: string | null
    verificationStatus: string | null
    verificationProvider: string | null
    verificationCountryCode: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IntelPersonCountAggregateOutputType = {
    id: number
    globalRiskScore: number
    isWatchlisted: number
    hasDuplicateFlag: number
    fraudSignalCount: number
    verificationConfidence: number
    fullName: number
    dateOfBirth: number
    address: number
    gender: number
    photoUrl: number
    verificationStatus: number
    verificationProvider: number
    verificationCountryCode: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type IntelPersonAvgAggregateInputType = {
    globalRiskScore?: true
    fraudSignalCount?: true
    verificationConfidence?: true
  }

  export type IntelPersonSumAggregateInputType = {
    globalRiskScore?: true
    fraudSignalCount?: true
    verificationConfidence?: true
  }

  export type IntelPersonMinAggregateInputType = {
    id?: true
    globalRiskScore?: true
    isWatchlisted?: true
    hasDuplicateFlag?: true
    fraudSignalCount?: true
    verificationConfidence?: true
    fullName?: true
    dateOfBirth?: true
    address?: true
    gender?: true
    photoUrl?: true
    verificationStatus?: true
    verificationProvider?: true
    verificationCountryCode?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IntelPersonMaxAggregateInputType = {
    id?: true
    globalRiskScore?: true
    isWatchlisted?: true
    hasDuplicateFlag?: true
    fraudSignalCount?: true
    verificationConfidence?: true
    fullName?: true
    dateOfBirth?: true
    address?: true
    gender?: true
    photoUrl?: true
    verificationStatus?: true
    verificationProvider?: true
    verificationCountryCode?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IntelPersonCountAggregateInputType = {
    id?: true
    globalRiskScore?: true
    isWatchlisted?: true
    hasDuplicateFlag?: true
    fraudSignalCount?: true
    verificationConfidence?: true
    fullName?: true
    dateOfBirth?: true
    address?: true
    gender?: true
    photoUrl?: true
    verificationStatus?: true
    verificationProvider?: true
    verificationCountryCode?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type IntelPersonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelPerson to aggregate.
     */
    where?: IntelPersonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPeople to fetch.
     */
    orderBy?: IntelPersonOrderByWithRelationInput | IntelPersonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntelPersonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPeople from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPeople.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntelPeople
    **/
    _count?: true | IntelPersonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IntelPersonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IntelPersonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntelPersonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntelPersonMaxAggregateInputType
  }

  export type GetIntelPersonAggregateType<T extends IntelPersonAggregateArgs> = {
        [P in keyof T & keyof AggregateIntelPerson]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntelPerson[P]>
      : GetScalarType<T[P], AggregateIntelPerson[P]>
  }




  export type IntelPersonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelPersonWhereInput
    orderBy?: IntelPersonOrderByWithAggregationInput | IntelPersonOrderByWithAggregationInput[]
    by: IntelPersonScalarFieldEnum[] | IntelPersonScalarFieldEnum
    having?: IntelPersonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntelPersonCountAggregateInputType | true
    _avg?: IntelPersonAvgAggregateInputType
    _sum?: IntelPersonSumAggregateInputType
    _min?: IntelPersonMinAggregateInputType
    _max?: IntelPersonMaxAggregateInputType
  }

  export type IntelPersonGroupByOutputType = {
    id: string
    globalRiskScore: number
    isWatchlisted: boolean
    hasDuplicateFlag: boolean
    fraudSignalCount: number
    verificationConfidence: number
    fullName: string | null
    dateOfBirth: string | null
    address: string | null
    gender: string | null
    photoUrl: string | null
    verificationStatus: string | null
    verificationProvider: string | null
    verificationCountryCode: string | null
    createdAt: Date
    updatedAt: Date
    _count: IntelPersonCountAggregateOutputType | null
    _avg: IntelPersonAvgAggregateOutputType | null
    _sum: IntelPersonSumAggregateOutputType | null
    _min: IntelPersonMinAggregateOutputType | null
    _max: IntelPersonMaxAggregateOutputType | null
  }

  type GetIntelPersonGroupByPayload<T extends IntelPersonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntelPersonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntelPersonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntelPersonGroupByOutputType[P]>
            : GetScalarType<T[P], IntelPersonGroupByOutputType[P]>
        }
      >
    >


  export type IntelPersonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    globalRiskScore?: boolean
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: boolean
    verificationConfidence?: boolean
    fullName?: boolean
    dateOfBirth?: boolean
    address?: boolean
    gender?: boolean
    photoUrl?: boolean
    verificationStatus?: boolean
    verificationProvider?: boolean
    verificationCountryCode?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    identifiers?: boolean | IntelPerson$identifiersArgs<ExtArgs>
    biometrics?: boolean | IntelPerson$biometricsArgs<ExtArgs>
    riskSignals?: boolean | IntelPerson$riskSignalsArgs<ExtArgs>
    tenantPresences?: boolean | IntelPerson$tenantPresencesArgs<ExtArgs>
    reviewCases?: boolean | IntelPerson$reviewCasesArgs<ExtArgs>
    _count?: boolean | IntelPersonCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelPerson"]>

  export type IntelPersonSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    globalRiskScore?: boolean
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: boolean
    verificationConfidence?: boolean
    fullName?: boolean
    dateOfBirth?: boolean
    address?: boolean
    gender?: boolean
    photoUrl?: boolean
    verificationStatus?: boolean
    verificationProvider?: boolean
    verificationCountryCode?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["intelPerson"]>

  export type IntelPersonSelectScalar = {
    id?: boolean
    globalRiskScore?: boolean
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: boolean
    verificationConfidence?: boolean
    fullName?: boolean
    dateOfBirth?: boolean
    address?: boolean
    gender?: boolean
    photoUrl?: boolean
    verificationStatus?: boolean
    verificationProvider?: boolean
    verificationCountryCode?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type IntelPersonInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    identifiers?: boolean | IntelPerson$identifiersArgs<ExtArgs>
    biometrics?: boolean | IntelPerson$biometricsArgs<ExtArgs>
    riskSignals?: boolean | IntelPerson$riskSignalsArgs<ExtArgs>
    tenantPresences?: boolean | IntelPerson$tenantPresencesArgs<ExtArgs>
    reviewCases?: boolean | IntelPerson$reviewCasesArgs<ExtArgs>
    _count?: boolean | IntelPersonCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type IntelPersonIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $IntelPersonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntelPerson"
    objects: {
      identifiers: Prisma.$IntelPersonIdentifierPayload<ExtArgs>[]
      biometrics: Prisma.$IntelBiometricProfilePayload<ExtArgs>[]
      riskSignals: Prisma.$IntelRiskSignalPayload<ExtArgs>[]
      tenantPresences: Prisma.$IntelPersonTenantPresencePayload<ExtArgs>[]
      reviewCases: Prisma.$IntelReviewCasePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      globalRiskScore: number
      isWatchlisted: boolean
      hasDuplicateFlag: boolean
      fraudSignalCount: number
      verificationConfidence: number
      fullName: string | null
      dateOfBirth: string | null
      address: string | null
      gender: string | null
      photoUrl: string | null
      verificationStatus: string | null
      verificationProvider: string | null
      verificationCountryCode: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["intelPerson"]>
    composites: {}
  }

  type IntelPersonGetPayload<S extends boolean | null | undefined | IntelPersonDefaultArgs> = $Result.GetResult<Prisma.$IntelPersonPayload, S>

  type IntelPersonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IntelPersonFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IntelPersonCountAggregateInputType | true
    }

  export interface IntelPersonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntelPerson'], meta: { name: 'IntelPerson' } }
    /**
     * Find zero or one IntelPerson that matches the filter.
     * @param {IntelPersonFindUniqueArgs} args - Arguments to find a IntelPerson
     * @example
     * // Get one IntelPerson
     * const intelPerson = await prisma.intelPerson.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntelPersonFindUniqueArgs>(args: SelectSubset<T, IntelPersonFindUniqueArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one IntelPerson that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IntelPersonFindUniqueOrThrowArgs} args - Arguments to find a IntelPerson
     * @example
     * // Get one IntelPerson
     * const intelPerson = await prisma.intelPerson.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntelPersonFindUniqueOrThrowArgs>(args: SelectSubset<T, IntelPersonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first IntelPerson that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonFindFirstArgs} args - Arguments to find a IntelPerson
     * @example
     * // Get one IntelPerson
     * const intelPerson = await prisma.intelPerson.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntelPersonFindFirstArgs>(args?: SelectSubset<T, IntelPersonFindFirstArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first IntelPerson that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonFindFirstOrThrowArgs} args - Arguments to find a IntelPerson
     * @example
     * // Get one IntelPerson
     * const intelPerson = await prisma.intelPerson.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntelPersonFindFirstOrThrowArgs>(args?: SelectSubset<T, IntelPersonFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more IntelPeople that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntelPeople
     * const intelPeople = await prisma.intelPerson.findMany()
     * 
     * // Get first 10 IntelPeople
     * const intelPeople = await prisma.intelPerson.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const intelPersonWithIdOnly = await prisma.intelPerson.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntelPersonFindManyArgs>(args?: SelectSubset<T, IntelPersonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a IntelPerson.
     * @param {IntelPersonCreateArgs} args - Arguments to create a IntelPerson.
     * @example
     * // Create one IntelPerson
     * const IntelPerson = await prisma.intelPerson.create({
     *   data: {
     *     // ... data to create a IntelPerson
     *   }
     * })
     * 
     */
    create<T extends IntelPersonCreateArgs>(args: SelectSubset<T, IntelPersonCreateArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many IntelPeople.
     * @param {IntelPersonCreateManyArgs} args - Arguments to create many IntelPeople.
     * @example
     * // Create many IntelPeople
     * const intelPerson = await prisma.intelPerson.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntelPersonCreateManyArgs>(args?: SelectSubset<T, IntelPersonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntelPeople and returns the data saved in the database.
     * @param {IntelPersonCreateManyAndReturnArgs} args - Arguments to create many IntelPeople.
     * @example
     * // Create many IntelPeople
     * const intelPerson = await prisma.intelPerson.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntelPeople and only return the `id`
     * const intelPersonWithIdOnly = await prisma.intelPerson.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntelPersonCreateManyAndReturnArgs>(args?: SelectSubset<T, IntelPersonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a IntelPerson.
     * @param {IntelPersonDeleteArgs} args - Arguments to delete one IntelPerson.
     * @example
     * // Delete one IntelPerson
     * const IntelPerson = await prisma.intelPerson.delete({
     *   where: {
     *     // ... filter to delete one IntelPerson
     *   }
     * })
     * 
     */
    delete<T extends IntelPersonDeleteArgs>(args: SelectSubset<T, IntelPersonDeleteArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one IntelPerson.
     * @param {IntelPersonUpdateArgs} args - Arguments to update one IntelPerson.
     * @example
     * // Update one IntelPerson
     * const intelPerson = await prisma.intelPerson.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntelPersonUpdateArgs>(args: SelectSubset<T, IntelPersonUpdateArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more IntelPeople.
     * @param {IntelPersonDeleteManyArgs} args - Arguments to filter IntelPeople to delete.
     * @example
     * // Delete a few IntelPeople
     * const { count } = await prisma.intelPerson.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntelPersonDeleteManyArgs>(args?: SelectSubset<T, IntelPersonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntelPeople.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntelPeople
     * const intelPerson = await prisma.intelPerson.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntelPersonUpdateManyArgs>(args: SelectSubset<T, IntelPersonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one IntelPerson.
     * @param {IntelPersonUpsertArgs} args - Arguments to update or create a IntelPerson.
     * @example
     * // Update or create a IntelPerson
     * const intelPerson = await prisma.intelPerson.upsert({
     *   create: {
     *     // ... data to create a IntelPerson
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntelPerson we want to update
     *   }
     * })
     */
    upsert<T extends IntelPersonUpsertArgs>(args: SelectSubset<T, IntelPersonUpsertArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of IntelPeople.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonCountArgs} args - Arguments to filter IntelPeople to count.
     * @example
     * // Count the number of IntelPeople
     * const count = await prisma.intelPerson.count({
     *   where: {
     *     // ... the filter for the IntelPeople we want to count
     *   }
     * })
    **/
    count<T extends IntelPersonCountArgs>(
      args?: Subset<T, IntelPersonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntelPersonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntelPerson.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IntelPersonAggregateArgs>(args: Subset<T, IntelPersonAggregateArgs>): Prisma.PrismaPromise<GetIntelPersonAggregateType<T>>

    /**
     * Group by IntelPerson.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IntelPersonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntelPersonGroupByArgs['orderBy'] }
        : { orderBy?: IntelPersonGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IntelPersonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntelPersonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntelPerson model
   */
  readonly fields: IntelPersonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntelPerson.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntelPersonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    identifiers<T extends IntelPerson$identifiersArgs<ExtArgs> = {}>(args?: Subset<T, IntelPerson$identifiersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "findMany"> | Null>
    biometrics<T extends IntelPerson$biometricsArgs<ExtArgs> = {}>(args?: Subset<T, IntelPerson$biometricsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "findMany"> | Null>
    riskSignals<T extends IntelPerson$riskSignalsArgs<ExtArgs> = {}>(args?: Subset<T, IntelPerson$riskSignalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "findMany"> | Null>
    tenantPresences<T extends IntelPerson$tenantPresencesArgs<ExtArgs> = {}>(args?: Subset<T, IntelPerson$tenantPresencesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "findMany"> | Null>
    reviewCases<T extends IntelPerson$reviewCasesArgs<ExtArgs> = {}>(args?: Subset<T, IntelPerson$reviewCasesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IntelPerson model
   */ 
  interface IntelPersonFieldRefs {
    readonly id: FieldRef<"IntelPerson", 'String'>
    readonly globalRiskScore: FieldRef<"IntelPerson", 'Int'>
    readonly isWatchlisted: FieldRef<"IntelPerson", 'Boolean'>
    readonly hasDuplicateFlag: FieldRef<"IntelPerson", 'Boolean'>
    readonly fraudSignalCount: FieldRef<"IntelPerson", 'Int'>
    readonly verificationConfidence: FieldRef<"IntelPerson", 'Float'>
    readonly fullName: FieldRef<"IntelPerson", 'String'>
    readonly dateOfBirth: FieldRef<"IntelPerson", 'String'>
    readonly address: FieldRef<"IntelPerson", 'String'>
    readonly gender: FieldRef<"IntelPerson", 'String'>
    readonly photoUrl: FieldRef<"IntelPerson", 'String'>
    readonly verificationStatus: FieldRef<"IntelPerson", 'String'>
    readonly verificationProvider: FieldRef<"IntelPerson", 'String'>
    readonly verificationCountryCode: FieldRef<"IntelPerson", 'String'>
    readonly createdAt: FieldRef<"IntelPerson", 'DateTime'>
    readonly updatedAt: FieldRef<"IntelPerson", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IntelPerson findUnique
   */
  export type IntelPersonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
    /**
     * Filter, which IntelPerson to fetch.
     */
    where: IntelPersonWhereUniqueInput
  }

  /**
   * IntelPerson findUniqueOrThrow
   */
  export type IntelPersonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
    /**
     * Filter, which IntelPerson to fetch.
     */
    where: IntelPersonWhereUniqueInput
  }

  /**
   * IntelPerson findFirst
   */
  export type IntelPersonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
    /**
     * Filter, which IntelPerson to fetch.
     */
    where?: IntelPersonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPeople to fetch.
     */
    orderBy?: IntelPersonOrderByWithRelationInput | IntelPersonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelPeople.
     */
    cursor?: IntelPersonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPeople from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPeople.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelPeople.
     */
    distinct?: IntelPersonScalarFieldEnum | IntelPersonScalarFieldEnum[]
  }

  /**
   * IntelPerson findFirstOrThrow
   */
  export type IntelPersonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
    /**
     * Filter, which IntelPerson to fetch.
     */
    where?: IntelPersonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPeople to fetch.
     */
    orderBy?: IntelPersonOrderByWithRelationInput | IntelPersonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelPeople.
     */
    cursor?: IntelPersonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPeople from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPeople.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelPeople.
     */
    distinct?: IntelPersonScalarFieldEnum | IntelPersonScalarFieldEnum[]
  }

  /**
   * IntelPerson findMany
   */
  export type IntelPersonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
    /**
     * Filter, which IntelPeople to fetch.
     */
    where?: IntelPersonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPeople to fetch.
     */
    orderBy?: IntelPersonOrderByWithRelationInput | IntelPersonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntelPeople.
     */
    cursor?: IntelPersonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPeople from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPeople.
     */
    skip?: number
    distinct?: IntelPersonScalarFieldEnum | IntelPersonScalarFieldEnum[]
  }

  /**
   * IntelPerson create
   */
  export type IntelPersonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
    /**
     * The data needed to create a IntelPerson.
     */
    data: XOR<IntelPersonCreateInput, IntelPersonUncheckedCreateInput>
  }

  /**
   * IntelPerson createMany
   */
  export type IntelPersonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntelPeople.
     */
    data: IntelPersonCreateManyInput | IntelPersonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelPerson createManyAndReturn
   */
  export type IntelPersonCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many IntelPeople.
     */
    data: IntelPersonCreateManyInput | IntelPersonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelPerson update
   */
  export type IntelPersonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
    /**
     * The data needed to update a IntelPerson.
     */
    data: XOR<IntelPersonUpdateInput, IntelPersonUncheckedUpdateInput>
    /**
     * Choose, which IntelPerson to update.
     */
    where: IntelPersonWhereUniqueInput
  }

  /**
   * IntelPerson updateMany
   */
  export type IntelPersonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntelPeople.
     */
    data: XOR<IntelPersonUpdateManyMutationInput, IntelPersonUncheckedUpdateManyInput>
    /**
     * Filter which IntelPeople to update
     */
    where?: IntelPersonWhereInput
  }

  /**
   * IntelPerson upsert
   */
  export type IntelPersonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
    /**
     * The filter to search for the IntelPerson to update in case it exists.
     */
    where: IntelPersonWhereUniqueInput
    /**
     * In case the IntelPerson found by the `where` argument doesn't exist, create a new IntelPerson with this data.
     */
    create: XOR<IntelPersonCreateInput, IntelPersonUncheckedCreateInput>
    /**
     * In case the IntelPerson was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntelPersonUpdateInput, IntelPersonUncheckedUpdateInput>
  }

  /**
   * IntelPerson delete
   */
  export type IntelPersonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
    /**
     * Filter which IntelPerson to delete.
     */
    where: IntelPersonWhereUniqueInput
  }

  /**
   * IntelPerson deleteMany
   */
  export type IntelPersonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelPeople to delete
     */
    where?: IntelPersonWhereInput
  }

  /**
   * IntelPerson.identifiers
   */
  export type IntelPerson$identifiersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    where?: IntelPersonIdentifierWhereInput
    orderBy?: IntelPersonIdentifierOrderByWithRelationInput | IntelPersonIdentifierOrderByWithRelationInput[]
    cursor?: IntelPersonIdentifierWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IntelPersonIdentifierScalarFieldEnum | IntelPersonIdentifierScalarFieldEnum[]
  }

  /**
   * IntelPerson.biometrics
   */
  export type IntelPerson$biometricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    where?: IntelBiometricProfileWhereInput
    orderBy?: IntelBiometricProfileOrderByWithRelationInput | IntelBiometricProfileOrderByWithRelationInput[]
    cursor?: IntelBiometricProfileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IntelBiometricProfileScalarFieldEnum | IntelBiometricProfileScalarFieldEnum[]
  }

  /**
   * IntelPerson.riskSignals
   */
  export type IntelPerson$riskSignalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    where?: IntelRiskSignalWhereInput
    orderBy?: IntelRiskSignalOrderByWithRelationInput | IntelRiskSignalOrderByWithRelationInput[]
    cursor?: IntelRiskSignalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IntelRiskSignalScalarFieldEnum | IntelRiskSignalScalarFieldEnum[]
  }

  /**
   * IntelPerson.tenantPresences
   */
  export type IntelPerson$tenantPresencesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    where?: IntelPersonTenantPresenceWhereInput
    orderBy?: IntelPersonTenantPresenceOrderByWithRelationInput | IntelPersonTenantPresenceOrderByWithRelationInput[]
    cursor?: IntelPersonTenantPresenceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IntelPersonTenantPresenceScalarFieldEnum | IntelPersonTenantPresenceScalarFieldEnum[]
  }

  /**
   * IntelPerson.reviewCases
   */
  export type IntelPerson$reviewCasesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    where?: IntelReviewCaseWhereInput
    orderBy?: IntelReviewCaseOrderByWithRelationInput | IntelReviewCaseOrderByWithRelationInput[]
    cursor?: IntelReviewCaseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IntelReviewCaseScalarFieldEnum | IntelReviewCaseScalarFieldEnum[]
  }

  /**
   * IntelPerson without action
   */
  export type IntelPersonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPerson
     */
    select?: IntelPersonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonInclude<ExtArgs> | null
  }


  /**
   * Model IntelPersonIdentifier
   */

  export type AggregateIntelPersonIdentifier = {
    _count: IntelPersonIdentifierCountAggregateOutputType | null
    _min: IntelPersonIdentifierMinAggregateOutputType | null
    _max: IntelPersonIdentifierMaxAggregateOutputType | null
  }

  export type IntelPersonIdentifierMinAggregateOutputType = {
    id: string | null
    personId: string | null
    type: string | null
    value: string | null
    countryCode: string | null
    isVerified: boolean | null
    createdAt: Date | null
  }

  export type IntelPersonIdentifierMaxAggregateOutputType = {
    id: string | null
    personId: string | null
    type: string | null
    value: string | null
    countryCode: string | null
    isVerified: boolean | null
    createdAt: Date | null
  }

  export type IntelPersonIdentifierCountAggregateOutputType = {
    id: number
    personId: number
    type: number
    value: number
    countryCode: number
    isVerified: number
    createdAt: number
    _all: number
  }


  export type IntelPersonIdentifierMinAggregateInputType = {
    id?: true
    personId?: true
    type?: true
    value?: true
    countryCode?: true
    isVerified?: true
    createdAt?: true
  }

  export type IntelPersonIdentifierMaxAggregateInputType = {
    id?: true
    personId?: true
    type?: true
    value?: true
    countryCode?: true
    isVerified?: true
    createdAt?: true
  }

  export type IntelPersonIdentifierCountAggregateInputType = {
    id?: true
    personId?: true
    type?: true
    value?: true
    countryCode?: true
    isVerified?: true
    createdAt?: true
    _all?: true
  }

  export type IntelPersonIdentifierAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelPersonIdentifier to aggregate.
     */
    where?: IntelPersonIdentifierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPersonIdentifiers to fetch.
     */
    orderBy?: IntelPersonIdentifierOrderByWithRelationInput | IntelPersonIdentifierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntelPersonIdentifierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPersonIdentifiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPersonIdentifiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntelPersonIdentifiers
    **/
    _count?: true | IntelPersonIdentifierCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntelPersonIdentifierMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntelPersonIdentifierMaxAggregateInputType
  }

  export type GetIntelPersonIdentifierAggregateType<T extends IntelPersonIdentifierAggregateArgs> = {
        [P in keyof T & keyof AggregateIntelPersonIdentifier]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntelPersonIdentifier[P]>
      : GetScalarType<T[P], AggregateIntelPersonIdentifier[P]>
  }




  export type IntelPersonIdentifierGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelPersonIdentifierWhereInput
    orderBy?: IntelPersonIdentifierOrderByWithAggregationInput | IntelPersonIdentifierOrderByWithAggregationInput[]
    by: IntelPersonIdentifierScalarFieldEnum[] | IntelPersonIdentifierScalarFieldEnum
    having?: IntelPersonIdentifierScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntelPersonIdentifierCountAggregateInputType | true
    _min?: IntelPersonIdentifierMinAggregateInputType
    _max?: IntelPersonIdentifierMaxAggregateInputType
  }

  export type IntelPersonIdentifierGroupByOutputType = {
    id: string
    personId: string
    type: string
    value: string
    countryCode: string | null
    isVerified: boolean
    createdAt: Date
    _count: IntelPersonIdentifierCountAggregateOutputType | null
    _min: IntelPersonIdentifierMinAggregateOutputType | null
    _max: IntelPersonIdentifierMaxAggregateOutputType | null
  }

  type GetIntelPersonIdentifierGroupByPayload<T extends IntelPersonIdentifierGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntelPersonIdentifierGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntelPersonIdentifierGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntelPersonIdentifierGroupByOutputType[P]>
            : GetScalarType<T[P], IntelPersonIdentifierGroupByOutputType[P]>
        }
      >
    >


  export type IntelPersonIdentifierSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    type?: boolean
    value?: boolean
    countryCode?: boolean
    isVerified?: boolean
    createdAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelPersonIdentifier"]>

  export type IntelPersonIdentifierSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    type?: boolean
    value?: boolean
    countryCode?: boolean
    isVerified?: boolean
    createdAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelPersonIdentifier"]>

  export type IntelPersonIdentifierSelectScalar = {
    id?: boolean
    personId?: boolean
    type?: boolean
    value?: boolean
    countryCode?: boolean
    isVerified?: boolean
    createdAt?: boolean
  }

  export type IntelPersonIdentifierInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }
  export type IntelPersonIdentifierIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }

  export type $IntelPersonIdentifierPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntelPersonIdentifier"
    objects: {
      person: Prisma.$IntelPersonPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      personId: string
      type: string
      value: string
      countryCode: string | null
      isVerified: boolean
      createdAt: Date
    }, ExtArgs["result"]["intelPersonIdentifier"]>
    composites: {}
  }

  type IntelPersonIdentifierGetPayload<S extends boolean | null | undefined | IntelPersonIdentifierDefaultArgs> = $Result.GetResult<Prisma.$IntelPersonIdentifierPayload, S>

  type IntelPersonIdentifierCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IntelPersonIdentifierFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IntelPersonIdentifierCountAggregateInputType | true
    }

  export interface IntelPersonIdentifierDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntelPersonIdentifier'], meta: { name: 'IntelPersonIdentifier' } }
    /**
     * Find zero or one IntelPersonIdentifier that matches the filter.
     * @param {IntelPersonIdentifierFindUniqueArgs} args - Arguments to find a IntelPersonIdentifier
     * @example
     * // Get one IntelPersonIdentifier
     * const intelPersonIdentifier = await prisma.intelPersonIdentifier.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntelPersonIdentifierFindUniqueArgs>(args: SelectSubset<T, IntelPersonIdentifierFindUniqueArgs<ExtArgs>>): Prisma__IntelPersonIdentifierClient<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one IntelPersonIdentifier that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IntelPersonIdentifierFindUniqueOrThrowArgs} args - Arguments to find a IntelPersonIdentifier
     * @example
     * // Get one IntelPersonIdentifier
     * const intelPersonIdentifier = await prisma.intelPersonIdentifier.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntelPersonIdentifierFindUniqueOrThrowArgs>(args: SelectSubset<T, IntelPersonIdentifierFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntelPersonIdentifierClient<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first IntelPersonIdentifier that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonIdentifierFindFirstArgs} args - Arguments to find a IntelPersonIdentifier
     * @example
     * // Get one IntelPersonIdentifier
     * const intelPersonIdentifier = await prisma.intelPersonIdentifier.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntelPersonIdentifierFindFirstArgs>(args?: SelectSubset<T, IntelPersonIdentifierFindFirstArgs<ExtArgs>>): Prisma__IntelPersonIdentifierClient<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first IntelPersonIdentifier that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonIdentifierFindFirstOrThrowArgs} args - Arguments to find a IntelPersonIdentifier
     * @example
     * // Get one IntelPersonIdentifier
     * const intelPersonIdentifier = await prisma.intelPersonIdentifier.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntelPersonIdentifierFindFirstOrThrowArgs>(args?: SelectSubset<T, IntelPersonIdentifierFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntelPersonIdentifierClient<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more IntelPersonIdentifiers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonIdentifierFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntelPersonIdentifiers
     * const intelPersonIdentifiers = await prisma.intelPersonIdentifier.findMany()
     * 
     * // Get first 10 IntelPersonIdentifiers
     * const intelPersonIdentifiers = await prisma.intelPersonIdentifier.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const intelPersonIdentifierWithIdOnly = await prisma.intelPersonIdentifier.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntelPersonIdentifierFindManyArgs>(args?: SelectSubset<T, IntelPersonIdentifierFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a IntelPersonIdentifier.
     * @param {IntelPersonIdentifierCreateArgs} args - Arguments to create a IntelPersonIdentifier.
     * @example
     * // Create one IntelPersonIdentifier
     * const IntelPersonIdentifier = await prisma.intelPersonIdentifier.create({
     *   data: {
     *     // ... data to create a IntelPersonIdentifier
     *   }
     * })
     * 
     */
    create<T extends IntelPersonIdentifierCreateArgs>(args: SelectSubset<T, IntelPersonIdentifierCreateArgs<ExtArgs>>): Prisma__IntelPersonIdentifierClient<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many IntelPersonIdentifiers.
     * @param {IntelPersonIdentifierCreateManyArgs} args - Arguments to create many IntelPersonIdentifiers.
     * @example
     * // Create many IntelPersonIdentifiers
     * const intelPersonIdentifier = await prisma.intelPersonIdentifier.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntelPersonIdentifierCreateManyArgs>(args?: SelectSubset<T, IntelPersonIdentifierCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntelPersonIdentifiers and returns the data saved in the database.
     * @param {IntelPersonIdentifierCreateManyAndReturnArgs} args - Arguments to create many IntelPersonIdentifiers.
     * @example
     * // Create many IntelPersonIdentifiers
     * const intelPersonIdentifier = await prisma.intelPersonIdentifier.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntelPersonIdentifiers and only return the `id`
     * const intelPersonIdentifierWithIdOnly = await prisma.intelPersonIdentifier.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntelPersonIdentifierCreateManyAndReturnArgs>(args?: SelectSubset<T, IntelPersonIdentifierCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a IntelPersonIdentifier.
     * @param {IntelPersonIdentifierDeleteArgs} args - Arguments to delete one IntelPersonIdentifier.
     * @example
     * // Delete one IntelPersonIdentifier
     * const IntelPersonIdentifier = await prisma.intelPersonIdentifier.delete({
     *   where: {
     *     // ... filter to delete one IntelPersonIdentifier
     *   }
     * })
     * 
     */
    delete<T extends IntelPersonIdentifierDeleteArgs>(args: SelectSubset<T, IntelPersonIdentifierDeleteArgs<ExtArgs>>): Prisma__IntelPersonIdentifierClient<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one IntelPersonIdentifier.
     * @param {IntelPersonIdentifierUpdateArgs} args - Arguments to update one IntelPersonIdentifier.
     * @example
     * // Update one IntelPersonIdentifier
     * const intelPersonIdentifier = await prisma.intelPersonIdentifier.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntelPersonIdentifierUpdateArgs>(args: SelectSubset<T, IntelPersonIdentifierUpdateArgs<ExtArgs>>): Prisma__IntelPersonIdentifierClient<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more IntelPersonIdentifiers.
     * @param {IntelPersonIdentifierDeleteManyArgs} args - Arguments to filter IntelPersonIdentifiers to delete.
     * @example
     * // Delete a few IntelPersonIdentifiers
     * const { count } = await prisma.intelPersonIdentifier.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntelPersonIdentifierDeleteManyArgs>(args?: SelectSubset<T, IntelPersonIdentifierDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntelPersonIdentifiers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonIdentifierUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntelPersonIdentifiers
     * const intelPersonIdentifier = await prisma.intelPersonIdentifier.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntelPersonIdentifierUpdateManyArgs>(args: SelectSubset<T, IntelPersonIdentifierUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one IntelPersonIdentifier.
     * @param {IntelPersonIdentifierUpsertArgs} args - Arguments to update or create a IntelPersonIdentifier.
     * @example
     * // Update or create a IntelPersonIdentifier
     * const intelPersonIdentifier = await prisma.intelPersonIdentifier.upsert({
     *   create: {
     *     // ... data to create a IntelPersonIdentifier
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntelPersonIdentifier we want to update
     *   }
     * })
     */
    upsert<T extends IntelPersonIdentifierUpsertArgs>(args: SelectSubset<T, IntelPersonIdentifierUpsertArgs<ExtArgs>>): Prisma__IntelPersonIdentifierClient<$Result.GetResult<Prisma.$IntelPersonIdentifierPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of IntelPersonIdentifiers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonIdentifierCountArgs} args - Arguments to filter IntelPersonIdentifiers to count.
     * @example
     * // Count the number of IntelPersonIdentifiers
     * const count = await prisma.intelPersonIdentifier.count({
     *   where: {
     *     // ... the filter for the IntelPersonIdentifiers we want to count
     *   }
     * })
    **/
    count<T extends IntelPersonIdentifierCountArgs>(
      args?: Subset<T, IntelPersonIdentifierCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntelPersonIdentifierCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntelPersonIdentifier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonIdentifierAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IntelPersonIdentifierAggregateArgs>(args: Subset<T, IntelPersonIdentifierAggregateArgs>): Prisma.PrismaPromise<GetIntelPersonIdentifierAggregateType<T>>

    /**
     * Group by IntelPersonIdentifier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonIdentifierGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IntelPersonIdentifierGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntelPersonIdentifierGroupByArgs['orderBy'] }
        : { orderBy?: IntelPersonIdentifierGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IntelPersonIdentifierGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntelPersonIdentifierGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntelPersonIdentifier model
   */
  readonly fields: IntelPersonIdentifierFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntelPersonIdentifier.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntelPersonIdentifierClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    person<T extends IntelPersonDefaultArgs<ExtArgs> = {}>(args?: Subset<T, IntelPersonDefaultArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IntelPersonIdentifier model
   */ 
  interface IntelPersonIdentifierFieldRefs {
    readonly id: FieldRef<"IntelPersonIdentifier", 'String'>
    readonly personId: FieldRef<"IntelPersonIdentifier", 'String'>
    readonly type: FieldRef<"IntelPersonIdentifier", 'String'>
    readonly value: FieldRef<"IntelPersonIdentifier", 'String'>
    readonly countryCode: FieldRef<"IntelPersonIdentifier", 'String'>
    readonly isVerified: FieldRef<"IntelPersonIdentifier", 'Boolean'>
    readonly createdAt: FieldRef<"IntelPersonIdentifier", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IntelPersonIdentifier findUnique
   */
  export type IntelPersonIdentifierFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonIdentifier to fetch.
     */
    where: IntelPersonIdentifierWhereUniqueInput
  }

  /**
   * IntelPersonIdentifier findUniqueOrThrow
   */
  export type IntelPersonIdentifierFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonIdentifier to fetch.
     */
    where: IntelPersonIdentifierWhereUniqueInput
  }

  /**
   * IntelPersonIdentifier findFirst
   */
  export type IntelPersonIdentifierFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonIdentifier to fetch.
     */
    where?: IntelPersonIdentifierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPersonIdentifiers to fetch.
     */
    orderBy?: IntelPersonIdentifierOrderByWithRelationInput | IntelPersonIdentifierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelPersonIdentifiers.
     */
    cursor?: IntelPersonIdentifierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPersonIdentifiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPersonIdentifiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelPersonIdentifiers.
     */
    distinct?: IntelPersonIdentifierScalarFieldEnum | IntelPersonIdentifierScalarFieldEnum[]
  }

  /**
   * IntelPersonIdentifier findFirstOrThrow
   */
  export type IntelPersonIdentifierFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonIdentifier to fetch.
     */
    where?: IntelPersonIdentifierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPersonIdentifiers to fetch.
     */
    orderBy?: IntelPersonIdentifierOrderByWithRelationInput | IntelPersonIdentifierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelPersonIdentifiers.
     */
    cursor?: IntelPersonIdentifierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPersonIdentifiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPersonIdentifiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelPersonIdentifiers.
     */
    distinct?: IntelPersonIdentifierScalarFieldEnum | IntelPersonIdentifierScalarFieldEnum[]
  }

  /**
   * IntelPersonIdentifier findMany
   */
  export type IntelPersonIdentifierFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonIdentifiers to fetch.
     */
    where?: IntelPersonIdentifierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPersonIdentifiers to fetch.
     */
    orderBy?: IntelPersonIdentifierOrderByWithRelationInput | IntelPersonIdentifierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntelPersonIdentifiers.
     */
    cursor?: IntelPersonIdentifierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPersonIdentifiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPersonIdentifiers.
     */
    skip?: number
    distinct?: IntelPersonIdentifierScalarFieldEnum | IntelPersonIdentifierScalarFieldEnum[]
  }

  /**
   * IntelPersonIdentifier create
   */
  export type IntelPersonIdentifierCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    /**
     * The data needed to create a IntelPersonIdentifier.
     */
    data: XOR<IntelPersonIdentifierCreateInput, IntelPersonIdentifierUncheckedCreateInput>
  }

  /**
   * IntelPersonIdentifier createMany
   */
  export type IntelPersonIdentifierCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntelPersonIdentifiers.
     */
    data: IntelPersonIdentifierCreateManyInput | IntelPersonIdentifierCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelPersonIdentifier createManyAndReturn
   */
  export type IntelPersonIdentifierCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many IntelPersonIdentifiers.
     */
    data: IntelPersonIdentifierCreateManyInput | IntelPersonIdentifierCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * IntelPersonIdentifier update
   */
  export type IntelPersonIdentifierUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    /**
     * The data needed to update a IntelPersonIdentifier.
     */
    data: XOR<IntelPersonIdentifierUpdateInput, IntelPersonIdentifierUncheckedUpdateInput>
    /**
     * Choose, which IntelPersonIdentifier to update.
     */
    where: IntelPersonIdentifierWhereUniqueInput
  }

  /**
   * IntelPersonIdentifier updateMany
   */
  export type IntelPersonIdentifierUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntelPersonIdentifiers.
     */
    data: XOR<IntelPersonIdentifierUpdateManyMutationInput, IntelPersonIdentifierUncheckedUpdateManyInput>
    /**
     * Filter which IntelPersonIdentifiers to update
     */
    where?: IntelPersonIdentifierWhereInput
  }

  /**
   * IntelPersonIdentifier upsert
   */
  export type IntelPersonIdentifierUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    /**
     * The filter to search for the IntelPersonIdentifier to update in case it exists.
     */
    where: IntelPersonIdentifierWhereUniqueInput
    /**
     * In case the IntelPersonIdentifier found by the `where` argument doesn't exist, create a new IntelPersonIdentifier with this data.
     */
    create: XOR<IntelPersonIdentifierCreateInput, IntelPersonIdentifierUncheckedCreateInput>
    /**
     * In case the IntelPersonIdentifier was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntelPersonIdentifierUpdateInput, IntelPersonIdentifierUncheckedUpdateInput>
  }

  /**
   * IntelPersonIdentifier delete
   */
  export type IntelPersonIdentifierDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
    /**
     * Filter which IntelPersonIdentifier to delete.
     */
    where: IntelPersonIdentifierWhereUniqueInput
  }

  /**
   * IntelPersonIdentifier deleteMany
   */
  export type IntelPersonIdentifierDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelPersonIdentifiers to delete
     */
    where?: IntelPersonIdentifierWhereInput
  }

  /**
   * IntelPersonIdentifier without action
   */
  export type IntelPersonIdentifierDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonIdentifier
     */
    select?: IntelPersonIdentifierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonIdentifierInclude<ExtArgs> | null
  }


  /**
   * Model IntelBiometricProfile
   */

  export type AggregateIntelBiometricProfile = {
    _count: IntelBiometricProfileCountAggregateOutputType | null
    _avg: IntelBiometricProfileAvgAggregateOutputType | null
    _sum: IntelBiometricProfileSumAggregateOutputType | null
    _min: IntelBiometricProfileMinAggregateOutputType | null
    _max: IntelBiometricProfileMaxAggregateOutputType | null
  }

  export type IntelBiometricProfileAvgAggregateOutputType = {
    qualityScore: number | null
  }

  export type IntelBiometricProfileSumAggregateOutputType = {
    qualityScore: number | null
  }

  export type IntelBiometricProfileMinAggregateOutputType = {
    id: string | null
    personId: string | null
    modality: string | null
    embeddingCiphertext: Buffer | null
    qualityScore: number | null
    isActive: boolean | null
    enrolledAt: Date | null
  }

  export type IntelBiometricProfileMaxAggregateOutputType = {
    id: string | null
    personId: string | null
    modality: string | null
    embeddingCiphertext: Buffer | null
    qualityScore: number | null
    isActive: boolean | null
    enrolledAt: Date | null
  }

  export type IntelBiometricProfileCountAggregateOutputType = {
    id: number
    personId: number
    modality: number
    embeddingCiphertext: number
    qualityScore: number
    isActive: number
    enrolledAt: number
    _all: number
  }


  export type IntelBiometricProfileAvgAggregateInputType = {
    qualityScore?: true
  }

  export type IntelBiometricProfileSumAggregateInputType = {
    qualityScore?: true
  }

  export type IntelBiometricProfileMinAggregateInputType = {
    id?: true
    personId?: true
    modality?: true
    embeddingCiphertext?: true
    qualityScore?: true
    isActive?: true
    enrolledAt?: true
  }

  export type IntelBiometricProfileMaxAggregateInputType = {
    id?: true
    personId?: true
    modality?: true
    embeddingCiphertext?: true
    qualityScore?: true
    isActive?: true
    enrolledAt?: true
  }

  export type IntelBiometricProfileCountAggregateInputType = {
    id?: true
    personId?: true
    modality?: true
    embeddingCiphertext?: true
    qualityScore?: true
    isActive?: true
    enrolledAt?: true
    _all?: true
  }

  export type IntelBiometricProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelBiometricProfile to aggregate.
     */
    where?: IntelBiometricProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelBiometricProfiles to fetch.
     */
    orderBy?: IntelBiometricProfileOrderByWithRelationInput | IntelBiometricProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntelBiometricProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelBiometricProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelBiometricProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntelBiometricProfiles
    **/
    _count?: true | IntelBiometricProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IntelBiometricProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IntelBiometricProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntelBiometricProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntelBiometricProfileMaxAggregateInputType
  }

  export type GetIntelBiometricProfileAggregateType<T extends IntelBiometricProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateIntelBiometricProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntelBiometricProfile[P]>
      : GetScalarType<T[P], AggregateIntelBiometricProfile[P]>
  }




  export type IntelBiometricProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelBiometricProfileWhereInput
    orderBy?: IntelBiometricProfileOrderByWithAggregationInput | IntelBiometricProfileOrderByWithAggregationInput[]
    by: IntelBiometricProfileScalarFieldEnum[] | IntelBiometricProfileScalarFieldEnum
    having?: IntelBiometricProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntelBiometricProfileCountAggregateInputType | true
    _avg?: IntelBiometricProfileAvgAggregateInputType
    _sum?: IntelBiometricProfileSumAggregateInputType
    _min?: IntelBiometricProfileMinAggregateInputType
    _max?: IntelBiometricProfileMaxAggregateInputType
  }

  export type IntelBiometricProfileGroupByOutputType = {
    id: string
    personId: string
    modality: string
    embeddingCiphertext: Buffer
    qualityScore: number
    isActive: boolean
    enrolledAt: Date
    _count: IntelBiometricProfileCountAggregateOutputType | null
    _avg: IntelBiometricProfileAvgAggregateOutputType | null
    _sum: IntelBiometricProfileSumAggregateOutputType | null
    _min: IntelBiometricProfileMinAggregateOutputType | null
    _max: IntelBiometricProfileMaxAggregateOutputType | null
  }

  type GetIntelBiometricProfileGroupByPayload<T extends IntelBiometricProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntelBiometricProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntelBiometricProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntelBiometricProfileGroupByOutputType[P]>
            : GetScalarType<T[P], IntelBiometricProfileGroupByOutputType[P]>
        }
      >
    >


  export type IntelBiometricProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    modality?: boolean
    embeddingCiphertext?: boolean
    qualityScore?: boolean
    isActive?: boolean
    enrolledAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelBiometricProfile"]>

  export type IntelBiometricProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    modality?: boolean
    embeddingCiphertext?: boolean
    qualityScore?: boolean
    isActive?: boolean
    enrolledAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelBiometricProfile"]>

  export type IntelBiometricProfileSelectScalar = {
    id?: boolean
    personId?: boolean
    modality?: boolean
    embeddingCiphertext?: boolean
    qualityScore?: boolean
    isActive?: boolean
    enrolledAt?: boolean
  }

  export type IntelBiometricProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }
  export type IntelBiometricProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }

  export type $IntelBiometricProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntelBiometricProfile"
    objects: {
      person: Prisma.$IntelPersonPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      personId: string
      modality: string
      embeddingCiphertext: Buffer
      qualityScore: number
      isActive: boolean
      enrolledAt: Date
    }, ExtArgs["result"]["intelBiometricProfile"]>
    composites: {}
  }

  type IntelBiometricProfileGetPayload<S extends boolean | null | undefined | IntelBiometricProfileDefaultArgs> = $Result.GetResult<Prisma.$IntelBiometricProfilePayload, S>

  type IntelBiometricProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IntelBiometricProfileFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IntelBiometricProfileCountAggregateInputType | true
    }

  export interface IntelBiometricProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntelBiometricProfile'], meta: { name: 'IntelBiometricProfile' } }
    /**
     * Find zero or one IntelBiometricProfile that matches the filter.
     * @param {IntelBiometricProfileFindUniqueArgs} args - Arguments to find a IntelBiometricProfile
     * @example
     * // Get one IntelBiometricProfile
     * const intelBiometricProfile = await prisma.intelBiometricProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntelBiometricProfileFindUniqueArgs>(args: SelectSubset<T, IntelBiometricProfileFindUniqueArgs<ExtArgs>>): Prisma__IntelBiometricProfileClient<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one IntelBiometricProfile that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IntelBiometricProfileFindUniqueOrThrowArgs} args - Arguments to find a IntelBiometricProfile
     * @example
     * // Get one IntelBiometricProfile
     * const intelBiometricProfile = await prisma.intelBiometricProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntelBiometricProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, IntelBiometricProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntelBiometricProfileClient<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first IntelBiometricProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelBiometricProfileFindFirstArgs} args - Arguments to find a IntelBiometricProfile
     * @example
     * // Get one IntelBiometricProfile
     * const intelBiometricProfile = await prisma.intelBiometricProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntelBiometricProfileFindFirstArgs>(args?: SelectSubset<T, IntelBiometricProfileFindFirstArgs<ExtArgs>>): Prisma__IntelBiometricProfileClient<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first IntelBiometricProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelBiometricProfileFindFirstOrThrowArgs} args - Arguments to find a IntelBiometricProfile
     * @example
     * // Get one IntelBiometricProfile
     * const intelBiometricProfile = await prisma.intelBiometricProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntelBiometricProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, IntelBiometricProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntelBiometricProfileClient<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more IntelBiometricProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelBiometricProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntelBiometricProfiles
     * const intelBiometricProfiles = await prisma.intelBiometricProfile.findMany()
     * 
     * // Get first 10 IntelBiometricProfiles
     * const intelBiometricProfiles = await prisma.intelBiometricProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const intelBiometricProfileWithIdOnly = await prisma.intelBiometricProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntelBiometricProfileFindManyArgs>(args?: SelectSubset<T, IntelBiometricProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a IntelBiometricProfile.
     * @param {IntelBiometricProfileCreateArgs} args - Arguments to create a IntelBiometricProfile.
     * @example
     * // Create one IntelBiometricProfile
     * const IntelBiometricProfile = await prisma.intelBiometricProfile.create({
     *   data: {
     *     // ... data to create a IntelBiometricProfile
     *   }
     * })
     * 
     */
    create<T extends IntelBiometricProfileCreateArgs>(args: SelectSubset<T, IntelBiometricProfileCreateArgs<ExtArgs>>): Prisma__IntelBiometricProfileClient<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many IntelBiometricProfiles.
     * @param {IntelBiometricProfileCreateManyArgs} args - Arguments to create many IntelBiometricProfiles.
     * @example
     * // Create many IntelBiometricProfiles
     * const intelBiometricProfile = await prisma.intelBiometricProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntelBiometricProfileCreateManyArgs>(args?: SelectSubset<T, IntelBiometricProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntelBiometricProfiles and returns the data saved in the database.
     * @param {IntelBiometricProfileCreateManyAndReturnArgs} args - Arguments to create many IntelBiometricProfiles.
     * @example
     * // Create many IntelBiometricProfiles
     * const intelBiometricProfile = await prisma.intelBiometricProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntelBiometricProfiles and only return the `id`
     * const intelBiometricProfileWithIdOnly = await prisma.intelBiometricProfile.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntelBiometricProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, IntelBiometricProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a IntelBiometricProfile.
     * @param {IntelBiometricProfileDeleteArgs} args - Arguments to delete one IntelBiometricProfile.
     * @example
     * // Delete one IntelBiometricProfile
     * const IntelBiometricProfile = await prisma.intelBiometricProfile.delete({
     *   where: {
     *     // ... filter to delete one IntelBiometricProfile
     *   }
     * })
     * 
     */
    delete<T extends IntelBiometricProfileDeleteArgs>(args: SelectSubset<T, IntelBiometricProfileDeleteArgs<ExtArgs>>): Prisma__IntelBiometricProfileClient<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one IntelBiometricProfile.
     * @param {IntelBiometricProfileUpdateArgs} args - Arguments to update one IntelBiometricProfile.
     * @example
     * // Update one IntelBiometricProfile
     * const intelBiometricProfile = await prisma.intelBiometricProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntelBiometricProfileUpdateArgs>(args: SelectSubset<T, IntelBiometricProfileUpdateArgs<ExtArgs>>): Prisma__IntelBiometricProfileClient<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more IntelBiometricProfiles.
     * @param {IntelBiometricProfileDeleteManyArgs} args - Arguments to filter IntelBiometricProfiles to delete.
     * @example
     * // Delete a few IntelBiometricProfiles
     * const { count } = await prisma.intelBiometricProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntelBiometricProfileDeleteManyArgs>(args?: SelectSubset<T, IntelBiometricProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntelBiometricProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelBiometricProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntelBiometricProfiles
     * const intelBiometricProfile = await prisma.intelBiometricProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntelBiometricProfileUpdateManyArgs>(args: SelectSubset<T, IntelBiometricProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one IntelBiometricProfile.
     * @param {IntelBiometricProfileUpsertArgs} args - Arguments to update or create a IntelBiometricProfile.
     * @example
     * // Update or create a IntelBiometricProfile
     * const intelBiometricProfile = await prisma.intelBiometricProfile.upsert({
     *   create: {
     *     // ... data to create a IntelBiometricProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntelBiometricProfile we want to update
     *   }
     * })
     */
    upsert<T extends IntelBiometricProfileUpsertArgs>(args: SelectSubset<T, IntelBiometricProfileUpsertArgs<ExtArgs>>): Prisma__IntelBiometricProfileClient<$Result.GetResult<Prisma.$IntelBiometricProfilePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of IntelBiometricProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelBiometricProfileCountArgs} args - Arguments to filter IntelBiometricProfiles to count.
     * @example
     * // Count the number of IntelBiometricProfiles
     * const count = await prisma.intelBiometricProfile.count({
     *   where: {
     *     // ... the filter for the IntelBiometricProfiles we want to count
     *   }
     * })
    **/
    count<T extends IntelBiometricProfileCountArgs>(
      args?: Subset<T, IntelBiometricProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntelBiometricProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntelBiometricProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelBiometricProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IntelBiometricProfileAggregateArgs>(args: Subset<T, IntelBiometricProfileAggregateArgs>): Prisma.PrismaPromise<GetIntelBiometricProfileAggregateType<T>>

    /**
     * Group by IntelBiometricProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelBiometricProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IntelBiometricProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntelBiometricProfileGroupByArgs['orderBy'] }
        : { orderBy?: IntelBiometricProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IntelBiometricProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntelBiometricProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntelBiometricProfile model
   */
  readonly fields: IntelBiometricProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntelBiometricProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntelBiometricProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    person<T extends IntelPersonDefaultArgs<ExtArgs> = {}>(args?: Subset<T, IntelPersonDefaultArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IntelBiometricProfile model
   */ 
  interface IntelBiometricProfileFieldRefs {
    readonly id: FieldRef<"IntelBiometricProfile", 'String'>
    readonly personId: FieldRef<"IntelBiometricProfile", 'String'>
    readonly modality: FieldRef<"IntelBiometricProfile", 'String'>
    readonly embeddingCiphertext: FieldRef<"IntelBiometricProfile", 'Bytes'>
    readonly qualityScore: FieldRef<"IntelBiometricProfile", 'Float'>
    readonly isActive: FieldRef<"IntelBiometricProfile", 'Boolean'>
    readonly enrolledAt: FieldRef<"IntelBiometricProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IntelBiometricProfile findUnique
   */
  export type IntelBiometricProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    /**
     * Filter, which IntelBiometricProfile to fetch.
     */
    where: IntelBiometricProfileWhereUniqueInput
  }

  /**
   * IntelBiometricProfile findUniqueOrThrow
   */
  export type IntelBiometricProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    /**
     * Filter, which IntelBiometricProfile to fetch.
     */
    where: IntelBiometricProfileWhereUniqueInput
  }

  /**
   * IntelBiometricProfile findFirst
   */
  export type IntelBiometricProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    /**
     * Filter, which IntelBiometricProfile to fetch.
     */
    where?: IntelBiometricProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelBiometricProfiles to fetch.
     */
    orderBy?: IntelBiometricProfileOrderByWithRelationInput | IntelBiometricProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelBiometricProfiles.
     */
    cursor?: IntelBiometricProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelBiometricProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelBiometricProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelBiometricProfiles.
     */
    distinct?: IntelBiometricProfileScalarFieldEnum | IntelBiometricProfileScalarFieldEnum[]
  }

  /**
   * IntelBiometricProfile findFirstOrThrow
   */
  export type IntelBiometricProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    /**
     * Filter, which IntelBiometricProfile to fetch.
     */
    where?: IntelBiometricProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelBiometricProfiles to fetch.
     */
    orderBy?: IntelBiometricProfileOrderByWithRelationInput | IntelBiometricProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelBiometricProfiles.
     */
    cursor?: IntelBiometricProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelBiometricProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelBiometricProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelBiometricProfiles.
     */
    distinct?: IntelBiometricProfileScalarFieldEnum | IntelBiometricProfileScalarFieldEnum[]
  }

  /**
   * IntelBiometricProfile findMany
   */
  export type IntelBiometricProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    /**
     * Filter, which IntelBiometricProfiles to fetch.
     */
    where?: IntelBiometricProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelBiometricProfiles to fetch.
     */
    orderBy?: IntelBiometricProfileOrderByWithRelationInput | IntelBiometricProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntelBiometricProfiles.
     */
    cursor?: IntelBiometricProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelBiometricProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelBiometricProfiles.
     */
    skip?: number
    distinct?: IntelBiometricProfileScalarFieldEnum | IntelBiometricProfileScalarFieldEnum[]
  }

  /**
   * IntelBiometricProfile create
   */
  export type IntelBiometricProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a IntelBiometricProfile.
     */
    data: XOR<IntelBiometricProfileCreateInput, IntelBiometricProfileUncheckedCreateInput>
  }

  /**
   * IntelBiometricProfile createMany
   */
  export type IntelBiometricProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntelBiometricProfiles.
     */
    data: IntelBiometricProfileCreateManyInput | IntelBiometricProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelBiometricProfile createManyAndReturn
   */
  export type IntelBiometricProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many IntelBiometricProfiles.
     */
    data: IntelBiometricProfileCreateManyInput | IntelBiometricProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * IntelBiometricProfile update
   */
  export type IntelBiometricProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a IntelBiometricProfile.
     */
    data: XOR<IntelBiometricProfileUpdateInput, IntelBiometricProfileUncheckedUpdateInput>
    /**
     * Choose, which IntelBiometricProfile to update.
     */
    where: IntelBiometricProfileWhereUniqueInput
  }

  /**
   * IntelBiometricProfile updateMany
   */
  export type IntelBiometricProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntelBiometricProfiles.
     */
    data: XOR<IntelBiometricProfileUpdateManyMutationInput, IntelBiometricProfileUncheckedUpdateManyInput>
    /**
     * Filter which IntelBiometricProfiles to update
     */
    where?: IntelBiometricProfileWhereInput
  }

  /**
   * IntelBiometricProfile upsert
   */
  export type IntelBiometricProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the IntelBiometricProfile to update in case it exists.
     */
    where: IntelBiometricProfileWhereUniqueInput
    /**
     * In case the IntelBiometricProfile found by the `where` argument doesn't exist, create a new IntelBiometricProfile with this data.
     */
    create: XOR<IntelBiometricProfileCreateInput, IntelBiometricProfileUncheckedCreateInput>
    /**
     * In case the IntelBiometricProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntelBiometricProfileUpdateInput, IntelBiometricProfileUncheckedUpdateInput>
  }

  /**
   * IntelBiometricProfile delete
   */
  export type IntelBiometricProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
    /**
     * Filter which IntelBiometricProfile to delete.
     */
    where: IntelBiometricProfileWhereUniqueInput
  }

  /**
   * IntelBiometricProfile deleteMany
   */
  export type IntelBiometricProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelBiometricProfiles to delete
     */
    where?: IntelBiometricProfileWhereInput
  }

  /**
   * IntelBiometricProfile without action
   */
  export type IntelBiometricProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelBiometricProfile
     */
    select?: IntelBiometricProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelBiometricProfileInclude<ExtArgs> | null
  }


  /**
   * Model IntelRiskSignal
   */

  export type AggregateIntelRiskSignal = {
    _count: IntelRiskSignalCountAggregateOutputType | null
    _min: IntelRiskSignalMinAggregateOutputType | null
    _max: IntelRiskSignalMaxAggregateOutputType | null
  }

  export type IntelRiskSignalMinAggregateOutputType = {
    id: string | null
    personId: string | null
    type: string | null
    severity: string | null
    source: string | null
    isActive: boolean | null
    createdAt: Date | null
  }

  export type IntelRiskSignalMaxAggregateOutputType = {
    id: string | null
    personId: string | null
    type: string | null
    severity: string | null
    source: string | null
    isActive: boolean | null
    createdAt: Date | null
  }

  export type IntelRiskSignalCountAggregateOutputType = {
    id: number
    personId: number
    type: number
    severity: number
    source: number
    isActive: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type IntelRiskSignalMinAggregateInputType = {
    id?: true
    personId?: true
    type?: true
    severity?: true
    source?: true
    isActive?: true
    createdAt?: true
  }

  export type IntelRiskSignalMaxAggregateInputType = {
    id?: true
    personId?: true
    type?: true
    severity?: true
    source?: true
    isActive?: true
    createdAt?: true
  }

  export type IntelRiskSignalCountAggregateInputType = {
    id?: true
    personId?: true
    type?: true
    severity?: true
    source?: true
    isActive?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type IntelRiskSignalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelRiskSignal to aggregate.
     */
    where?: IntelRiskSignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelRiskSignals to fetch.
     */
    orderBy?: IntelRiskSignalOrderByWithRelationInput | IntelRiskSignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntelRiskSignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelRiskSignals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelRiskSignals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntelRiskSignals
    **/
    _count?: true | IntelRiskSignalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntelRiskSignalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntelRiskSignalMaxAggregateInputType
  }

  export type GetIntelRiskSignalAggregateType<T extends IntelRiskSignalAggregateArgs> = {
        [P in keyof T & keyof AggregateIntelRiskSignal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntelRiskSignal[P]>
      : GetScalarType<T[P], AggregateIntelRiskSignal[P]>
  }




  export type IntelRiskSignalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelRiskSignalWhereInput
    orderBy?: IntelRiskSignalOrderByWithAggregationInput | IntelRiskSignalOrderByWithAggregationInput[]
    by: IntelRiskSignalScalarFieldEnum[] | IntelRiskSignalScalarFieldEnum
    having?: IntelRiskSignalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntelRiskSignalCountAggregateInputType | true
    _min?: IntelRiskSignalMinAggregateInputType
    _max?: IntelRiskSignalMaxAggregateInputType
  }

  export type IntelRiskSignalGroupByOutputType = {
    id: string
    personId: string
    type: string
    severity: string
    source: string
    isActive: boolean
    metadata: JsonValue | null
    createdAt: Date
    _count: IntelRiskSignalCountAggregateOutputType | null
    _min: IntelRiskSignalMinAggregateOutputType | null
    _max: IntelRiskSignalMaxAggregateOutputType | null
  }

  type GetIntelRiskSignalGroupByPayload<T extends IntelRiskSignalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntelRiskSignalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntelRiskSignalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntelRiskSignalGroupByOutputType[P]>
            : GetScalarType<T[P], IntelRiskSignalGroupByOutputType[P]>
        }
      >
    >


  export type IntelRiskSignalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    type?: boolean
    severity?: boolean
    source?: boolean
    isActive?: boolean
    metadata?: boolean
    createdAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelRiskSignal"]>

  export type IntelRiskSignalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    type?: boolean
    severity?: boolean
    source?: boolean
    isActive?: boolean
    metadata?: boolean
    createdAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelRiskSignal"]>

  export type IntelRiskSignalSelectScalar = {
    id?: boolean
    personId?: boolean
    type?: boolean
    severity?: boolean
    source?: boolean
    isActive?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type IntelRiskSignalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }
  export type IntelRiskSignalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }

  export type $IntelRiskSignalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntelRiskSignal"
    objects: {
      person: Prisma.$IntelPersonPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      personId: string
      type: string
      severity: string
      source: string
      isActive: boolean
      metadata: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["intelRiskSignal"]>
    composites: {}
  }

  type IntelRiskSignalGetPayload<S extends boolean | null | undefined | IntelRiskSignalDefaultArgs> = $Result.GetResult<Prisma.$IntelRiskSignalPayload, S>

  type IntelRiskSignalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IntelRiskSignalFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IntelRiskSignalCountAggregateInputType | true
    }

  export interface IntelRiskSignalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntelRiskSignal'], meta: { name: 'IntelRiskSignal' } }
    /**
     * Find zero or one IntelRiskSignal that matches the filter.
     * @param {IntelRiskSignalFindUniqueArgs} args - Arguments to find a IntelRiskSignal
     * @example
     * // Get one IntelRiskSignal
     * const intelRiskSignal = await prisma.intelRiskSignal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntelRiskSignalFindUniqueArgs>(args: SelectSubset<T, IntelRiskSignalFindUniqueArgs<ExtArgs>>): Prisma__IntelRiskSignalClient<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one IntelRiskSignal that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IntelRiskSignalFindUniqueOrThrowArgs} args - Arguments to find a IntelRiskSignal
     * @example
     * // Get one IntelRiskSignal
     * const intelRiskSignal = await prisma.intelRiskSignal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntelRiskSignalFindUniqueOrThrowArgs>(args: SelectSubset<T, IntelRiskSignalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntelRiskSignalClient<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first IntelRiskSignal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelRiskSignalFindFirstArgs} args - Arguments to find a IntelRiskSignal
     * @example
     * // Get one IntelRiskSignal
     * const intelRiskSignal = await prisma.intelRiskSignal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntelRiskSignalFindFirstArgs>(args?: SelectSubset<T, IntelRiskSignalFindFirstArgs<ExtArgs>>): Prisma__IntelRiskSignalClient<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first IntelRiskSignal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelRiskSignalFindFirstOrThrowArgs} args - Arguments to find a IntelRiskSignal
     * @example
     * // Get one IntelRiskSignal
     * const intelRiskSignal = await prisma.intelRiskSignal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntelRiskSignalFindFirstOrThrowArgs>(args?: SelectSubset<T, IntelRiskSignalFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntelRiskSignalClient<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more IntelRiskSignals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelRiskSignalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntelRiskSignals
     * const intelRiskSignals = await prisma.intelRiskSignal.findMany()
     * 
     * // Get first 10 IntelRiskSignals
     * const intelRiskSignals = await prisma.intelRiskSignal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const intelRiskSignalWithIdOnly = await prisma.intelRiskSignal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntelRiskSignalFindManyArgs>(args?: SelectSubset<T, IntelRiskSignalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a IntelRiskSignal.
     * @param {IntelRiskSignalCreateArgs} args - Arguments to create a IntelRiskSignal.
     * @example
     * // Create one IntelRiskSignal
     * const IntelRiskSignal = await prisma.intelRiskSignal.create({
     *   data: {
     *     // ... data to create a IntelRiskSignal
     *   }
     * })
     * 
     */
    create<T extends IntelRiskSignalCreateArgs>(args: SelectSubset<T, IntelRiskSignalCreateArgs<ExtArgs>>): Prisma__IntelRiskSignalClient<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many IntelRiskSignals.
     * @param {IntelRiskSignalCreateManyArgs} args - Arguments to create many IntelRiskSignals.
     * @example
     * // Create many IntelRiskSignals
     * const intelRiskSignal = await prisma.intelRiskSignal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntelRiskSignalCreateManyArgs>(args?: SelectSubset<T, IntelRiskSignalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntelRiskSignals and returns the data saved in the database.
     * @param {IntelRiskSignalCreateManyAndReturnArgs} args - Arguments to create many IntelRiskSignals.
     * @example
     * // Create many IntelRiskSignals
     * const intelRiskSignal = await prisma.intelRiskSignal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntelRiskSignals and only return the `id`
     * const intelRiskSignalWithIdOnly = await prisma.intelRiskSignal.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntelRiskSignalCreateManyAndReturnArgs>(args?: SelectSubset<T, IntelRiskSignalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a IntelRiskSignal.
     * @param {IntelRiskSignalDeleteArgs} args - Arguments to delete one IntelRiskSignal.
     * @example
     * // Delete one IntelRiskSignal
     * const IntelRiskSignal = await prisma.intelRiskSignal.delete({
     *   where: {
     *     // ... filter to delete one IntelRiskSignal
     *   }
     * })
     * 
     */
    delete<T extends IntelRiskSignalDeleteArgs>(args: SelectSubset<T, IntelRiskSignalDeleteArgs<ExtArgs>>): Prisma__IntelRiskSignalClient<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one IntelRiskSignal.
     * @param {IntelRiskSignalUpdateArgs} args - Arguments to update one IntelRiskSignal.
     * @example
     * // Update one IntelRiskSignal
     * const intelRiskSignal = await prisma.intelRiskSignal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntelRiskSignalUpdateArgs>(args: SelectSubset<T, IntelRiskSignalUpdateArgs<ExtArgs>>): Prisma__IntelRiskSignalClient<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more IntelRiskSignals.
     * @param {IntelRiskSignalDeleteManyArgs} args - Arguments to filter IntelRiskSignals to delete.
     * @example
     * // Delete a few IntelRiskSignals
     * const { count } = await prisma.intelRiskSignal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntelRiskSignalDeleteManyArgs>(args?: SelectSubset<T, IntelRiskSignalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntelRiskSignals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelRiskSignalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntelRiskSignals
     * const intelRiskSignal = await prisma.intelRiskSignal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntelRiskSignalUpdateManyArgs>(args: SelectSubset<T, IntelRiskSignalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one IntelRiskSignal.
     * @param {IntelRiskSignalUpsertArgs} args - Arguments to update or create a IntelRiskSignal.
     * @example
     * // Update or create a IntelRiskSignal
     * const intelRiskSignal = await prisma.intelRiskSignal.upsert({
     *   create: {
     *     // ... data to create a IntelRiskSignal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntelRiskSignal we want to update
     *   }
     * })
     */
    upsert<T extends IntelRiskSignalUpsertArgs>(args: SelectSubset<T, IntelRiskSignalUpsertArgs<ExtArgs>>): Prisma__IntelRiskSignalClient<$Result.GetResult<Prisma.$IntelRiskSignalPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of IntelRiskSignals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelRiskSignalCountArgs} args - Arguments to filter IntelRiskSignals to count.
     * @example
     * // Count the number of IntelRiskSignals
     * const count = await prisma.intelRiskSignal.count({
     *   where: {
     *     // ... the filter for the IntelRiskSignals we want to count
     *   }
     * })
    **/
    count<T extends IntelRiskSignalCountArgs>(
      args?: Subset<T, IntelRiskSignalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntelRiskSignalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntelRiskSignal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelRiskSignalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IntelRiskSignalAggregateArgs>(args: Subset<T, IntelRiskSignalAggregateArgs>): Prisma.PrismaPromise<GetIntelRiskSignalAggregateType<T>>

    /**
     * Group by IntelRiskSignal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelRiskSignalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IntelRiskSignalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntelRiskSignalGroupByArgs['orderBy'] }
        : { orderBy?: IntelRiskSignalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IntelRiskSignalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntelRiskSignalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntelRiskSignal model
   */
  readonly fields: IntelRiskSignalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntelRiskSignal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntelRiskSignalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    person<T extends IntelPersonDefaultArgs<ExtArgs> = {}>(args?: Subset<T, IntelPersonDefaultArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IntelRiskSignal model
   */ 
  interface IntelRiskSignalFieldRefs {
    readonly id: FieldRef<"IntelRiskSignal", 'String'>
    readonly personId: FieldRef<"IntelRiskSignal", 'String'>
    readonly type: FieldRef<"IntelRiskSignal", 'String'>
    readonly severity: FieldRef<"IntelRiskSignal", 'String'>
    readonly source: FieldRef<"IntelRiskSignal", 'String'>
    readonly isActive: FieldRef<"IntelRiskSignal", 'Boolean'>
    readonly metadata: FieldRef<"IntelRiskSignal", 'Json'>
    readonly createdAt: FieldRef<"IntelRiskSignal", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IntelRiskSignal findUnique
   */
  export type IntelRiskSignalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    /**
     * Filter, which IntelRiskSignal to fetch.
     */
    where: IntelRiskSignalWhereUniqueInput
  }

  /**
   * IntelRiskSignal findUniqueOrThrow
   */
  export type IntelRiskSignalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    /**
     * Filter, which IntelRiskSignal to fetch.
     */
    where: IntelRiskSignalWhereUniqueInput
  }

  /**
   * IntelRiskSignal findFirst
   */
  export type IntelRiskSignalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    /**
     * Filter, which IntelRiskSignal to fetch.
     */
    where?: IntelRiskSignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelRiskSignals to fetch.
     */
    orderBy?: IntelRiskSignalOrderByWithRelationInput | IntelRiskSignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelRiskSignals.
     */
    cursor?: IntelRiskSignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelRiskSignals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelRiskSignals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelRiskSignals.
     */
    distinct?: IntelRiskSignalScalarFieldEnum | IntelRiskSignalScalarFieldEnum[]
  }

  /**
   * IntelRiskSignal findFirstOrThrow
   */
  export type IntelRiskSignalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    /**
     * Filter, which IntelRiskSignal to fetch.
     */
    where?: IntelRiskSignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelRiskSignals to fetch.
     */
    orderBy?: IntelRiskSignalOrderByWithRelationInput | IntelRiskSignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelRiskSignals.
     */
    cursor?: IntelRiskSignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelRiskSignals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelRiskSignals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelRiskSignals.
     */
    distinct?: IntelRiskSignalScalarFieldEnum | IntelRiskSignalScalarFieldEnum[]
  }

  /**
   * IntelRiskSignal findMany
   */
  export type IntelRiskSignalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    /**
     * Filter, which IntelRiskSignals to fetch.
     */
    where?: IntelRiskSignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelRiskSignals to fetch.
     */
    orderBy?: IntelRiskSignalOrderByWithRelationInput | IntelRiskSignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntelRiskSignals.
     */
    cursor?: IntelRiskSignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelRiskSignals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelRiskSignals.
     */
    skip?: number
    distinct?: IntelRiskSignalScalarFieldEnum | IntelRiskSignalScalarFieldEnum[]
  }

  /**
   * IntelRiskSignal create
   */
  export type IntelRiskSignalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    /**
     * The data needed to create a IntelRiskSignal.
     */
    data: XOR<IntelRiskSignalCreateInput, IntelRiskSignalUncheckedCreateInput>
  }

  /**
   * IntelRiskSignal createMany
   */
  export type IntelRiskSignalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntelRiskSignals.
     */
    data: IntelRiskSignalCreateManyInput | IntelRiskSignalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelRiskSignal createManyAndReturn
   */
  export type IntelRiskSignalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many IntelRiskSignals.
     */
    data: IntelRiskSignalCreateManyInput | IntelRiskSignalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * IntelRiskSignal update
   */
  export type IntelRiskSignalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    /**
     * The data needed to update a IntelRiskSignal.
     */
    data: XOR<IntelRiskSignalUpdateInput, IntelRiskSignalUncheckedUpdateInput>
    /**
     * Choose, which IntelRiskSignal to update.
     */
    where: IntelRiskSignalWhereUniqueInput
  }

  /**
   * IntelRiskSignal updateMany
   */
  export type IntelRiskSignalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntelRiskSignals.
     */
    data: XOR<IntelRiskSignalUpdateManyMutationInput, IntelRiskSignalUncheckedUpdateManyInput>
    /**
     * Filter which IntelRiskSignals to update
     */
    where?: IntelRiskSignalWhereInput
  }

  /**
   * IntelRiskSignal upsert
   */
  export type IntelRiskSignalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    /**
     * The filter to search for the IntelRiskSignal to update in case it exists.
     */
    where: IntelRiskSignalWhereUniqueInput
    /**
     * In case the IntelRiskSignal found by the `where` argument doesn't exist, create a new IntelRiskSignal with this data.
     */
    create: XOR<IntelRiskSignalCreateInput, IntelRiskSignalUncheckedCreateInput>
    /**
     * In case the IntelRiskSignal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntelRiskSignalUpdateInput, IntelRiskSignalUncheckedUpdateInput>
  }

  /**
   * IntelRiskSignal delete
   */
  export type IntelRiskSignalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
    /**
     * Filter which IntelRiskSignal to delete.
     */
    where: IntelRiskSignalWhereUniqueInput
  }

  /**
   * IntelRiskSignal deleteMany
   */
  export type IntelRiskSignalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelRiskSignals to delete
     */
    where?: IntelRiskSignalWhereInput
  }

  /**
   * IntelRiskSignal without action
   */
  export type IntelRiskSignalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelRiskSignal
     */
    select?: IntelRiskSignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelRiskSignalInclude<ExtArgs> | null
  }


  /**
   * Model IntelPersonTenantPresence
   */

  export type AggregateIntelPersonTenantPresence = {
    _count: IntelPersonTenantPresenceCountAggregateOutputType | null
    _min: IntelPersonTenantPresenceMinAggregateOutputType | null
    _max: IntelPersonTenantPresenceMaxAggregateOutputType | null
  }

  export type IntelPersonTenantPresenceMinAggregateOutputType = {
    id: string | null
    personId: string | null
    tenantId: string | null
    roleType: string | null
    createdAt: Date | null
  }

  export type IntelPersonTenantPresenceMaxAggregateOutputType = {
    id: string | null
    personId: string | null
    tenantId: string | null
    roleType: string | null
    createdAt: Date | null
  }

  export type IntelPersonTenantPresenceCountAggregateOutputType = {
    id: number
    personId: number
    tenantId: number
    roleType: number
    createdAt: number
    _all: number
  }


  export type IntelPersonTenantPresenceMinAggregateInputType = {
    id?: true
    personId?: true
    tenantId?: true
    roleType?: true
    createdAt?: true
  }

  export type IntelPersonTenantPresenceMaxAggregateInputType = {
    id?: true
    personId?: true
    tenantId?: true
    roleType?: true
    createdAt?: true
  }

  export type IntelPersonTenantPresenceCountAggregateInputType = {
    id?: true
    personId?: true
    tenantId?: true
    roleType?: true
    createdAt?: true
    _all?: true
  }

  export type IntelPersonTenantPresenceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelPersonTenantPresence to aggregate.
     */
    where?: IntelPersonTenantPresenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPersonTenantPresences to fetch.
     */
    orderBy?: IntelPersonTenantPresenceOrderByWithRelationInput | IntelPersonTenantPresenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntelPersonTenantPresenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPersonTenantPresences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPersonTenantPresences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntelPersonTenantPresences
    **/
    _count?: true | IntelPersonTenantPresenceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntelPersonTenantPresenceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntelPersonTenantPresenceMaxAggregateInputType
  }

  export type GetIntelPersonTenantPresenceAggregateType<T extends IntelPersonTenantPresenceAggregateArgs> = {
        [P in keyof T & keyof AggregateIntelPersonTenantPresence]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntelPersonTenantPresence[P]>
      : GetScalarType<T[P], AggregateIntelPersonTenantPresence[P]>
  }




  export type IntelPersonTenantPresenceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelPersonTenantPresenceWhereInput
    orderBy?: IntelPersonTenantPresenceOrderByWithAggregationInput | IntelPersonTenantPresenceOrderByWithAggregationInput[]
    by: IntelPersonTenantPresenceScalarFieldEnum[] | IntelPersonTenantPresenceScalarFieldEnum
    having?: IntelPersonTenantPresenceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntelPersonTenantPresenceCountAggregateInputType | true
    _min?: IntelPersonTenantPresenceMinAggregateInputType
    _max?: IntelPersonTenantPresenceMaxAggregateInputType
  }

  export type IntelPersonTenantPresenceGroupByOutputType = {
    id: string
    personId: string
    tenantId: string
    roleType: string
    createdAt: Date
    _count: IntelPersonTenantPresenceCountAggregateOutputType | null
    _min: IntelPersonTenantPresenceMinAggregateOutputType | null
    _max: IntelPersonTenantPresenceMaxAggregateOutputType | null
  }

  type GetIntelPersonTenantPresenceGroupByPayload<T extends IntelPersonTenantPresenceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntelPersonTenantPresenceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntelPersonTenantPresenceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntelPersonTenantPresenceGroupByOutputType[P]>
            : GetScalarType<T[P], IntelPersonTenantPresenceGroupByOutputType[P]>
        }
      >
    >


  export type IntelPersonTenantPresenceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    tenantId?: boolean
    roleType?: boolean
    createdAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelPersonTenantPresence"]>

  export type IntelPersonTenantPresenceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    tenantId?: boolean
    roleType?: boolean
    createdAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelPersonTenantPresence"]>

  export type IntelPersonTenantPresenceSelectScalar = {
    id?: boolean
    personId?: boolean
    tenantId?: boolean
    roleType?: boolean
    createdAt?: boolean
  }

  export type IntelPersonTenantPresenceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }
  export type IntelPersonTenantPresenceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }

  export type $IntelPersonTenantPresencePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntelPersonTenantPresence"
    objects: {
      person: Prisma.$IntelPersonPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      personId: string
      tenantId: string
      roleType: string
      createdAt: Date
    }, ExtArgs["result"]["intelPersonTenantPresence"]>
    composites: {}
  }

  type IntelPersonTenantPresenceGetPayload<S extends boolean | null | undefined | IntelPersonTenantPresenceDefaultArgs> = $Result.GetResult<Prisma.$IntelPersonTenantPresencePayload, S>

  type IntelPersonTenantPresenceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IntelPersonTenantPresenceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IntelPersonTenantPresenceCountAggregateInputType | true
    }

  export interface IntelPersonTenantPresenceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntelPersonTenantPresence'], meta: { name: 'IntelPersonTenantPresence' } }
    /**
     * Find zero or one IntelPersonTenantPresence that matches the filter.
     * @param {IntelPersonTenantPresenceFindUniqueArgs} args - Arguments to find a IntelPersonTenantPresence
     * @example
     * // Get one IntelPersonTenantPresence
     * const intelPersonTenantPresence = await prisma.intelPersonTenantPresence.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntelPersonTenantPresenceFindUniqueArgs>(args: SelectSubset<T, IntelPersonTenantPresenceFindUniqueArgs<ExtArgs>>): Prisma__IntelPersonTenantPresenceClient<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one IntelPersonTenantPresence that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IntelPersonTenantPresenceFindUniqueOrThrowArgs} args - Arguments to find a IntelPersonTenantPresence
     * @example
     * // Get one IntelPersonTenantPresence
     * const intelPersonTenantPresence = await prisma.intelPersonTenantPresence.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntelPersonTenantPresenceFindUniqueOrThrowArgs>(args: SelectSubset<T, IntelPersonTenantPresenceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntelPersonTenantPresenceClient<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first IntelPersonTenantPresence that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonTenantPresenceFindFirstArgs} args - Arguments to find a IntelPersonTenantPresence
     * @example
     * // Get one IntelPersonTenantPresence
     * const intelPersonTenantPresence = await prisma.intelPersonTenantPresence.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntelPersonTenantPresenceFindFirstArgs>(args?: SelectSubset<T, IntelPersonTenantPresenceFindFirstArgs<ExtArgs>>): Prisma__IntelPersonTenantPresenceClient<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first IntelPersonTenantPresence that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonTenantPresenceFindFirstOrThrowArgs} args - Arguments to find a IntelPersonTenantPresence
     * @example
     * // Get one IntelPersonTenantPresence
     * const intelPersonTenantPresence = await prisma.intelPersonTenantPresence.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntelPersonTenantPresenceFindFirstOrThrowArgs>(args?: SelectSubset<T, IntelPersonTenantPresenceFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntelPersonTenantPresenceClient<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more IntelPersonTenantPresences that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonTenantPresenceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntelPersonTenantPresences
     * const intelPersonTenantPresences = await prisma.intelPersonTenantPresence.findMany()
     * 
     * // Get first 10 IntelPersonTenantPresences
     * const intelPersonTenantPresences = await prisma.intelPersonTenantPresence.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const intelPersonTenantPresenceWithIdOnly = await prisma.intelPersonTenantPresence.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntelPersonTenantPresenceFindManyArgs>(args?: SelectSubset<T, IntelPersonTenantPresenceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a IntelPersonTenantPresence.
     * @param {IntelPersonTenantPresenceCreateArgs} args - Arguments to create a IntelPersonTenantPresence.
     * @example
     * // Create one IntelPersonTenantPresence
     * const IntelPersonTenantPresence = await prisma.intelPersonTenantPresence.create({
     *   data: {
     *     // ... data to create a IntelPersonTenantPresence
     *   }
     * })
     * 
     */
    create<T extends IntelPersonTenantPresenceCreateArgs>(args: SelectSubset<T, IntelPersonTenantPresenceCreateArgs<ExtArgs>>): Prisma__IntelPersonTenantPresenceClient<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many IntelPersonTenantPresences.
     * @param {IntelPersonTenantPresenceCreateManyArgs} args - Arguments to create many IntelPersonTenantPresences.
     * @example
     * // Create many IntelPersonTenantPresences
     * const intelPersonTenantPresence = await prisma.intelPersonTenantPresence.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntelPersonTenantPresenceCreateManyArgs>(args?: SelectSubset<T, IntelPersonTenantPresenceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntelPersonTenantPresences and returns the data saved in the database.
     * @param {IntelPersonTenantPresenceCreateManyAndReturnArgs} args - Arguments to create many IntelPersonTenantPresences.
     * @example
     * // Create many IntelPersonTenantPresences
     * const intelPersonTenantPresence = await prisma.intelPersonTenantPresence.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntelPersonTenantPresences and only return the `id`
     * const intelPersonTenantPresenceWithIdOnly = await prisma.intelPersonTenantPresence.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntelPersonTenantPresenceCreateManyAndReturnArgs>(args?: SelectSubset<T, IntelPersonTenantPresenceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a IntelPersonTenantPresence.
     * @param {IntelPersonTenantPresenceDeleteArgs} args - Arguments to delete one IntelPersonTenantPresence.
     * @example
     * // Delete one IntelPersonTenantPresence
     * const IntelPersonTenantPresence = await prisma.intelPersonTenantPresence.delete({
     *   where: {
     *     // ... filter to delete one IntelPersonTenantPresence
     *   }
     * })
     * 
     */
    delete<T extends IntelPersonTenantPresenceDeleteArgs>(args: SelectSubset<T, IntelPersonTenantPresenceDeleteArgs<ExtArgs>>): Prisma__IntelPersonTenantPresenceClient<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one IntelPersonTenantPresence.
     * @param {IntelPersonTenantPresenceUpdateArgs} args - Arguments to update one IntelPersonTenantPresence.
     * @example
     * // Update one IntelPersonTenantPresence
     * const intelPersonTenantPresence = await prisma.intelPersonTenantPresence.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntelPersonTenantPresenceUpdateArgs>(args: SelectSubset<T, IntelPersonTenantPresenceUpdateArgs<ExtArgs>>): Prisma__IntelPersonTenantPresenceClient<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more IntelPersonTenantPresences.
     * @param {IntelPersonTenantPresenceDeleteManyArgs} args - Arguments to filter IntelPersonTenantPresences to delete.
     * @example
     * // Delete a few IntelPersonTenantPresences
     * const { count } = await prisma.intelPersonTenantPresence.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntelPersonTenantPresenceDeleteManyArgs>(args?: SelectSubset<T, IntelPersonTenantPresenceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntelPersonTenantPresences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonTenantPresenceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntelPersonTenantPresences
     * const intelPersonTenantPresence = await prisma.intelPersonTenantPresence.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntelPersonTenantPresenceUpdateManyArgs>(args: SelectSubset<T, IntelPersonTenantPresenceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one IntelPersonTenantPresence.
     * @param {IntelPersonTenantPresenceUpsertArgs} args - Arguments to update or create a IntelPersonTenantPresence.
     * @example
     * // Update or create a IntelPersonTenantPresence
     * const intelPersonTenantPresence = await prisma.intelPersonTenantPresence.upsert({
     *   create: {
     *     // ... data to create a IntelPersonTenantPresence
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntelPersonTenantPresence we want to update
     *   }
     * })
     */
    upsert<T extends IntelPersonTenantPresenceUpsertArgs>(args: SelectSubset<T, IntelPersonTenantPresenceUpsertArgs<ExtArgs>>): Prisma__IntelPersonTenantPresenceClient<$Result.GetResult<Prisma.$IntelPersonTenantPresencePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of IntelPersonTenantPresences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonTenantPresenceCountArgs} args - Arguments to filter IntelPersonTenantPresences to count.
     * @example
     * // Count the number of IntelPersonTenantPresences
     * const count = await prisma.intelPersonTenantPresence.count({
     *   where: {
     *     // ... the filter for the IntelPersonTenantPresences we want to count
     *   }
     * })
    **/
    count<T extends IntelPersonTenantPresenceCountArgs>(
      args?: Subset<T, IntelPersonTenantPresenceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntelPersonTenantPresenceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntelPersonTenantPresence.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonTenantPresenceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IntelPersonTenantPresenceAggregateArgs>(args: Subset<T, IntelPersonTenantPresenceAggregateArgs>): Prisma.PrismaPromise<GetIntelPersonTenantPresenceAggregateType<T>>

    /**
     * Group by IntelPersonTenantPresence.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelPersonTenantPresenceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IntelPersonTenantPresenceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntelPersonTenantPresenceGroupByArgs['orderBy'] }
        : { orderBy?: IntelPersonTenantPresenceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IntelPersonTenantPresenceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntelPersonTenantPresenceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntelPersonTenantPresence model
   */
  readonly fields: IntelPersonTenantPresenceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntelPersonTenantPresence.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntelPersonTenantPresenceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    person<T extends IntelPersonDefaultArgs<ExtArgs> = {}>(args?: Subset<T, IntelPersonDefaultArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IntelPersonTenantPresence model
   */ 
  interface IntelPersonTenantPresenceFieldRefs {
    readonly id: FieldRef<"IntelPersonTenantPresence", 'String'>
    readonly personId: FieldRef<"IntelPersonTenantPresence", 'String'>
    readonly tenantId: FieldRef<"IntelPersonTenantPresence", 'String'>
    readonly roleType: FieldRef<"IntelPersonTenantPresence", 'String'>
    readonly createdAt: FieldRef<"IntelPersonTenantPresence", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IntelPersonTenantPresence findUnique
   */
  export type IntelPersonTenantPresenceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonTenantPresence to fetch.
     */
    where: IntelPersonTenantPresenceWhereUniqueInput
  }

  /**
   * IntelPersonTenantPresence findUniqueOrThrow
   */
  export type IntelPersonTenantPresenceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonTenantPresence to fetch.
     */
    where: IntelPersonTenantPresenceWhereUniqueInput
  }

  /**
   * IntelPersonTenantPresence findFirst
   */
  export type IntelPersonTenantPresenceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonTenantPresence to fetch.
     */
    where?: IntelPersonTenantPresenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPersonTenantPresences to fetch.
     */
    orderBy?: IntelPersonTenantPresenceOrderByWithRelationInput | IntelPersonTenantPresenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelPersonTenantPresences.
     */
    cursor?: IntelPersonTenantPresenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPersonTenantPresences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPersonTenantPresences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelPersonTenantPresences.
     */
    distinct?: IntelPersonTenantPresenceScalarFieldEnum | IntelPersonTenantPresenceScalarFieldEnum[]
  }

  /**
   * IntelPersonTenantPresence findFirstOrThrow
   */
  export type IntelPersonTenantPresenceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonTenantPresence to fetch.
     */
    where?: IntelPersonTenantPresenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPersonTenantPresences to fetch.
     */
    orderBy?: IntelPersonTenantPresenceOrderByWithRelationInput | IntelPersonTenantPresenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelPersonTenantPresences.
     */
    cursor?: IntelPersonTenantPresenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPersonTenantPresences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPersonTenantPresences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelPersonTenantPresences.
     */
    distinct?: IntelPersonTenantPresenceScalarFieldEnum | IntelPersonTenantPresenceScalarFieldEnum[]
  }

  /**
   * IntelPersonTenantPresence findMany
   */
  export type IntelPersonTenantPresenceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    /**
     * Filter, which IntelPersonTenantPresences to fetch.
     */
    where?: IntelPersonTenantPresenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelPersonTenantPresences to fetch.
     */
    orderBy?: IntelPersonTenantPresenceOrderByWithRelationInput | IntelPersonTenantPresenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntelPersonTenantPresences.
     */
    cursor?: IntelPersonTenantPresenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelPersonTenantPresences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelPersonTenantPresences.
     */
    skip?: number
    distinct?: IntelPersonTenantPresenceScalarFieldEnum | IntelPersonTenantPresenceScalarFieldEnum[]
  }

  /**
   * IntelPersonTenantPresence create
   */
  export type IntelPersonTenantPresenceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    /**
     * The data needed to create a IntelPersonTenantPresence.
     */
    data: XOR<IntelPersonTenantPresenceCreateInput, IntelPersonTenantPresenceUncheckedCreateInput>
  }

  /**
   * IntelPersonTenantPresence createMany
   */
  export type IntelPersonTenantPresenceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntelPersonTenantPresences.
     */
    data: IntelPersonTenantPresenceCreateManyInput | IntelPersonTenantPresenceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelPersonTenantPresence createManyAndReturn
   */
  export type IntelPersonTenantPresenceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many IntelPersonTenantPresences.
     */
    data: IntelPersonTenantPresenceCreateManyInput | IntelPersonTenantPresenceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * IntelPersonTenantPresence update
   */
  export type IntelPersonTenantPresenceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    /**
     * The data needed to update a IntelPersonTenantPresence.
     */
    data: XOR<IntelPersonTenantPresenceUpdateInput, IntelPersonTenantPresenceUncheckedUpdateInput>
    /**
     * Choose, which IntelPersonTenantPresence to update.
     */
    where: IntelPersonTenantPresenceWhereUniqueInput
  }

  /**
   * IntelPersonTenantPresence updateMany
   */
  export type IntelPersonTenantPresenceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntelPersonTenantPresences.
     */
    data: XOR<IntelPersonTenantPresenceUpdateManyMutationInput, IntelPersonTenantPresenceUncheckedUpdateManyInput>
    /**
     * Filter which IntelPersonTenantPresences to update
     */
    where?: IntelPersonTenantPresenceWhereInput
  }

  /**
   * IntelPersonTenantPresence upsert
   */
  export type IntelPersonTenantPresenceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    /**
     * The filter to search for the IntelPersonTenantPresence to update in case it exists.
     */
    where: IntelPersonTenantPresenceWhereUniqueInput
    /**
     * In case the IntelPersonTenantPresence found by the `where` argument doesn't exist, create a new IntelPersonTenantPresence with this data.
     */
    create: XOR<IntelPersonTenantPresenceCreateInput, IntelPersonTenantPresenceUncheckedCreateInput>
    /**
     * In case the IntelPersonTenantPresence was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntelPersonTenantPresenceUpdateInput, IntelPersonTenantPresenceUncheckedUpdateInput>
  }

  /**
   * IntelPersonTenantPresence delete
   */
  export type IntelPersonTenantPresenceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
    /**
     * Filter which IntelPersonTenantPresence to delete.
     */
    where: IntelPersonTenantPresenceWhereUniqueInput
  }

  /**
   * IntelPersonTenantPresence deleteMany
   */
  export type IntelPersonTenantPresenceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelPersonTenantPresences to delete
     */
    where?: IntelPersonTenantPresenceWhereInput
  }

  /**
   * IntelPersonTenantPresence without action
   */
  export type IntelPersonTenantPresenceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelPersonTenantPresence
     */
    select?: IntelPersonTenantPresenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelPersonTenantPresenceInclude<ExtArgs> | null
  }


  /**
   * Model IntelReviewCase
   */

  export type AggregateIntelReviewCase = {
    _count: IntelReviewCaseCountAggregateOutputType | null
    _avg: IntelReviewCaseAvgAggregateOutputType | null
    _sum: IntelReviewCaseSumAggregateOutputType | null
    _min: IntelReviewCaseMinAggregateOutputType | null
    _max: IntelReviewCaseMaxAggregateOutputType | null
  }

  export type IntelReviewCaseAvgAggregateOutputType = {
    confidenceScore: number | null
  }

  export type IntelReviewCaseSumAggregateOutputType = {
    confidenceScore: number | null
  }

  export type IntelReviewCaseMinAggregateOutputType = {
    id: string | null
    personId: string | null
    status: string | null
    resolution: string | null
    confidenceScore: number | null
    reviewedBy: string | null
    reviewedAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IntelReviewCaseMaxAggregateOutputType = {
    id: string | null
    personId: string | null
    status: string | null
    resolution: string | null
    confidenceScore: number | null
    reviewedBy: string | null
    reviewedAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IntelReviewCaseCountAggregateOutputType = {
    id: number
    personId: number
    status: number
    resolution: number
    confidenceScore: number
    evidence: number
    reviewedBy: number
    reviewedAt: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type IntelReviewCaseAvgAggregateInputType = {
    confidenceScore?: true
  }

  export type IntelReviewCaseSumAggregateInputType = {
    confidenceScore?: true
  }

  export type IntelReviewCaseMinAggregateInputType = {
    id?: true
    personId?: true
    status?: true
    resolution?: true
    confidenceScore?: true
    reviewedBy?: true
    reviewedAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IntelReviewCaseMaxAggregateInputType = {
    id?: true
    personId?: true
    status?: true
    resolution?: true
    confidenceScore?: true
    reviewedBy?: true
    reviewedAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IntelReviewCaseCountAggregateInputType = {
    id?: true
    personId?: true
    status?: true
    resolution?: true
    confidenceScore?: true
    evidence?: true
    reviewedBy?: true
    reviewedAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type IntelReviewCaseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelReviewCase to aggregate.
     */
    where?: IntelReviewCaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelReviewCases to fetch.
     */
    orderBy?: IntelReviewCaseOrderByWithRelationInput | IntelReviewCaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntelReviewCaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelReviewCases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelReviewCases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntelReviewCases
    **/
    _count?: true | IntelReviewCaseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IntelReviewCaseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IntelReviewCaseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntelReviewCaseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntelReviewCaseMaxAggregateInputType
  }

  export type GetIntelReviewCaseAggregateType<T extends IntelReviewCaseAggregateArgs> = {
        [P in keyof T & keyof AggregateIntelReviewCase]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntelReviewCase[P]>
      : GetScalarType<T[P], AggregateIntelReviewCase[P]>
  }




  export type IntelReviewCaseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelReviewCaseWhereInput
    orderBy?: IntelReviewCaseOrderByWithAggregationInput | IntelReviewCaseOrderByWithAggregationInput[]
    by: IntelReviewCaseScalarFieldEnum[] | IntelReviewCaseScalarFieldEnum
    having?: IntelReviewCaseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntelReviewCaseCountAggregateInputType | true
    _avg?: IntelReviewCaseAvgAggregateInputType
    _sum?: IntelReviewCaseSumAggregateInputType
    _min?: IntelReviewCaseMinAggregateInputType
    _max?: IntelReviewCaseMaxAggregateInputType
  }

  export type IntelReviewCaseGroupByOutputType = {
    id: string
    personId: string
    status: string
    resolution: string | null
    confidenceScore: number
    evidence: JsonValue
    reviewedBy: string | null
    reviewedAt: Date | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: IntelReviewCaseCountAggregateOutputType | null
    _avg: IntelReviewCaseAvgAggregateOutputType | null
    _sum: IntelReviewCaseSumAggregateOutputType | null
    _min: IntelReviewCaseMinAggregateOutputType | null
    _max: IntelReviewCaseMaxAggregateOutputType | null
  }

  type GetIntelReviewCaseGroupByPayload<T extends IntelReviewCaseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntelReviewCaseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntelReviewCaseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntelReviewCaseGroupByOutputType[P]>
            : GetScalarType<T[P], IntelReviewCaseGroupByOutputType[P]>
        }
      >
    >


  export type IntelReviewCaseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    status?: boolean
    resolution?: boolean
    confidenceScore?: boolean
    evidence?: boolean
    reviewedBy?: boolean
    reviewedAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelReviewCase"]>

  export type IntelReviewCaseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    status?: boolean
    resolution?: boolean
    confidenceScore?: boolean
    evidence?: boolean
    reviewedBy?: boolean
    reviewedAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intelReviewCase"]>

  export type IntelReviewCaseSelectScalar = {
    id?: boolean
    personId?: boolean
    status?: boolean
    resolution?: boolean
    confidenceScore?: boolean
    evidence?: boolean
    reviewedBy?: boolean
    reviewedAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type IntelReviewCaseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }
  export type IntelReviewCaseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    person?: boolean | IntelPersonDefaultArgs<ExtArgs>
  }

  export type $IntelReviewCasePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntelReviewCase"
    objects: {
      person: Prisma.$IntelPersonPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      personId: string
      status: string
      resolution: string | null
      confidenceScore: number
      evidence: Prisma.JsonValue
      reviewedBy: string | null
      reviewedAt: Date | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["intelReviewCase"]>
    composites: {}
  }

  type IntelReviewCaseGetPayload<S extends boolean | null | undefined | IntelReviewCaseDefaultArgs> = $Result.GetResult<Prisma.$IntelReviewCasePayload, S>

  type IntelReviewCaseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IntelReviewCaseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IntelReviewCaseCountAggregateInputType | true
    }

  export interface IntelReviewCaseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntelReviewCase'], meta: { name: 'IntelReviewCase' } }
    /**
     * Find zero or one IntelReviewCase that matches the filter.
     * @param {IntelReviewCaseFindUniqueArgs} args - Arguments to find a IntelReviewCase
     * @example
     * // Get one IntelReviewCase
     * const intelReviewCase = await prisma.intelReviewCase.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntelReviewCaseFindUniqueArgs>(args: SelectSubset<T, IntelReviewCaseFindUniqueArgs<ExtArgs>>): Prisma__IntelReviewCaseClient<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one IntelReviewCase that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IntelReviewCaseFindUniqueOrThrowArgs} args - Arguments to find a IntelReviewCase
     * @example
     * // Get one IntelReviewCase
     * const intelReviewCase = await prisma.intelReviewCase.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntelReviewCaseFindUniqueOrThrowArgs>(args: SelectSubset<T, IntelReviewCaseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntelReviewCaseClient<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first IntelReviewCase that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelReviewCaseFindFirstArgs} args - Arguments to find a IntelReviewCase
     * @example
     * // Get one IntelReviewCase
     * const intelReviewCase = await prisma.intelReviewCase.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntelReviewCaseFindFirstArgs>(args?: SelectSubset<T, IntelReviewCaseFindFirstArgs<ExtArgs>>): Prisma__IntelReviewCaseClient<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first IntelReviewCase that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelReviewCaseFindFirstOrThrowArgs} args - Arguments to find a IntelReviewCase
     * @example
     * // Get one IntelReviewCase
     * const intelReviewCase = await prisma.intelReviewCase.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntelReviewCaseFindFirstOrThrowArgs>(args?: SelectSubset<T, IntelReviewCaseFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntelReviewCaseClient<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more IntelReviewCases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelReviewCaseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntelReviewCases
     * const intelReviewCases = await prisma.intelReviewCase.findMany()
     * 
     * // Get first 10 IntelReviewCases
     * const intelReviewCases = await prisma.intelReviewCase.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const intelReviewCaseWithIdOnly = await prisma.intelReviewCase.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntelReviewCaseFindManyArgs>(args?: SelectSubset<T, IntelReviewCaseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a IntelReviewCase.
     * @param {IntelReviewCaseCreateArgs} args - Arguments to create a IntelReviewCase.
     * @example
     * // Create one IntelReviewCase
     * const IntelReviewCase = await prisma.intelReviewCase.create({
     *   data: {
     *     // ... data to create a IntelReviewCase
     *   }
     * })
     * 
     */
    create<T extends IntelReviewCaseCreateArgs>(args: SelectSubset<T, IntelReviewCaseCreateArgs<ExtArgs>>): Prisma__IntelReviewCaseClient<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many IntelReviewCases.
     * @param {IntelReviewCaseCreateManyArgs} args - Arguments to create many IntelReviewCases.
     * @example
     * // Create many IntelReviewCases
     * const intelReviewCase = await prisma.intelReviewCase.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntelReviewCaseCreateManyArgs>(args?: SelectSubset<T, IntelReviewCaseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntelReviewCases and returns the data saved in the database.
     * @param {IntelReviewCaseCreateManyAndReturnArgs} args - Arguments to create many IntelReviewCases.
     * @example
     * // Create many IntelReviewCases
     * const intelReviewCase = await prisma.intelReviewCase.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntelReviewCases and only return the `id`
     * const intelReviewCaseWithIdOnly = await prisma.intelReviewCase.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntelReviewCaseCreateManyAndReturnArgs>(args?: SelectSubset<T, IntelReviewCaseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a IntelReviewCase.
     * @param {IntelReviewCaseDeleteArgs} args - Arguments to delete one IntelReviewCase.
     * @example
     * // Delete one IntelReviewCase
     * const IntelReviewCase = await prisma.intelReviewCase.delete({
     *   where: {
     *     // ... filter to delete one IntelReviewCase
     *   }
     * })
     * 
     */
    delete<T extends IntelReviewCaseDeleteArgs>(args: SelectSubset<T, IntelReviewCaseDeleteArgs<ExtArgs>>): Prisma__IntelReviewCaseClient<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one IntelReviewCase.
     * @param {IntelReviewCaseUpdateArgs} args - Arguments to update one IntelReviewCase.
     * @example
     * // Update one IntelReviewCase
     * const intelReviewCase = await prisma.intelReviewCase.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntelReviewCaseUpdateArgs>(args: SelectSubset<T, IntelReviewCaseUpdateArgs<ExtArgs>>): Prisma__IntelReviewCaseClient<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more IntelReviewCases.
     * @param {IntelReviewCaseDeleteManyArgs} args - Arguments to filter IntelReviewCases to delete.
     * @example
     * // Delete a few IntelReviewCases
     * const { count } = await prisma.intelReviewCase.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntelReviewCaseDeleteManyArgs>(args?: SelectSubset<T, IntelReviewCaseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntelReviewCases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelReviewCaseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntelReviewCases
     * const intelReviewCase = await prisma.intelReviewCase.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntelReviewCaseUpdateManyArgs>(args: SelectSubset<T, IntelReviewCaseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one IntelReviewCase.
     * @param {IntelReviewCaseUpsertArgs} args - Arguments to update or create a IntelReviewCase.
     * @example
     * // Update or create a IntelReviewCase
     * const intelReviewCase = await prisma.intelReviewCase.upsert({
     *   create: {
     *     // ... data to create a IntelReviewCase
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntelReviewCase we want to update
     *   }
     * })
     */
    upsert<T extends IntelReviewCaseUpsertArgs>(args: SelectSubset<T, IntelReviewCaseUpsertArgs<ExtArgs>>): Prisma__IntelReviewCaseClient<$Result.GetResult<Prisma.$IntelReviewCasePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of IntelReviewCases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelReviewCaseCountArgs} args - Arguments to filter IntelReviewCases to count.
     * @example
     * // Count the number of IntelReviewCases
     * const count = await prisma.intelReviewCase.count({
     *   where: {
     *     // ... the filter for the IntelReviewCases we want to count
     *   }
     * })
    **/
    count<T extends IntelReviewCaseCountArgs>(
      args?: Subset<T, IntelReviewCaseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntelReviewCaseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntelReviewCase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelReviewCaseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IntelReviewCaseAggregateArgs>(args: Subset<T, IntelReviewCaseAggregateArgs>): Prisma.PrismaPromise<GetIntelReviewCaseAggregateType<T>>

    /**
     * Group by IntelReviewCase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelReviewCaseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IntelReviewCaseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntelReviewCaseGroupByArgs['orderBy'] }
        : { orderBy?: IntelReviewCaseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IntelReviewCaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntelReviewCaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntelReviewCase model
   */
  readonly fields: IntelReviewCaseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntelReviewCase.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntelReviewCaseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    person<T extends IntelPersonDefaultArgs<ExtArgs> = {}>(args?: Subset<T, IntelPersonDefaultArgs<ExtArgs>>): Prisma__IntelPersonClient<$Result.GetResult<Prisma.$IntelPersonPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IntelReviewCase model
   */ 
  interface IntelReviewCaseFieldRefs {
    readonly id: FieldRef<"IntelReviewCase", 'String'>
    readonly personId: FieldRef<"IntelReviewCase", 'String'>
    readonly status: FieldRef<"IntelReviewCase", 'String'>
    readonly resolution: FieldRef<"IntelReviewCase", 'String'>
    readonly confidenceScore: FieldRef<"IntelReviewCase", 'Float'>
    readonly evidence: FieldRef<"IntelReviewCase", 'Json'>
    readonly reviewedBy: FieldRef<"IntelReviewCase", 'String'>
    readonly reviewedAt: FieldRef<"IntelReviewCase", 'DateTime'>
    readonly notes: FieldRef<"IntelReviewCase", 'String'>
    readonly createdAt: FieldRef<"IntelReviewCase", 'DateTime'>
    readonly updatedAt: FieldRef<"IntelReviewCase", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IntelReviewCase findUnique
   */
  export type IntelReviewCaseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    /**
     * Filter, which IntelReviewCase to fetch.
     */
    where: IntelReviewCaseWhereUniqueInput
  }

  /**
   * IntelReviewCase findUniqueOrThrow
   */
  export type IntelReviewCaseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    /**
     * Filter, which IntelReviewCase to fetch.
     */
    where: IntelReviewCaseWhereUniqueInput
  }

  /**
   * IntelReviewCase findFirst
   */
  export type IntelReviewCaseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    /**
     * Filter, which IntelReviewCase to fetch.
     */
    where?: IntelReviewCaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelReviewCases to fetch.
     */
    orderBy?: IntelReviewCaseOrderByWithRelationInput | IntelReviewCaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelReviewCases.
     */
    cursor?: IntelReviewCaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelReviewCases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelReviewCases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelReviewCases.
     */
    distinct?: IntelReviewCaseScalarFieldEnum | IntelReviewCaseScalarFieldEnum[]
  }

  /**
   * IntelReviewCase findFirstOrThrow
   */
  export type IntelReviewCaseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    /**
     * Filter, which IntelReviewCase to fetch.
     */
    where?: IntelReviewCaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelReviewCases to fetch.
     */
    orderBy?: IntelReviewCaseOrderByWithRelationInput | IntelReviewCaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelReviewCases.
     */
    cursor?: IntelReviewCaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelReviewCases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelReviewCases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelReviewCases.
     */
    distinct?: IntelReviewCaseScalarFieldEnum | IntelReviewCaseScalarFieldEnum[]
  }

  /**
   * IntelReviewCase findMany
   */
  export type IntelReviewCaseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    /**
     * Filter, which IntelReviewCases to fetch.
     */
    where?: IntelReviewCaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelReviewCases to fetch.
     */
    orderBy?: IntelReviewCaseOrderByWithRelationInput | IntelReviewCaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntelReviewCases.
     */
    cursor?: IntelReviewCaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelReviewCases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelReviewCases.
     */
    skip?: number
    distinct?: IntelReviewCaseScalarFieldEnum | IntelReviewCaseScalarFieldEnum[]
  }

  /**
   * IntelReviewCase create
   */
  export type IntelReviewCaseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    /**
     * The data needed to create a IntelReviewCase.
     */
    data: XOR<IntelReviewCaseCreateInput, IntelReviewCaseUncheckedCreateInput>
  }

  /**
   * IntelReviewCase createMany
   */
  export type IntelReviewCaseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntelReviewCases.
     */
    data: IntelReviewCaseCreateManyInput | IntelReviewCaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelReviewCase createManyAndReturn
   */
  export type IntelReviewCaseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many IntelReviewCases.
     */
    data: IntelReviewCaseCreateManyInput | IntelReviewCaseCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * IntelReviewCase update
   */
  export type IntelReviewCaseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    /**
     * The data needed to update a IntelReviewCase.
     */
    data: XOR<IntelReviewCaseUpdateInput, IntelReviewCaseUncheckedUpdateInput>
    /**
     * Choose, which IntelReviewCase to update.
     */
    where: IntelReviewCaseWhereUniqueInput
  }

  /**
   * IntelReviewCase updateMany
   */
  export type IntelReviewCaseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntelReviewCases.
     */
    data: XOR<IntelReviewCaseUpdateManyMutationInput, IntelReviewCaseUncheckedUpdateManyInput>
    /**
     * Filter which IntelReviewCases to update
     */
    where?: IntelReviewCaseWhereInput
  }

  /**
   * IntelReviewCase upsert
   */
  export type IntelReviewCaseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    /**
     * The filter to search for the IntelReviewCase to update in case it exists.
     */
    where: IntelReviewCaseWhereUniqueInput
    /**
     * In case the IntelReviewCase found by the `where` argument doesn't exist, create a new IntelReviewCase with this data.
     */
    create: XOR<IntelReviewCaseCreateInput, IntelReviewCaseUncheckedCreateInput>
    /**
     * In case the IntelReviewCase was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntelReviewCaseUpdateInput, IntelReviewCaseUncheckedUpdateInput>
  }

  /**
   * IntelReviewCase delete
   */
  export type IntelReviewCaseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
    /**
     * Filter which IntelReviewCase to delete.
     */
    where: IntelReviewCaseWhereUniqueInput
  }

  /**
   * IntelReviewCase deleteMany
   */
  export type IntelReviewCaseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelReviewCases to delete
     */
    where?: IntelReviewCaseWhereInput
  }

  /**
   * IntelReviewCase without action
   */
  export type IntelReviewCaseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelReviewCase
     */
    select?: IntelReviewCaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntelReviewCaseInclude<ExtArgs> | null
  }


  /**
   * Model IntelWatchlistEntry
   */

  export type AggregateIntelWatchlistEntry = {
    _count: IntelWatchlistEntryCountAggregateOutputType | null
    _min: IntelWatchlistEntryMinAggregateOutputType | null
    _max: IntelWatchlistEntryMaxAggregateOutputType | null
  }

  export type IntelWatchlistEntryMinAggregateOutputType = {
    id: string | null
    personId: string | null
    type: string | null
    reason: string | null
    addedBy: string | null
    expiresAt: Date | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IntelWatchlistEntryMaxAggregateOutputType = {
    id: string | null
    personId: string | null
    type: string | null
    reason: string | null
    addedBy: string | null
    expiresAt: Date | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IntelWatchlistEntryCountAggregateOutputType = {
    id: number
    personId: number
    type: number
    reason: number
    addedBy: number
    expiresAt: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type IntelWatchlistEntryMinAggregateInputType = {
    id?: true
    personId?: true
    type?: true
    reason?: true
    addedBy?: true
    expiresAt?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IntelWatchlistEntryMaxAggregateInputType = {
    id?: true
    personId?: true
    type?: true
    reason?: true
    addedBy?: true
    expiresAt?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IntelWatchlistEntryCountAggregateInputType = {
    id?: true
    personId?: true
    type?: true
    reason?: true
    addedBy?: true
    expiresAt?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type IntelWatchlistEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelWatchlistEntry to aggregate.
     */
    where?: IntelWatchlistEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelWatchlistEntries to fetch.
     */
    orderBy?: IntelWatchlistEntryOrderByWithRelationInput | IntelWatchlistEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntelWatchlistEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelWatchlistEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelWatchlistEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntelWatchlistEntries
    **/
    _count?: true | IntelWatchlistEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntelWatchlistEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntelWatchlistEntryMaxAggregateInputType
  }

  export type GetIntelWatchlistEntryAggregateType<T extends IntelWatchlistEntryAggregateArgs> = {
        [P in keyof T & keyof AggregateIntelWatchlistEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntelWatchlistEntry[P]>
      : GetScalarType<T[P], AggregateIntelWatchlistEntry[P]>
  }




  export type IntelWatchlistEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelWatchlistEntryWhereInput
    orderBy?: IntelWatchlistEntryOrderByWithAggregationInput | IntelWatchlistEntryOrderByWithAggregationInput[]
    by: IntelWatchlistEntryScalarFieldEnum[] | IntelWatchlistEntryScalarFieldEnum
    having?: IntelWatchlistEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntelWatchlistEntryCountAggregateInputType | true
    _min?: IntelWatchlistEntryMinAggregateInputType
    _max?: IntelWatchlistEntryMaxAggregateInputType
  }

  export type IntelWatchlistEntryGroupByOutputType = {
    id: string
    personId: string
    type: string
    reason: string
    addedBy: string
    expiresAt: Date | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: IntelWatchlistEntryCountAggregateOutputType | null
    _min: IntelWatchlistEntryMinAggregateOutputType | null
    _max: IntelWatchlistEntryMaxAggregateOutputType | null
  }

  type GetIntelWatchlistEntryGroupByPayload<T extends IntelWatchlistEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntelWatchlistEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntelWatchlistEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntelWatchlistEntryGroupByOutputType[P]>
            : GetScalarType<T[P], IntelWatchlistEntryGroupByOutputType[P]>
        }
      >
    >


  export type IntelWatchlistEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    type?: boolean
    reason?: boolean
    addedBy?: boolean
    expiresAt?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["intelWatchlistEntry"]>

  export type IntelWatchlistEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    type?: boolean
    reason?: boolean
    addedBy?: boolean
    expiresAt?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["intelWatchlistEntry"]>

  export type IntelWatchlistEntrySelectScalar = {
    id?: boolean
    personId?: boolean
    type?: boolean
    reason?: boolean
    addedBy?: boolean
    expiresAt?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $IntelWatchlistEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntelWatchlistEntry"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      personId: string
      type: string
      reason: string
      addedBy: string
      expiresAt: Date | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["intelWatchlistEntry"]>
    composites: {}
  }

  type IntelWatchlistEntryGetPayload<S extends boolean | null | undefined | IntelWatchlistEntryDefaultArgs> = $Result.GetResult<Prisma.$IntelWatchlistEntryPayload, S>

  type IntelWatchlistEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IntelWatchlistEntryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IntelWatchlistEntryCountAggregateInputType | true
    }

  export interface IntelWatchlistEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntelWatchlistEntry'], meta: { name: 'IntelWatchlistEntry' } }
    /**
     * Find zero or one IntelWatchlistEntry that matches the filter.
     * @param {IntelWatchlistEntryFindUniqueArgs} args - Arguments to find a IntelWatchlistEntry
     * @example
     * // Get one IntelWatchlistEntry
     * const intelWatchlistEntry = await prisma.intelWatchlistEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntelWatchlistEntryFindUniqueArgs>(args: SelectSubset<T, IntelWatchlistEntryFindUniqueArgs<ExtArgs>>): Prisma__IntelWatchlistEntryClient<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one IntelWatchlistEntry that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IntelWatchlistEntryFindUniqueOrThrowArgs} args - Arguments to find a IntelWatchlistEntry
     * @example
     * // Get one IntelWatchlistEntry
     * const intelWatchlistEntry = await prisma.intelWatchlistEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntelWatchlistEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, IntelWatchlistEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntelWatchlistEntryClient<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first IntelWatchlistEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelWatchlistEntryFindFirstArgs} args - Arguments to find a IntelWatchlistEntry
     * @example
     * // Get one IntelWatchlistEntry
     * const intelWatchlistEntry = await prisma.intelWatchlistEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntelWatchlistEntryFindFirstArgs>(args?: SelectSubset<T, IntelWatchlistEntryFindFirstArgs<ExtArgs>>): Prisma__IntelWatchlistEntryClient<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first IntelWatchlistEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelWatchlistEntryFindFirstOrThrowArgs} args - Arguments to find a IntelWatchlistEntry
     * @example
     * // Get one IntelWatchlistEntry
     * const intelWatchlistEntry = await prisma.intelWatchlistEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntelWatchlistEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, IntelWatchlistEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntelWatchlistEntryClient<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more IntelWatchlistEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelWatchlistEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntelWatchlistEntries
     * const intelWatchlistEntries = await prisma.intelWatchlistEntry.findMany()
     * 
     * // Get first 10 IntelWatchlistEntries
     * const intelWatchlistEntries = await prisma.intelWatchlistEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const intelWatchlistEntryWithIdOnly = await prisma.intelWatchlistEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntelWatchlistEntryFindManyArgs>(args?: SelectSubset<T, IntelWatchlistEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a IntelWatchlistEntry.
     * @param {IntelWatchlistEntryCreateArgs} args - Arguments to create a IntelWatchlistEntry.
     * @example
     * // Create one IntelWatchlistEntry
     * const IntelWatchlistEntry = await prisma.intelWatchlistEntry.create({
     *   data: {
     *     // ... data to create a IntelWatchlistEntry
     *   }
     * })
     * 
     */
    create<T extends IntelWatchlistEntryCreateArgs>(args: SelectSubset<T, IntelWatchlistEntryCreateArgs<ExtArgs>>): Prisma__IntelWatchlistEntryClient<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many IntelWatchlistEntries.
     * @param {IntelWatchlistEntryCreateManyArgs} args - Arguments to create many IntelWatchlistEntries.
     * @example
     * // Create many IntelWatchlistEntries
     * const intelWatchlistEntry = await prisma.intelWatchlistEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntelWatchlistEntryCreateManyArgs>(args?: SelectSubset<T, IntelWatchlistEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntelWatchlistEntries and returns the data saved in the database.
     * @param {IntelWatchlistEntryCreateManyAndReturnArgs} args - Arguments to create many IntelWatchlistEntries.
     * @example
     * // Create many IntelWatchlistEntries
     * const intelWatchlistEntry = await prisma.intelWatchlistEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntelWatchlistEntries and only return the `id`
     * const intelWatchlistEntryWithIdOnly = await prisma.intelWatchlistEntry.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntelWatchlistEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, IntelWatchlistEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a IntelWatchlistEntry.
     * @param {IntelWatchlistEntryDeleteArgs} args - Arguments to delete one IntelWatchlistEntry.
     * @example
     * // Delete one IntelWatchlistEntry
     * const IntelWatchlistEntry = await prisma.intelWatchlistEntry.delete({
     *   where: {
     *     // ... filter to delete one IntelWatchlistEntry
     *   }
     * })
     * 
     */
    delete<T extends IntelWatchlistEntryDeleteArgs>(args: SelectSubset<T, IntelWatchlistEntryDeleteArgs<ExtArgs>>): Prisma__IntelWatchlistEntryClient<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one IntelWatchlistEntry.
     * @param {IntelWatchlistEntryUpdateArgs} args - Arguments to update one IntelWatchlistEntry.
     * @example
     * // Update one IntelWatchlistEntry
     * const intelWatchlistEntry = await prisma.intelWatchlistEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntelWatchlistEntryUpdateArgs>(args: SelectSubset<T, IntelWatchlistEntryUpdateArgs<ExtArgs>>): Prisma__IntelWatchlistEntryClient<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more IntelWatchlistEntries.
     * @param {IntelWatchlistEntryDeleteManyArgs} args - Arguments to filter IntelWatchlistEntries to delete.
     * @example
     * // Delete a few IntelWatchlistEntries
     * const { count } = await prisma.intelWatchlistEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntelWatchlistEntryDeleteManyArgs>(args?: SelectSubset<T, IntelWatchlistEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntelWatchlistEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelWatchlistEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntelWatchlistEntries
     * const intelWatchlistEntry = await prisma.intelWatchlistEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntelWatchlistEntryUpdateManyArgs>(args: SelectSubset<T, IntelWatchlistEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one IntelWatchlistEntry.
     * @param {IntelWatchlistEntryUpsertArgs} args - Arguments to update or create a IntelWatchlistEntry.
     * @example
     * // Update or create a IntelWatchlistEntry
     * const intelWatchlistEntry = await prisma.intelWatchlistEntry.upsert({
     *   create: {
     *     // ... data to create a IntelWatchlistEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntelWatchlistEntry we want to update
     *   }
     * })
     */
    upsert<T extends IntelWatchlistEntryUpsertArgs>(args: SelectSubset<T, IntelWatchlistEntryUpsertArgs<ExtArgs>>): Prisma__IntelWatchlistEntryClient<$Result.GetResult<Prisma.$IntelWatchlistEntryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of IntelWatchlistEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelWatchlistEntryCountArgs} args - Arguments to filter IntelWatchlistEntries to count.
     * @example
     * // Count the number of IntelWatchlistEntries
     * const count = await prisma.intelWatchlistEntry.count({
     *   where: {
     *     // ... the filter for the IntelWatchlistEntries we want to count
     *   }
     * })
    **/
    count<T extends IntelWatchlistEntryCountArgs>(
      args?: Subset<T, IntelWatchlistEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntelWatchlistEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntelWatchlistEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelWatchlistEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IntelWatchlistEntryAggregateArgs>(args: Subset<T, IntelWatchlistEntryAggregateArgs>): Prisma.PrismaPromise<GetIntelWatchlistEntryAggregateType<T>>

    /**
     * Group by IntelWatchlistEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelWatchlistEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IntelWatchlistEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntelWatchlistEntryGroupByArgs['orderBy'] }
        : { orderBy?: IntelWatchlistEntryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IntelWatchlistEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntelWatchlistEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntelWatchlistEntry model
   */
  readonly fields: IntelWatchlistEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntelWatchlistEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntelWatchlistEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IntelWatchlistEntry model
   */ 
  interface IntelWatchlistEntryFieldRefs {
    readonly id: FieldRef<"IntelWatchlistEntry", 'String'>
    readonly personId: FieldRef<"IntelWatchlistEntry", 'String'>
    readonly type: FieldRef<"IntelWatchlistEntry", 'String'>
    readonly reason: FieldRef<"IntelWatchlistEntry", 'String'>
    readonly addedBy: FieldRef<"IntelWatchlistEntry", 'String'>
    readonly expiresAt: FieldRef<"IntelWatchlistEntry", 'DateTime'>
    readonly isActive: FieldRef<"IntelWatchlistEntry", 'Boolean'>
    readonly createdAt: FieldRef<"IntelWatchlistEntry", 'DateTime'>
    readonly updatedAt: FieldRef<"IntelWatchlistEntry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IntelWatchlistEntry findUnique
   */
  export type IntelWatchlistEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
    /**
     * Filter, which IntelWatchlistEntry to fetch.
     */
    where: IntelWatchlistEntryWhereUniqueInput
  }

  /**
   * IntelWatchlistEntry findUniqueOrThrow
   */
  export type IntelWatchlistEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
    /**
     * Filter, which IntelWatchlistEntry to fetch.
     */
    where: IntelWatchlistEntryWhereUniqueInput
  }

  /**
   * IntelWatchlistEntry findFirst
   */
  export type IntelWatchlistEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
    /**
     * Filter, which IntelWatchlistEntry to fetch.
     */
    where?: IntelWatchlistEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelWatchlistEntries to fetch.
     */
    orderBy?: IntelWatchlistEntryOrderByWithRelationInput | IntelWatchlistEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelWatchlistEntries.
     */
    cursor?: IntelWatchlistEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelWatchlistEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelWatchlistEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelWatchlistEntries.
     */
    distinct?: IntelWatchlistEntryScalarFieldEnum | IntelWatchlistEntryScalarFieldEnum[]
  }

  /**
   * IntelWatchlistEntry findFirstOrThrow
   */
  export type IntelWatchlistEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
    /**
     * Filter, which IntelWatchlistEntry to fetch.
     */
    where?: IntelWatchlistEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelWatchlistEntries to fetch.
     */
    orderBy?: IntelWatchlistEntryOrderByWithRelationInput | IntelWatchlistEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelWatchlistEntries.
     */
    cursor?: IntelWatchlistEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelWatchlistEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelWatchlistEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelWatchlistEntries.
     */
    distinct?: IntelWatchlistEntryScalarFieldEnum | IntelWatchlistEntryScalarFieldEnum[]
  }

  /**
   * IntelWatchlistEntry findMany
   */
  export type IntelWatchlistEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
    /**
     * Filter, which IntelWatchlistEntries to fetch.
     */
    where?: IntelWatchlistEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelWatchlistEntries to fetch.
     */
    orderBy?: IntelWatchlistEntryOrderByWithRelationInput | IntelWatchlistEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntelWatchlistEntries.
     */
    cursor?: IntelWatchlistEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelWatchlistEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelWatchlistEntries.
     */
    skip?: number
    distinct?: IntelWatchlistEntryScalarFieldEnum | IntelWatchlistEntryScalarFieldEnum[]
  }

  /**
   * IntelWatchlistEntry create
   */
  export type IntelWatchlistEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
    /**
     * The data needed to create a IntelWatchlistEntry.
     */
    data: XOR<IntelWatchlistEntryCreateInput, IntelWatchlistEntryUncheckedCreateInput>
  }

  /**
   * IntelWatchlistEntry createMany
   */
  export type IntelWatchlistEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntelWatchlistEntries.
     */
    data: IntelWatchlistEntryCreateManyInput | IntelWatchlistEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelWatchlistEntry createManyAndReturn
   */
  export type IntelWatchlistEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many IntelWatchlistEntries.
     */
    data: IntelWatchlistEntryCreateManyInput | IntelWatchlistEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelWatchlistEntry update
   */
  export type IntelWatchlistEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
    /**
     * The data needed to update a IntelWatchlistEntry.
     */
    data: XOR<IntelWatchlistEntryUpdateInput, IntelWatchlistEntryUncheckedUpdateInput>
    /**
     * Choose, which IntelWatchlistEntry to update.
     */
    where: IntelWatchlistEntryWhereUniqueInput
  }

  /**
   * IntelWatchlistEntry updateMany
   */
  export type IntelWatchlistEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntelWatchlistEntries.
     */
    data: XOR<IntelWatchlistEntryUpdateManyMutationInput, IntelWatchlistEntryUncheckedUpdateManyInput>
    /**
     * Filter which IntelWatchlistEntries to update
     */
    where?: IntelWatchlistEntryWhereInput
  }

  /**
   * IntelWatchlistEntry upsert
   */
  export type IntelWatchlistEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
    /**
     * The filter to search for the IntelWatchlistEntry to update in case it exists.
     */
    where: IntelWatchlistEntryWhereUniqueInput
    /**
     * In case the IntelWatchlistEntry found by the `where` argument doesn't exist, create a new IntelWatchlistEntry with this data.
     */
    create: XOR<IntelWatchlistEntryCreateInput, IntelWatchlistEntryUncheckedCreateInput>
    /**
     * In case the IntelWatchlistEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntelWatchlistEntryUpdateInput, IntelWatchlistEntryUncheckedUpdateInput>
  }

  /**
   * IntelWatchlistEntry delete
   */
  export type IntelWatchlistEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
    /**
     * Filter which IntelWatchlistEntry to delete.
     */
    where: IntelWatchlistEntryWhereUniqueInput
  }

  /**
   * IntelWatchlistEntry deleteMany
   */
  export type IntelWatchlistEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelWatchlistEntries to delete
     */
    where?: IntelWatchlistEntryWhereInput
  }

  /**
   * IntelWatchlistEntry without action
   */
  export type IntelWatchlistEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelWatchlistEntry
     */
    select?: IntelWatchlistEntrySelect<ExtArgs> | null
  }


  /**
   * Model IntelLinkageEvent
   */

  export type AggregateIntelLinkageEvent = {
    _count: IntelLinkageEventCountAggregateOutputType | null
    _avg: IntelLinkageEventAvgAggregateOutputType | null
    _sum: IntelLinkageEventSumAggregateOutputType | null
    _min: IntelLinkageEventMinAggregateOutputType | null
    _max: IntelLinkageEventMaxAggregateOutputType | null
  }

  export type IntelLinkageEventAvgAggregateOutputType = {
    confidenceScore: number | null
  }

  export type IntelLinkageEventSumAggregateOutputType = {
    confidenceScore: number | null
  }

  export type IntelLinkageEventMinAggregateOutputType = {
    id: string | null
    personId: string | null
    eventType: string | null
    confidenceScore: number | null
    actor: string | null
    reason: string | null
    occurredAt: Date | null
  }

  export type IntelLinkageEventMaxAggregateOutputType = {
    id: string | null
    personId: string | null
    eventType: string | null
    confidenceScore: number | null
    actor: string | null
    reason: string | null
    occurredAt: Date | null
  }

  export type IntelLinkageEventCountAggregateOutputType = {
    id: number
    personId: number
    eventType: number
    confidenceScore: number
    actor: number
    reason: number
    metadata: number
    occurredAt: number
    _all: number
  }


  export type IntelLinkageEventAvgAggregateInputType = {
    confidenceScore?: true
  }

  export type IntelLinkageEventSumAggregateInputType = {
    confidenceScore?: true
  }

  export type IntelLinkageEventMinAggregateInputType = {
    id?: true
    personId?: true
    eventType?: true
    confidenceScore?: true
    actor?: true
    reason?: true
    occurredAt?: true
  }

  export type IntelLinkageEventMaxAggregateInputType = {
    id?: true
    personId?: true
    eventType?: true
    confidenceScore?: true
    actor?: true
    reason?: true
    occurredAt?: true
  }

  export type IntelLinkageEventCountAggregateInputType = {
    id?: true
    personId?: true
    eventType?: true
    confidenceScore?: true
    actor?: true
    reason?: true
    metadata?: true
    occurredAt?: true
    _all?: true
  }

  export type IntelLinkageEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelLinkageEvent to aggregate.
     */
    where?: IntelLinkageEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelLinkageEvents to fetch.
     */
    orderBy?: IntelLinkageEventOrderByWithRelationInput | IntelLinkageEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntelLinkageEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelLinkageEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelLinkageEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntelLinkageEvents
    **/
    _count?: true | IntelLinkageEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IntelLinkageEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IntelLinkageEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntelLinkageEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntelLinkageEventMaxAggregateInputType
  }

  export type GetIntelLinkageEventAggregateType<T extends IntelLinkageEventAggregateArgs> = {
        [P in keyof T & keyof AggregateIntelLinkageEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntelLinkageEvent[P]>
      : GetScalarType<T[P], AggregateIntelLinkageEvent[P]>
  }




  export type IntelLinkageEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntelLinkageEventWhereInput
    orderBy?: IntelLinkageEventOrderByWithAggregationInput | IntelLinkageEventOrderByWithAggregationInput[]
    by: IntelLinkageEventScalarFieldEnum[] | IntelLinkageEventScalarFieldEnum
    having?: IntelLinkageEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntelLinkageEventCountAggregateInputType | true
    _avg?: IntelLinkageEventAvgAggregateInputType
    _sum?: IntelLinkageEventSumAggregateInputType
    _min?: IntelLinkageEventMinAggregateInputType
    _max?: IntelLinkageEventMaxAggregateInputType
  }

  export type IntelLinkageEventGroupByOutputType = {
    id: string
    personId: string
    eventType: string
    confidenceScore: number | null
    actor: string
    reason: string | null
    metadata: JsonValue | null
    occurredAt: Date
    _count: IntelLinkageEventCountAggregateOutputType | null
    _avg: IntelLinkageEventAvgAggregateOutputType | null
    _sum: IntelLinkageEventSumAggregateOutputType | null
    _min: IntelLinkageEventMinAggregateOutputType | null
    _max: IntelLinkageEventMaxAggregateOutputType | null
  }

  type GetIntelLinkageEventGroupByPayload<T extends IntelLinkageEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntelLinkageEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntelLinkageEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntelLinkageEventGroupByOutputType[P]>
            : GetScalarType<T[P], IntelLinkageEventGroupByOutputType[P]>
        }
      >
    >


  export type IntelLinkageEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    eventType?: boolean
    confidenceScore?: boolean
    actor?: boolean
    reason?: boolean
    metadata?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["intelLinkageEvent"]>

  export type IntelLinkageEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personId?: boolean
    eventType?: boolean
    confidenceScore?: boolean
    actor?: boolean
    reason?: boolean
    metadata?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["intelLinkageEvent"]>

  export type IntelLinkageEventSelectScalar = {
    id?: boolean
    personId?: boolean
    eventType?: boolean
    confidenceScore?: boolean
    actor?: boolean
    reason?: boolean
    metadata?: boolean
    occurredAt?: boolean
  }


  export type $IntelLinkageEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntelLinkageEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      personId: string
      eventType: string
      confidenceScore: number | null
      actor: string
      reason: string | null
      metadata: Prisma.JsonValue | null
      occurredAt: Date
    }, ExtArgs["result"]["intelLinkageEvent"]>
    composites: {}
  }

  type IntelLinkageEventGetPayload<S extends boolean | null | undefined | IntelLinkageEventDefaultArgs> = $Result.GetResult<Prisma.$IntelLinkageEventPayload, S>

  type IntelLinkageEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IntelLinkageEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IntelLinkageEventCountAggregateInputType | true
    }

  export interface IntelLinkageEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntelLinkageEvent'], meta: { name: 'IntelLinkageEvent' } }
    /**
     * Find zero or one IntelLinkageEvent that matches the filter.
     * @param {IntelLinkageEventFindUniqueArgs} args - Arguments to find a IntelLinkageEvent
     * @example
     * // Get one IntelLinkageEvent
     * const intelLinkageEvent = await prisma.intelLinkageEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntelLinkageEventFindUniqueArgs>(args: SelectSubset<T, IntelLinkageEventFindUniqueArgs<ExtArgs>>): Prisma__IntelLinkageEventClient<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one IntelLinkageEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IntelLinkageEventFindUniqueOrThrowArgs} args - Arguments to find a IntelLinkageEvent
     * @example
     * // Get one IntelLinkageEvent
     * const intelLinkageEvent = await prisma.intelLinkageEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntelLinkageEventFindUniqueOrThrowArgs>(args: SelectSubset<T, IntelLinkageEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntelLinkageEventClient<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first IntelLinkageEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelLinkageEventFindFirstArgs} args - Arguments to find a IntelLinkageEvent
     * @example
     * // Get one IntelLinkageEvent
     * const intelLinkageEvent = await prisma.intelLinkageEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntelLinkageEventFindFirstArgs>(args?: SelectSubset<T, IntelLinkageEventFindFirstArgs<ExtArgs>>): Prisma__IntelLinkageEventClient<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first IntelLinkageEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelLinkageEventFindFirstOrThrowArgs} args - Arguments to find a IntelLinkageEvent
     * @example
     * // Get one IntelLinkageEvent
     * const intelLinkageEvent = await prisma.intelLinkageEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntelLinkageEventFindFirstOrThrowArgs>(args?: SelectSubset<T, IntelLinkageEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntelLinkageEventClient<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more IntelLinkageEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelLinkageEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntelLinkageEvents
     * const intelLinkageEvents = await prisma.intelLinkageEvent.findMany()
     * 
     * // Get first 10 IntelLinkageEvents
     * const intelLinkageEvents = await prisma.intelLinkageEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const intelLinkageEventWithIdOnly = await prisma.intelLinkageEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntelLinkageEventFindManyArgs>(args?: SelectSubset<T, IntelLinkageEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a IntelLinkageEvent.
     * @param {IntelLinkageEventCreateArgs} args - Arguments to create a IntelLinkageEvent.
     * @example
     * // Create one IntelLinkageEvent
     * const IntelLinkageEvent = await prisma.intelLinkageEvent.create({
     *   data: {
     *     // ... data to create a IntelLinkageEvent
     *   }
     * })
     * 
     */
    create<T extends IntelLinkageEventCreateArgs>(args: SelectSubset<T, IntelLinkageEventCreateArgs<ExtArgs>>): Prisma__IntelLinkageEventClient<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many IntelLinkageEvents.
     * @param {IntelLinkageEventCreateManyArgs} args - Arguments to create many IntelLinkageEvents.
     * @example
     * // Create many IntelLinkageEvents
     * const intelLinkageEvent = await prisma.intelLinkageEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntelLinkageEventCreateManyArgs>(args?: SelectSubset<T, IntelLinkageEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntelLinkageEvents and returns the data saved in the database.
     * @param {IntelLinkageEventCreateManyAndReturnArgs} args - Arguments to create many IntelLinkageEvents.
     * @example
     * // Create many IntelLinkageEvents
     * const intelLinkageEvent = await prisma.intelLinkageEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntelLinkageEvents and only return the `id`
     * const intelLinkageEventWithIdOnly = await prisma.intelLinkageEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntelLinkageEventCreateManyAndReturnArgs>(args?: SelectSubset<T, IntelLinkageEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a IntelLinkageEvent.
     * @param {IntelLinkageEventDeleteArgs} args - Arguments to delete one IntelLinkageEvent.
     * @example
     * // Delete one IntelLinkageEvent
     * const IntelLinkageEvent = await prisma.intelLinkageEvent.delete({
     *   where: {
     *     // ... filter to delete one IntelLinkageEvent
     *   }
     * })
     * 
     */
    delete<T extends IntelLinkageEventDeleteArgs>(args: SelectSubset<T, IntelLinkageEventDeleteArgs<ExtArgs>>): Prisma__IntelLinkageEventClient<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one IntelLinkageEvent.
     * @param {IntelLinkageEventUpdateArgs} args - Arguments to update one IntelLinkageEvent.
     * @example
     * // Update one IntelLinkageEvent
     * const intelLinkageEvent = await prisma.intelLinkageEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntelLinkageEventUpdateArgs>(args: SelectSubset<T, IntelLinkageEventUpdateArgs<ExtArgs>>): Prisma__IntelLinkageEventClient<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more IntelLinkageEvents.
     * @param {IntelLinkageEventDeleteManyArgs} args - Arguments to filter IntelLinkageEvents to delete.
     * @example
     * // Delete a few IntelLinkageEvents
     * const { count } = await prisma.intelLinkageEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntelLinkageEventDeleteManyArgs>(args?: SelectSubset<T, IntelLinkageEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntelLinkageEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelLinkageEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntelLinkageEvents
     * const intelLinkageEvent = await prisma.intelLinkageEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntelLinkageEventUpdateManyArgs>(args: SelectSubset<T, IntelLinkageEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one IntelLinkageEvent.
     * @param {IntelLinkageEventUpsertArgs} args - Arguments to update or create a IntelLinkageEvent.
     * @example
     * // Update or create a IntelLinkageEvent
     * const intelLinkageEvent = await prisma.intelLinkageEvent.upsert({
     *   create: {
     *     // ... data to create a IntelLinkageEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntelLinkageEvent we want to update
     *   }
     * })
     */
    upsert<T extends IntelLinkageEventUpsertArgs>(args: SelectSubset<T, IntelLinkageEventUpsertArgs<ExtArgs>>): Prisma__IntelLinkageEventClient<$Result.GetResult<Prisma.$IntelLinkageEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of IntelLinkageEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelLinkageEventCountArgs} args - Arguments to filter IntelLinkageEvents to count.
     * @example
     * // Count the number of IntelLinkageEvents
     * const count = await prisma.intelLinkageEvent.count({
     *   where: {
     *     // ... the filter for the IntelLinkageEvents we want to count
     *   }
     * })
    **/
    count<T extends IntelLinkageEventCountArgs>(
      args?: Subset<T, IntelLinkageEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntelLinkageEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntelLinkageEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelLinkageEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IntelLinkageEventAggregateArgs>(args: Subset<T, IntelLinkageEventAggregateArgs>): Prisma.PrismaPromise<GetIntelLinkageEventAggregateType<T>>

    /**
     * Group by IntelLinkageEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntelLinkageEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IntelLinkageEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntelLinkageEventGroupByArgs['orderBy'] }
        : { orderBy?: IntelLinkageEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IntelLinkageEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntelLinkageEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntelLinkageEvent model
   */
  readonly fields: IntelLinkageEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntelLinkageEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntelLinkageEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IntelLinkageEvent model
   */ 
  interface IntelLinkageEventFieldRefs {
    readonly id: FieldRef<"IntelLinkageEvent", 'String'>
    readonly personId: FieldRef<"IntelLinkageEvent", 'String'>
    readonly eventType: FieldRef<"IntelLinkageEvent", 'String'>
    readonly confidenceScore: FieldRef<"IntelLinkageEvent", 'Float'>
    readonly actor: FieldRef<"IntelLinkageEvent", 'String'>
    readonly reason: FieldRef<"IntelLinkageEvent", 'String'>
    readonly metadata: FieldRef<"IntelLinkageEvent", 'Json'>
    readonly occurredAt: FieldRef<"IntelLinkageEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IntelLinkageEvent findUnique
   */
  export type IntelLinkageEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
    /**
     * Filter, which IntelLinkageEvent to fetch.
     */
    where: IntelLinkageEventWhereUniqueInput
  }

  /**
   * IntelLinkageEvent findUniqueOrThrow
   */
  export type IntelLinkageEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
    /**
     * Filter, which IntelLinkageEvent to fetch.
     */
    where: IntelLinkageEventWhereUniqueInput
  }

  /**
   * IntelLinkageEvent findFirst
   */
  export type IntelLinkageEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
    /**
     * Filter, which IntelLinkageEvent to fetch.
     */
    where?: IntelLinkageEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelLinkageEvents to fetch.
     */
    orderBy?: IntelLinkageEventOrderByWithRelationInput | IntelLinkageEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelLinkageEvents.
     */
    cursor?: IntelLinkageEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelLinkageEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelLinkageEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelLinkageEvents.
     */
    distinct?: IntelLinkageEventScalarFieldEnum | IntelLinkageEventScalarFieldEnum[]
  }

  /**
   * IntelLinkageEvent findFirstOrThrow
   */
  export type IntelLinkageEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
    /**
     * Filter, which IntelLinkageEvent to fetch.
     */
    where?: IntelLinkageEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelLinkageEvents to fetch.
     */
    orderBy?: IntelLinkageEventOrderByWithRelationInput | IntelLinkageEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntelLinkageEvents.
     */
    cursor?: IntelLinkageEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelLinkageEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelLinkageEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntelLinkageEvents.
     */
    distinct?: IntelLinkageEventScalarFieldEnum | IntelLinkageEventScalarFieldEnum[]
  }

  /**
   * IntelLinkageEvent findMany
   */
  export type IntelLinkageEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
    /**
     * Filter, which IntelLinkageEvents to fetch.
     */
    where?: IntelLinkageEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntelLinkageEvents to fetch.
     */
    orderBy?: IntelLinkageEventOrderByWithRelationInput | IntelLinkageEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntelLinkageEvents.
     */
    cursor?: IntelLinkageEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntelLinkageEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntelLinkageEvents.
     */
    skip?: number
    distinct?: IntelLinkageEventScalarFieldEnum | IntelLinkageEventScalarFieldEnum[]
  }

  /**
   * IntelLinkageEvent create
   */
  export type IntelLinkageEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
    /**
     * The data needed to create a IntelLinkageEvent.
     */
    data: XOR<IntelLinkageEventCreateInput, IntelLinkageEventUncheckedCreateInput>
  }

  /**
   * IntelLinkageEvent createMany
   */
  export type IntelLinkageEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntelLinkageEvents.
     */
    data: IntelLinkageEventCreateManyInput | IntelLinkageEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelLinkageEvent createManyAndReturn
   */
  export type IntelLinkageEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many IntelLinkageEvents.
     */
    data: IntelLinkageEventCreateManyInput | IntelLinkageEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntelLinkageEvent update
   */
  export type IntelLinkageEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
    /**
     * The data needed to update a IntelLinkageEvent.
     */
    data: XOR<IntelLinkageEventUpdateInput, IntelLinkageEventUncheckedUpdateInput>
    /**
     * Choose, which IntelLinkageEvent to update.
     */
    where: IntelLinkageEventWhereUniqueInput
  }

  /**
   * IntelLinkageEvent updateMany
   */
  export type IntelLinkageEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntelLinkageEvents.
     */
    data: XOR<IntelLinkageEventUpdateManyMutationInput, IntelLinkageEventUncheckedUpdateManyInput>
    /**
     * Filter which IntelLinkageEvents to update
     */
    where?: IntelLinkageEventWhereInput
  }

  /**
   * IntelLinkageEvent upsert
   */
  export type IntelLinkageEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
    /**
     * The filter to search for the IntelLinkageEvent to update in case it exists.
     */
    where: IntelLinkageEventWhereUniqueInput
    /**
     * In case the IntelLinkageEvent found by the `where` argument doesn't exist, create a new IntelLinkageEvent with this data.
     */
    create: XOR<IntelLinkageEventCreateInput, IntelLinkageEventUncheckedCreateInput>
    /**
     * In case the IntelLinkageEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntelLinkageEventUpdateInput, IntelLinkageEventUncheckedUpdateInput>
  }

  /**
   * IntelLinkageEvent delete
   */
  export type IntelLinkageEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
    /**
     * Filter which IntelLinkageEvent to delete.
     */
    where: IntelLinkageEventWhereUniqueInput
  }

  /**
   * IntelLinkageEvent deleteMany
   */
  export type IntelLinkageEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntelLinkageEvents to delete
     */
    where?: IntelLinkageEventWhereInput
  }

  /**
   * IntelLinkageEvent without action
   */
  export type IntelLinkageEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntelLinkageEvent
     */
    select?: IntelLinkageEventSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const IntelPersonScalarFieldEnum: {
    id: 'id',
    globalRiskScore: 'globalRiskScore',
    isWatchlisted: 'isWatchlisted',
    hasDuplicateFlag: 'hasDuplicateFlag',
    fraudSignalCount: 'fraudSignalCount',
    verificationConfidence: 'verificationConfidence',
    fullName: 'fullName',
    dateOfBirth: 'dateOfBirth',
    address: 'address',
    gender: 'gender',
    photoUrl: 'photoUrl',
    verificationStatus: 'verificationStatus',
    verificationProvider: 'verificationProvider',
    verificationCountryCode: 'verificationCountryCode',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type IntelPersonScalarFieldEnum = (typeof IntelPersonScalarFieldEnum)[keyof typeof IntelPersonScalarFieldEnum]


  export const IntelPersonIdentifierScalarFieldEnum: {
    id: 'id',
    personId: 'personId',
    type: 'type',
    value: 'value',
    countryCode: 'countryCode',
    isVerified: 'isVerified',
    createdAt: 'createdAt'
  };

  export type IntelPersonIdentifierScalarFieldEnum = (typeof IntelPersonIdentifierScalarFieldEnum)[keyof typeof IntelPersonIdentifierScalarFieldEnum]


  export const IntelBiometricProfileScalarFieldEnum: {
    id: 'id',
    personId: 'personId',
    modality: 'modality',
    embeddingCiphertext: 'embeddingCiphertext',
    qualityScore: 'qualityScore',
    isActive: 'isActive',
    enrolledAt: 'enrolledAt'
  };

  export type IntelBiometricProfileScalarFieldEnum = (typeof IntelBiometricProfileScalarFieldEnum)[keyof typeof IntelBiometricProfileScalarFieldEnum]


  export const IntelRiskSignalScalarFieldEnum: {
    id: 'id',
    personId: 'personId',
    type: 'type',
    severity: 'severity',
    source: 'source',
    isActive: 'isActive',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type IntelRiskSignalScalarFieldEnum = (typeof IntelRiskSignalScalarFieldEnum)[keyof typeof IntelRiskSignalScalarFieldEnum]


  export const IntelPersonTenantPresenceScalarFieldEnum: {
    id: 'id',
    personId: 'personId',
    tenantId: 'tenantId',
    roleType: 'roleType',
    createdAt: 'createdAt'
  };

  export type IntelPersonTenantPresenceScalarFieldEnum = (typeof IntelPersonTenantPresenceScalarFieldEnum)[keyof typeof IntelPersonTenantPresenceScalarFieldEnum]


  export const IntelReviewCaseScalarFieldEnum: {
    id: 'id',
    personId: 'personId',
    status: 'status',
    resolution: 'resolution',
    confidenceScore: 'confidenceScore',
    evidence: 'evidence',
    reviewedBy: 'reviewedBy',
    reviewedAt: 'reviewedAt',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type IntelReviewCaseScalarFieldEnum = (typeof IntelReviewCaseScalarFieldEnum)[keyof typeof IntelReviewCaseScalarFieldEnum]


  export const IntelWatchlistEntryScalarFieldEnum: {
    id: 'id',
    personId: 'personId',
    type: 'type',
    reason: 'reason',
    addedBy: 'addedBy',
    expiresAt: 'expiresAt',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type IntelWatchlistEntryScalarFieldEnum = (typeof IntelWatchlistEntryScalarFieldEnum)[keyof typeof IntelWatchlistEntryScalarFieldEnum]


  export const IntelLinkageEventScalarFieldEnum: {
    id: 'id',
    personId: 'personId',
    eventType: 'eventType',
    confidenceScore: 'confidenceScore',
    actor: 'actor',
    reason: 'reason',
    metadata: 'metadata',
    occurredAt: 'occurredAt'
  };

  export type IntelLinkageEventScalarFieldEnum = (typeof IntelLinkageEventScalarFieldEnum)[keyof typeof IntelLinkageEventScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Bytes'
   */
  export type BytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes'>
    


  /**
   * Reference to a field of type 'Bytes[]'
   */
  export type ListBytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    
  /**
   * Deep Input Types
   */


  export type IntelPersonWhereInput = {
    AND?: IntelPersonWhereInput | IntelPersonWhereInput[]
    OR?: IntelPersonWhereInput[]
    NOT?: IntelPersonWhereInput | IntelPersonWhereInput[]
    id?: StringFilter<"IntelPerson"> | string
    globalRiskScore?: IntFilter<"IntelPerson"> | number
    isWatchlisted?: BoolFilter<"IntelPerson"> | boolean
    hasDuplicateFlag?: BoolFilter<"IntelPerson"> | boolean
    fraudSignalCount?: IntFilter<"IntelPerson"> | number
    verificationConfidence?: FloatFilter<"IntelPerson"> | number
    fullName?: StringNullableFilter<"IntelPerson"> | string | null
    dateOfBirth?: StringNullableFilter<"IntelPerson"> | string | null
    address?: StringNullableFilter<"IntelPerson"> | string | null
    gender?: StringNullableFilter<"IntelPerson"> | string | null
    photoUrl?: StringNullableFilter<"IntelPerson"> | string | null
    verificationStatus?: StringNullableFilter<"IntelPerson"> | string | null
    verificationProvider?: StringNullableFilter<"IntelPerson"> | string | null
    verificationCountryCode?: StringNullableFilter<"IntelPerson"> | string | null
    createdAt?: DateTimeFilter<"IntelPerson"> | Date | string
    updatedAt?: DateTimeFilter<"IntelPerson"> | Date | string
    identifiers?: IntelPersonIdentifierListRelationFilter
    biometrics?: IntelBiometricProfileListRelationFilter
    riskSignals?: IntelRiskSignalListRelationFilter
    tenantPresences?: IntelPersonTenantPresenceListRelationFilter
    reviewCases?: IntelReviewCaseListRelationFilter
  }

  export type IntelPersonOrderByWithRelationInput = {
    id?: SortOrder
    globalRiskScore?: SortOrder
    isWatchlisted?: SortOrder
    hasDuplicateFlag?: SortOrder
    fraudSignalCount?: SortOrder
    verificationConfidence?: SortOrder
    fullName?: SortOrderInput | SortOrder
    dateOfBirth?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    photoUrl?: SortOrderInput | SortOrder
    verificationStatus?: SortOrderInput | SortOrder
    verificationProvider?: SortOrderInput | SortOrder
    verificationCountryCode?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifiers?: IntelPersonIdentifierOrderByRelationAggregateInput
    biometrics?: IntelBiometricProfileOrderByRelationAggregateInput
    riskSignals?: IntelRiskSignalOrderByRelationAggregateInput
    tenantPresences?: IntelPersonTenantPresenceOrderByRelationAggregateInput
    reviewCases?: IntelReviewCaseOrderByRelationAggregateInput
  }

  export type IntelPersonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IntelPersonWhereInput | IntelPersonWhereInput[]
    OR?: IntelPersonWhereInput[]
    NOT?: IntelPersonWhereInput | IntelPersonWhereInput[]
    globalRiskScore?: IntFilter<"IntelPerson"> | number
    isWatchlisted?: BoolFilter<"IntelPerson"> | boolean
    hasDuplicateFlag?: BoolFilter<"IntelPerson"> | boolean
    fraudSignalCount?: IntFilter<"IntelPerson"> | number
    verificationConfidence?: FloatFilter<"IntelPerson"> | number
    fullName?: StringNullableFilter<"IntelPerson"> | string | null
    dateOfBirth?: StringNullableFilter<"IntelPerson"> | string | null
    address?: StringNullableFilter<"IntelPerson"> | string | null
    gender?: StringNullableFilter<"IntelPerson"> | string | null
    photoUrl?: StringNullableFilter<"IntelPerson"> | string | null
    verificationStatus?: StringNullableFilter<"IntelPerson"> | string | null
    verificationProvider?: StringNullableFilter<"IntelPerson"> | string | null
    verificationCountryCode?: StringNullableFilter<"IntelPerson"> | string | null
    createdAt?: DateTimeFilter<"IntelPerson"> | Date | string
    updatedAt?: DateTimeFilter<"IntelPerson"> | Date | string
    identifiers?: IntelPersonIdentifierListRelationFilter
    biometrics?: IntelBiometricProfileListRelationFilter
    riskSignals?: IntelRiskSignalListRelationFilter
    tenantPresences?: IntelPersonTenantPresenceListRelationFilter
    reviewCases?: IntelReviewCaseListRelationFilter
  }, "id">

  export type IntelPersonOrderByWithAggregationInput = {
    id?: SortOrder
    globalRiskScore?: SortOrder
    isWatchlisted?: SortOrder
    hasDuplicateFlag?: SortOrder
    fraudSignalCount?: SortOrder
    verificationConfidence?: SortOrder
    fullName?: SortOrderInput | SortOrder
    dateOfBirth?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    photoUrl?: SortOrderInput | SortOrder
    verificationStatus?: SortOrderInput | SortOrder
    verificationProvider?: SortOrderInput | SortOrder
    verificationCountryCode?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: IntelPersonCountOrderByAggregateInput
    _avg?: IntelPersonAvgOrderByAggregateInput
    _max?: IntelPersonMaxOrderByAggregateInput
    _min?: IntelPersonMinOrderByAggregateInput
    _sum?: IntelPersonSumOrderByAggregateInput
  }

  export type IntelPersonScalarWhereWithAggregatesInput = {
    AND?: IntelPersonScalarWhereWithAggregatesInput | IntelPersonScalarWhereWithAggregatesInput[]
    OR?: IntelPersonScalarWhereWithAggregatesInput[]
    NOT?: IntelPersonScalarWhereWithAggregatesInput | IntelPersonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntelPerson"> | string
    globalRiskScore?: IntWithAggregatesFilter<"IntelPerson"> | number
    isWatchlisted?: BoolWithAggregatesFilter<"IntelPerson"> | boolean
    hasDuplicateFlag?: BoolWithAggregatesFilter<"IntelPerson"> | boolean
    fraudSignalCount?: IntWithAggregatesFilter<"IntelPerson"> | number
    verificationConfidence?: FloatWithAggregatesFilter<"IntelPerson"> | number
    fullName?: StringNullableWithAggregatesFilter<"IntelPerson"> | string | null
    dateOfBirth?: StringNullableWithAggregatesFilter<"IntelPerson"> | string | null
    address?: StringNullableWithAggregatesFilter<"IntelPerson"> | string | null
    gender?: StringNullableWithAggregatesFilter<"IntelPerson"> | string | null
    photoUrl?: StringNullableWithAggregatesFilter<"IntelPerson"> | string | null
    verificationStatus?: StringNullableWithAggregatesFilter<"IntelPerson"> | string | null
    verificationProvider?: StringNullableWithAggregatesFilter<"IntelPerson"> | string | null
    verificationCountryCode?: StringNullableWithAggregatesFilter<"IntelPerson"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"IntelPerson"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"IntelPerson"> | Date | string
  }

  export type IntelPersonIdentifierWhereInput = {
    AND?: IntelPersonIdentifierWhereInput | IntelPersonIdentifierWhereInput[]
    OR?: IntelPersonIdentifierWhereInput[]
    NOT?: IntelPersonIdentifierWhereInput | IntelPersonIdentifierWhereInput[]
    id?: StringFilter<"IntelPersonIdentifier"> | string
    personId?: StringFilter<"IntelPersonIdentifier"> | string
    type?: StringFilter<"IntelPersonIdentifier"> | string
    value?: StringFilter<"IntelPersonIdentifier"> | string
    countryCode?: StringNullableFilter<"IntelPersonIdentifier"> | string | null
    isVerified?: BoolFilter<"IntelPersonIdentifier"> | boolean
    createdAt?: DateTimeFilter<"IntelPersonIdentifier"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }

  export type IntelPersonIdentifierOrderByWithRelationInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    countryCode?: SortOrderInput | SortOrder
    isVerified?: SortOrder
    createdAt?: SortOrder
    person?: IntelPersonOrderByWithRelationInput
  }

  export type IntelPersonIdentifierWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    type_value?: IntelPersonIdentifierTypeValueCompoundUniqueInput
    AND?: IntelPersonIdentifierWhereInput | IntelPersonIdentifierWhereInput[]
    OR?: IntelPersonIdentifierWhereInput[]
    NOT?: IntelPersonIdentifierWhereInput | IntelPersonIdentifierWhereInput[]
    personId?: StringFilter<"IntelPersonIdentifier"> | string
    type?: StringFilter<"IntelPersonIdentifier"> | string
    value?: StringFilter<"IntelPersonIdentifier"> | string
    countryCode?: StringNullableFilter<"IntelPersonIdentifier"> | string | null
    isVerified?: BoolFilter<"IntelPersonIdentifier"> | boolean
    createdAt?: DateTimeFilter<"IntelPersonIdentifier"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }, "id" | "type_value">

  export type IntelPersonIdentifierOrderByWithAggregationInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    countryCode?: SortOrderInput | SortOrder
    isVerified?: SortOrder
    createdAt?: SortOrder
    _count?: IntelPersonIdentifierCountOrderByAggregateInput
    _max?: IntelPersonIdentifierMaxOrderByAggregateInput
    _min?: IntelPersonIdentifierMinOrderByAggregateInput
  }

  export type IntelPersonIdentifierScalarWhereWithAggregatesInput = {
    AND?: IntelPersonIdentifierScalarWhereWithAggregatesInput | IntelPersonIdentifierScalarWhereWithAggregatesInput[]
    OR?: IntelPersonIdentifierScalarWhereWithAggregatesInput[]
    NOT?: IntelPersonIdentifierScalarWhereWithAggregatesInput | IntelPersonIdentifierScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntelPersonIdentifier"> | string
    personId?: StringWithAggregatesFilter<"IntelPersonIdentifier"> | string
    type?: StringWithAggregatesFilter<"IntelPersonIdentifier"> | string
    value?: StringWithAggregatesFilter<"IntelPersonIdentifier"> | string
    countryCode?: StringNullableWithAggregatesFilter<"IntelPersonIdentifier"> | string | null
    isVerified?: BoolWithAggregatesFilter<"IntelPersonIdentifier"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"IntelPersonIdentifier"> | Date | string
  }

  export type IntelBiometricProfileWhereInput = {
    AND?: IntelBiometricProfileWhereInput | IntelBiometricProfileWhereInput[]
    OR?: IntelBiometricProfileWhereInput[]
    NOT?: IntelBiometricProfileWhereInput | IntelBiometricProfileWhereInput[]
    id?: StringFilter<"IntelBiometricProfile"> | string
    personId?: StringFilter<"IntelBiometricProfile"> | string
    modality?: StringFilter<"IntelBiometricProfile"> | string
    embeddingCiphertext?: BytesFilter<"IntelBiometricProfile"> | Buffer
    qualityScore?: FloatFilter<"IntelBiometricProfile"> | number
    isActive?: BoolFilter<"IntelBiometricProfile"> | boolean
    enrolledAt?: DateTimeFilter<"IntelBiometricProfile"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }

  export type IntelBiometricProfileOrderByWithRelationInput = {
    id?: SortOrder
    personId?: SortOrder
    modality?: SortOrder
    embeddingCiphertext?: SortOrder
    qualityScore?: SortOrder
    isActive?: SortOrder
    enrolledAt?: SortOrder
    person?: IntelPersonOrderByWithRelationInput
  }

  export type IntelBiometricProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IntelBiometricProfileWhereInput | IntelBiometricProfileWhereInput[]
    OR?: IntelBiometricProfileWhereInput[]
    NOT?: IntelBiometricProfileWhereInput | IntelBiometricProfileWhereInput[]
    personId?: StringFilter<"IntelBiometricProfile"> | string
    modality?: StringFilter<"IntelBiometricProfile"> | string
    embeddingCiphertext?: BytesFilter<"IntelBiometricProfile"> | Buffer
    qualityScore?: FloatFilter<"IntelBiometricProfile"> | number
    isActive?: BoolFilter<"IntelBiometricProfile"> | boolean
    enrolledAt?: DateTimeFilter<"IntelBiometricProfile"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }, "id">

  export type IntelBiometricProfileOrderByWithAggregationInput = {
    id?: SortOrder
    personId?: SortOrder
    modality?: SortOrder
    embeddingCiphertext?: SortOrder
    qualityScore?: SortOrder
    isActive?: SortOrder
    enrolledAt?: SortOrder
    _count?: IntelBiometricProfileCountOrderByAggregateInput
    _avg?: IntelBiometricProfileAvgOrderByAggregateInput
    _max?: IntelBiometricProfileMaxOrderByAggregateInput
    _min?: IntelBiometricProfileMinOrderByAggregateInput
    _sum?: IntelBiometricProfileSumOrderByAggregateInput
  }

  export type IntelBiometricProfileScalarWhereWithAggregatesInput = {
    AND?: IntelBiometricProfileScalarWhereWithAggregatesInput | IntelBiometricProfileScalarWhereWithAggregatesInput[]
    OR?: IntelBiometricProfileScalarWhereWithAggregatesInput[]
    NOT?: IntelBiometricProfileScalarWhereWithAggregatesInput | IntelBiometricProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntelBiometricProfile"> | string
    personId?: StringWithAggregatesFilter<"IntelBiometricProfile"> | string
    modality?: StringWithAggregatesFilter<"IntelBiometricProfile"> | string
    embeddingCiphertext?: BytesWithAggregatesFilter<"IntelBiometricProfile"> | Buffer
    qualityScore?: FloatWithAggregatesFilter<"IntelBiometricProfile"> | number
    isActive?: BoolWithAggregatesFilter<"IntelBiometricProfile"> | boolean
    enrolledAt?: DateTimeWithAggregatesFilter<"IntelBiometricProfile"> | Date | string
  }

  export type IntelRiskSignalWhereInput = {
    AND?: IntelRiskSignalWhereInput | IntelRiskSignalWhereInput[]
    OR?: IntelRiskSignalWhereInput[]
    NOT?: IntelRiskSignalWhereInput | IntelRiskSignalWhereInput[]
    id?: StringFilter<"IntelRiskSignal"> | string
    personId?: StringFilter<"IntelRiskSignal"> | string
    type?: StringFilter<"IntelRiskSignal"> | string
    severity?: StringFilter<"IntelRiskSignal"> | string
    source?: StringFilter<"IntelRiskSignal"> | string
    isActive?: BoolFilter<"IntelRiskSignal"> | boolean
    metadata?: JsonNullableFilter<"IntelRiskSignal">
    createdAt?: DateTimeFilter<"IntelRiskSignal"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }

  export type IntelRiskSignalOrderByWithRelationInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    severity?: SortOrder
    source?: SortOrder
    isActive?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    person?: IntelPersonOrderByWithRelationInput
  }

  export type IntelRiskSignalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IntelRiskSignalWhereInput | IntelRiskSignalWhereInput[]
    OR?: IntelRiskSignalWhereInput[]
    NOT?: IntelRiskSignalWhereInput | IntelRiskSignalWhereInput[]
    personId?: StringFilter<"IntelRiskSignal"> | string
    type?: StringFilter<"IntelRiskSignal"> | string
    severity?: StringFilter<"IntelRiskSignal"> | string
    source?: StringFilter<"IntelRiskSignal"> | string
    isActive?: BoolFilter<"IntelRiskSignal"> | boolean
    metadata?: JsonNullableFilter<"IntelRiskSignal">
    createdAt?: DateTimeFilter<"IntelRiskSignal"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }, "id">

  export type IntelRiskSignalOrderByWithAggregationInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    severity?: SortOrder
    source?: SortOrder
    isActive?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: IntelRiskSignalCountOrderByAggregateInput
    _max?: IntelRiskSignalMaxOrderByAggregateInput
    _min?: IntelRiskSignalMinOrderByAggregateInput
  }

  export type IntelRiskSignalScalarWhereWithAggregatesInput = {
    AND?: IntelRiskSignalScalarWhereWithAggregatesInput | IntelRiskSignalScalarWhereWithAggregatesInput[]
    OR?: IntelRiskSignalScalarWhereWithAggregatesInput[]
    NOT?: IntelRiskSignalScalarWhereWithAggregatesInput | IntelRiskSignalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntelRiskSignal"> | string
    personId?: StringWithAggregatesFilter<"IntelRiskSignal"> | string
    type?: StringWithAggregatesFilter<"IntelRiskSignal"> | string
    severity?: StringWithAggregatesFilter<"IntelRiskSignal"> | string
    source?: StringWithAggregatesFilter<"IntelRiskSignal"> | string
    isActive?: BoolWithAggregatesFilter<"IntelRiskSignal"> | boolean
    metadata?: JsonNullableWithAggregatesFilter<"IntelRiskSignal">
    createdAt?: DateTimeWithAggregatesFilter<"IntelRiskSignal"> | Date | string
  }

  export type IntelPersonTenantPresenceWhereInput = {
    AND?: IntelPersonTenantPresenceWhereInput | IntelPersonTenantPresenceWhereInput[]
    OR?: IntelPersonTenantPresenceWhereInput[]
    NOT?: IntelPersonTenantPresenceWhereInput | IntelPersonTenantPresenceWhereInput[]
    id?: StringFilter<"IntelPersonTenantPresence"> | string
    personId?: StringFilter<"IntelPersonTenantPresence"> | string
    tenantId?: StringFilter<"IntelPersonTenantPresence"> | string
    roleType?: StringFilter<"IntelPersonTenantPresence"> | string
    createdAt?: DateTimeFilter<"IntelPersonTenantPresence"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }

  export type IntelPersonTenantPresenceOrderByWithRelationInput = {
    id?: SortOrder
    personId?: SortOrder
    tenantId?: SortOrder
    roleType?: SortOrder
    createdAt?: SortOrder
    person?: IntelPersonOrderByWithRelationInput
  }

  export type IntelPersonTenantPresenceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    personId_tenantId_roleType?: IntelPersonTenantPresencePersonIdTenantIdRoleTypeCompoundUniqueInput
    AND?: IntelPersonTenantPresenceWhereInput | IntelPersonTenantPresenceWhereInput[]
    OR?: IntelPersonTenantPresenceWhereInput[]
    NOT?: IntelPersonTenantPresenceWhereInput | IntelPersonTenantPresenceWhereInput[]
    personId?: StringFilter<"IntelPersonTenantPresence"> | string
    tenantId?: StringFilter<"IntelPersonTenantPresence"> | string
    roleType?: StringFilter<"IntelPersonTenantPresence"> | string
    createdAt?: DateTimeFilter<"IntelPersonTenantPresence"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }, "id" | "personId_tenantId_roleType">

  export type IntelPersonTenantPresenceOrderByWithAggregationInput = {
    id?: SortOrder
    personId?: SortOrder
    tenantId?: SortOrder
    roleType?: SortOrder
    createdAt?: SortOrder
    _count?: IntelPersonTenantPresenceCountOrderByAggregateInput
    _max?: IntelPersonTenantPresenceMaxOrderByAggregateInput
    _min?: IntelPersonTenantPresenceMinOrderByAggregateInput
  }

  export type IntelPersonTenantPresenceScalarWhereWithAggregatesInput = {
    AND?: IntelPersonTenantPresenceScalarWhereWithAggregatesInput | IntelPersonTenantPresenceScalarWhereWithAggregatesInput[]
    OR?: IntelPersonTenantPresenceScalarWhereWithAggregatesInput[]
    NOT?: IntelPersonTenantPresenceScalarWhereWithAggregatesInput | IntelPersonTenantPresenceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntelPersonTenantPresence"> | string
    personId?: StringWithAggregatesFilter<"IntelPersonTenantPresence"> | string
    tenantId?: StringWithAggregatesFilter<"IntelPersonTenantPresence"> | string
    roleType?: StringWithAggregatesFilter<"IntelPersonTenantPresence"> | string
    createdAt?: DateTimeWithAggregatesFilter<"IntelPersonTenantPresence"> | Date | string
  }

  export type IntelReviewCaseWhereInput = {
    AND?: IntelReviewCaseWhereInput | IntelReviewCaseWhereInput[]
    OR?: IntelReviewCaseWhereInput[]
    NOT?: IntelReviewCaseWhereInput | IntelReviewCaseWhereInput[]
    id?: StringFilter<"IntelReviewCase"> | string
    personId?: StringFilter<"IntelReviewCase"> | string
    status?: StringFilter<"IntelReviewCase"> | string
    resolution?: StringNullableFilter<"IntelReviewCase"> | string | null
    confidenceScore?: FloatFilter<"IntelReviewCase"> | number
    evidence?: JsonFilter<"IntelReviewCase">
    reviewedBy?: StringNullableFilter<"IntelReviewCase"> | string | null
    reviewedAt?: DateTimeNullableFilter<"IntelReviewCase"> | Date | string | null
    notes?: StringNullableFilter<"IntelReviewCase"> | string | null
    createdAt?: DateTimeFilter<"IntelReviewCase"> | Date | string
    updatedAt?: DateTimeFilter<"IntelReviewCase"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }

  export type IntelReviewCaseOrderByWithRelationInput = {
    id?: SortOrder
    personId?: SortOrder
    status?: SortOrder
    resolution?: SortOrderInput | SortOrder
    confidenceScore?: SortOrder
    evidence?: SortOrder
    reviewedBy?: SortOrderInput | SortOrder
    reviewedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    person?: IntelPersonOrderByWithRelationInput
  }

  export type IntelReviewCaseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IntelReviewCaseWhereInput | IntelReviewCaseWhereInput[]
    OR?: IntelReviewCaseWhereInput[]
    NOT?: IntelReviewCaseWhereInput | IntelReviewCaseWhereInput[]
    personId?: StringFilter<"IntelReviewCase"> | string
    status?: StringFilter<"IntelReviewCase"> | string
    resolution?: StringNullableFilter<"IntelReviewCase"> | string | null
    confidenceScore?: FloatFilter<"IntelReviewCase"> | number
    evidence?: JsonFilter<"IntelReviewCase">
    reviewedBy?: StringNullableFilter<"IntelReviewCase"> | string | null
    reviewedAt?: DateTimeNullableFilter<"IntelReviewCase"> | Date | string | null
    notes?: StringNullableFilter<"IntelReviewCase"> | string | null
    createdAt?: DateTimeFilter<"IntelReviewCase"> | Date | string
    updatedAt?: DateTimeFilter<"IntelReviewCase"> | Date | string
    person?: XOR<IntelPersonRelationFilter, IntelPersonWhereInput>
  }, "id">

  export type IntelReviewCaseOrderByWithAggregationInput = {
    id?: SortOrder
    personId?: SortOrder
    status?: SortOrder
    resolution?: SortOrderInput | SortOrder
    confidenceScore?: SortOrder
    evidence?: SortOrder
    reviewedBy?: SortOrderInput | SortOrder
    reviewedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: IntelReviewCaseCountOrderByAggregateInput
    _avg?: IntelReviewCaseAvgOrderByAggregateInput
    _max?: IntelReviewCaseMaxOrderByAggregateInput
    _min?: IntelReviewCaseMinOrderByAggregateInput
    _sum?: IntelReviewCaseSumOrderByAggregateInput
  }

  export type IntelReviewCaseScalarWhereWithAggregatesInput = {
    AND?: IntelReviewCaseScalarWhereWithAggregatesInput | IntelReviewCaseScalarWhereWithAggregatesInput[]
    OR?: IntelReviewCaseScalarWhereWithAggregatesInput[]
    NOT?: IntelReviewCaseScalarWhereWithAggregatesInput | IntelReviewCaseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntelReviewCase"> | string
    personId?: StringWithAggregatesFilter<"IntelReviewCase"> | string
    status?: StringWithAggregatesFilter<"IntelReviewCase"> | string
    resolution?: StringNullableWithAggregatesFilter<"IntelReviewCase"> | string | null
    confidenceScore?: FloatWithAggregatesFilter<"IntelReviewCase"> | number
    evidence?: JsonWithAggregatesFilter<"IntelReviewCase">
    reviewedBy?: StringNullableWithAggregatesFilter<"IntelReviewCase"> | string | null
    reviewedAt?: DateTimeNullableWithAggregatesFilter<"IntelReviewCase"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"IntelReviewCase"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"IntelReviewCase"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"IntelReviewCase"> | Date | string
  }

  export type IntelWatchlistEntryWhereInput = {
    AND?: IntelWatchlistEntryWhereInput | IntelWatchlistEntryWhereInput[]
    OR?: IntelWatchlistEntryWhereInput[]
    NOT?: IntelWatchlistEntryWhereInput | IntelWatchlistEntryWhereInput[]
    id?: StringFilter<"IntelWatchlistEntry"> | string
    personId?: StringFilter<"IntelWatchlistEntry"> | string
    type?: StringFilter<"IntelWatchlistEntry"> | string
    reason?: StringFilter<"IntelWatchlistEntry"> | string
    addedBy?: StringFilter<"IntelWatchlistEntry"> | string
    expiresAt?: DateTimeNullableFilter<"IntelWatchlistEntry"> | Date | string | null
    isActive?: BoolFilter<"IntelWatchlistEntry"> | boolean
    createdAt?: DateTimeFilter<"IntelWatchlistEntry"> | Date | string
    updatedAt?: DateTimeFilter<"IntelWatchlistEntry"> | Date | string
  }

  export type IntelWatchlistEntryOrderByWithRelationInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    reason?: SortOrder
    addedBy?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntelWatchlistEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IntelWatchlistEntryWhereInput | IntelWatchlistEntryWhereInput[]
    OR?: IntelWatchlistEntryWhereInput[]
    NOT?: IntelWatchlistEntryWhereInput | IntelWatchlistEntryWhereInput[]
    personId?: StringFilter<"IntelWatchlistEntry"> | string
    type?: StringFilter<"IntelWatchlistEntry"> | string
    reason?: StringFilter<"IntelWatchlistEntry"> | string
    addedBy?: StringFilter<"IntelWatchlistEntry"> | string
    expiresAt?: DateTimeNullableFilter<"IntelWatchlistEntry"> | Date | string | null
    isActive?: BoolFilter<"IntelWatchlistEntry"> | boolean
    createdAt?: DateTimeFilter<"IntelWatchlistEntry"> | Date | string
    updatedAt?: DateTimeFilter<"IntelWatchlistEntry"> | Date | string
  }, "id">

  export type IntelWatchlistEntryOrderByWithAggregationInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    reason?: SortOrder
    addedBy?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: IntelWatchlistEntryCountOrderByAggregateInput
    _max?: IntelWatchlistEntryMaxOrderByAggregateInput
    _min?: IntelWatchlistEntryMinOrderByAggregateInput
  }

  export type IntelWatchlistEntryScalarWhereWithAggregatesInput = {
    AND?: IntelWatchlistEntryScalarWhereWithAggregatesInput | IntelWatchlistEntryScalarWhereWithAggregatesInput[]
    OR?: IntelWatchlistEntryScalarWhereWithAggregatesInput[]
    NOT?: IntelWatchlistEntryScalarWhereWithAggregatesInput | IntelWatchlistEntryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntelWatchlistEntry"> | string
    personId?: StringWithAggregatesFilter<"IntelWatchlistEntry"> | string
    type?: StringWithAggregatesFilter<"IntelWatchlistEntry"> | string
    reason?: StringWithAggregatesFilter<"IntelWatchlistEntry"> | string
    addedBy?: StringWithAggregatesFilter<"IntelWatchlistEntry"> | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"IntelWatchlistEntry"> | Date | string | null
    isActive?: BoolWithAggregatesFilter<"IntelWatchlistEntry"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"IntelWatchlistEntry"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"IntelWatchlistEntry"> | Date | string
  }

  export type IntelLinkageEventWhereInput = {
    AND?: IntelLinkageEventWhereInput | IntelLinkageEventWhereInput[]
    OR?: IntelLinkageEventWhereInput[]
    NOT?: IntelLinkageEventWhereInput | IntelLinkageEventWhereInput[]
    id?: StringFilter<"IntelLinkageEvent"> | string
    personId?: StringFilter<"IntelLinkageEvent"> | string
    eventType?: StringFilter<"IntelLinkageEvent"> | string
    confidenceScore?: FloatNullableFilter<"IntelLinkageEvent"> | number | null
    actor?: StringFilter<"IntelLinkageEvent"> | string
    reason?: StringNullableFilter<"IntelLinkageEvent"> | string | null
    metadata?: JsonNullableFilter<"IntelLinkageEvent">
    occurredAt?: DateTimeFilter<"IntelLinkageEvent"> | Date | string
  }

  export type IntelLinkageEventOrderByWithRelationInput = {
    id?: SortOrder
    personId?: SortOrder
    eventType?: SortOrder
    confidenceScore?: SortOrderInput | SortOrder
    actor?: SortOrder
    reason?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
  }

  export type IntelLinkageEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IntelLinkageEventWhereInput | IntelLinkageEventWhereInput[]
    OR?: IntelLinkageEventWhereInput[]
    NOT?: IntelLinkageEventWhereInput | IntelLinkageEventWhereInput[]
    personId?: StringFilter<"IntelLinkageEvent"> | string
    eventType?: StringFilter<"IntelLinkageEvent"> | string
    confidenceScore?: FloatNullableFilter<"IntelLinkageEvent"> | number | null
    actor?: StringFilter<"IntelLinkageEvent"> | string
    reason?: StringNullableFilter<"IntelLinkageEvent"> | string | null
    metadata?: JsonNullableFilter<"IntelLinkageEvent">
    occurredAt?: DateTimeFilter<"IntelLinkageEvent"> | Date | string
  }, "id">

  export type IntelLinkageEventOrderByWithAggregationInput = {
    id?: SortOrder
    personId?: SortOrder
    eventType?: SortOrder
    confidenceScore?: SortOrderInput | SortOrder
    actor?: SortOrder
    reason?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    _count?: IntelLinkageEventCountOrderByAggregateInput
    _avg?: IntelLinkageEventAvgOrderByAggregateInput
    _max?: IntelLinkageEventMaxOrderByAggregateInput
    _min?: IntelLinkageEventMinOrderByAggregateInput
    _sum?: IntelLinkageEventSumOrderByAggregateInput
  }

  export type IntelLinkageEventScalarWhereWithAggregatesInput = {
    AND?: IntelLinkageEventScalarWhereWithAggregatesInput | IntelLinkageEventScalarWhereWithAggregatesInput[]
    OR?: IntelLinkageEventScalarWhereWithAggregatesInput[]
    NOT?: IntelLinkageEventScalarWhereWithAggregatesInput | IntelLinkageEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntelLinkageEvent"> | string
    personId?: StringWithAggregatesFilter<"IntelLinkageEvent"> | string
    eventType?: StringWithAggregatesFilter<"IntelLinkageEvent"> | string
    confidenceScore?: FloatNullableWithAggregatesFilter<"IntelLinkageEvent"> | number | null
    actor?: StringWithAggregatesFilter<"IntelLinkageEvent"> | string
    reason?: StringNullableWithAggregatesFilter<"IntelLinkageEvent"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"IntelLinkageEvent">
    occurredAt?: DateTimeWithAggregatesFilter<"IntelLinkageEvent"> | Date | string
  }

  export type IntelPersonCreateInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierCreateNestedManyWithoutPersonInput
    biometrics?: IntelBiometricProfileCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonUncheckedCreateInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierUncheckedCreateNestedManyWithoutPersonInput
    biometrics?: IntelBiometricProfileUncheckedCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalUncheckedCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseUncheckedCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUpdateManyWithoutPersonNestedInput
    biometrics?: IntelBiometricProfileUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUncheckedUpdateManyWithoutPersonNestedInput
    biometrics?: IntelBiometricProfileUncheckedUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUncheckedUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUncheckedUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonCreateManyInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IntelPersonUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonIdentifierCreateInput = {
    id?: string
    type: string
    value: string
    countryCode?: string | null
    isVerified?: boolean
    createdAt?: Date | string
    person: IntelPersonCreateNestedOneWithoutIdentifiersInput
  }

  export type IntelPersonIdentifierUncheckedCreateInput = {
    id?: string
    personId: string
    type: string
    value: string
    countryCode?: string | null
    isVerified?: boolean
    createdAt?: Date | string
  }

  export type IntelPersonIdentifierUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    countryCode?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    person?: IntelPersonUpdateOneRequiredWithoutIdentifiersNestedInput
  }

  export type IntelPersonIdentifierUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    countryCode?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonIdentifierCreateManyInput = {
    id?: string
    personId: string
    type: string
    value: string
    countryCode?: string | null
    isVerified?: boolean
    createdAt?: Date | string
  }

  export type IntelPersonIdentifierUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    countryCode?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonIdentifierUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    countryCode?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelBiometricProfileCreateInput = {
    id?: string
    modality: string
    embeddingCiphertext: Buffer
    qualityScore: number
    isActive?: boolean
    enrolledAt?: Date | string
    person: IntelPersonCreateNestedOneWithoutBiometricsInput
  }

  export type IntelBiometricProfileUncheckedCreateInput = {
    id?: string
    personId: string
    modality: string
    embeddingCiphertext: Buffer
    qualityScore: number
    isActive?: boolean
    enrolledAt?: Date | string
  }

  export type IntelBiometricProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    modality?: StringFieldUpdateOperationsInput | string
    embeddingCiphertext?: BytesFieldUpdateOperationsInput | Buffer
    qualityScore?: FloatFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    enrolledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    person?: IntelPersonUpdateOneRequiredWithoutBiometricsNestedInput
  }

  export type IntelBiometricProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    modality?: StringFieldUpdateOperationsInput | string
    embeddingCiphertext?: BytesFieldUpdateOperationsInput | Buffer
    qualityScore?: FloatFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    enrolledAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelBiometricProfileCreateManyInput = {
    id?: string
    personId: string
    modality: string
    embeddingCiphertext: Buffer
    qualityScore: number
    isActive?: boolean
    enrolledAt?: Date | string
  }

  export type IntelBiometricProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    modality?: StringFieldUpdateOperationsInput | string
    embeddingCiphertext?: BytesFieldUpdateOperationsInput | Buffer
    qualityScore?: FloatFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    enrolledAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelBiometricProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    modality?: StringFieldUpdateOperationsInput | string
    embeddingCiphertext?: BytesFieldUpdateOperationsInput | Buffer
    qualityScore?: FloatFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    enrolledAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelRiskSignalCreateInput = {
    id?: string
    type: string
    severity: string
    source: string
    isActive?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    person: IntelPersonCreateNestedOneWithoutRiskSignalsInput
  }

  export type IntelRiskSignalUncheckedCreateInput = {
    id?: string
    personId: string
    type: string
    severity: string
    source: string
    isActive?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type IntelRiskSignalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    person?: IntelPersonUpdateOneRequiredWithoutRiskSignalsNestedInput
  }

  export type IntelRiskSignalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelRiskSignalCreateManyInput = {
    id?: string
    personId: string
    type: string
    severity: string
    source: string
    isActive?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type IntelRiskSignalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelRiskSignalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonTenantPresenceCreateInput = {
    id?: string
    tenantId: string
    roleType?: string
    createdAt?: Date | string
    person: IntelPersonCreateNestedOneWithoutTenantPresencesInput
  }

  export type IntelPersonTenantPresenceUncheckedCreateInput = {
    id?: string
    personId: string
    tenantId: string
    roleType?: string
    createdAt?: Date | string
  }

  export type IntelPersonTenantPresenceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    person?: IntelPersonUpdateOneRequiredWithoutTenantPresencesNestedInput
  }

  export type IntelPersonTenantPresenceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonTenantPresenceCreateManyInput = {
    id?: string
    personId: string
    tenantId: string
    roleType?: string
    createdAt?: Date | string
  }

  export type IntelPersonTenantPresenceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonTenantPresenceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelReviewCaseCreateInput = {
    id?: string
    status?: string
    resolution?: string | null
    confidenceScore: number
    evidence: JsonNullValueInput | InputJsonValue
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    person: IntelPersonCreateNestedOneWithoutReviewCasesInput
  }

  export type IntelReviewCaseUncheckedCreateInput = {
    id?: string
    personId: string
    status?: string
    resolution?: string | null
    confidenceScore: number
    evidence: JsonNullValueInput | InputJsonValue
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IntelReviewCaseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: FloatFieldUpdateOperationsInput | number
    evidence?: JsonNullValueInput | InputJsonValue
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    person?: IntelPersonUpdateOneRequiredWithoutReviewCasesNestedInput
  }

  export type IntelReviewCaseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: FloatFieldUpdateOperationsInput | number
    evidence?: JsonNullValueInput | InputJsonValue
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelReviewCaseCreateManyInput = {
    id?: string
    personId: string
    status?: string
    resolution?: string | null
    confidenceScore: number
    evidence: JsonNullValueInput | InputJsonValue
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IntelReviewCaseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: FloatFieldUpdateOperationsInput | number
    evidence?: JsonNullValueInput | InputJsonValue
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelReviewCaseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: FloatFieldUpdateOperationsInput | number
    evidence?: JsonNullValueInput | InputJsonValue
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelWatchlistEntryCreateInput = {
    id?: string
    personId: string
    type: string
    reason: string
    addedBy: string
    expiresAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IntelWatchlistEntryUncheckedCreateInput = {
    id?: string
    personId: string
    type: string
    reason: string
    addedBy: string
    expiresAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IntelWatchlistEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    addedBy?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelWatchlistEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    addedBy?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelWatchlistEntryCreateManyInput = {
    id?: string
    personId: string
    type: string
    reason: string
    addedBy: string
    expiresAt?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IntelWatchlistEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    addedBy?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelWatchlistEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    addedBy?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelLinkageEventCreateInput = {
    id?: string
    personId: string
    eventType: string
    confidenceScore?: number | null
    actor: string
    reason?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
  }

  export type IntelLinkageEventUncheckedCreateInput = {
    id?: string
    personId: string
    eventType: string
    confidenceScore?: number | null
    actor: string
    reason?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
  }

  export type IntelLinkageEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    actor?: StringFieldUpdateOperationsInput | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelLinkageEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    actor?: StringFieldUpdateOperationsInput | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelLinkageEventCreateManyInput = {
    id?: string
    personId: string
    eventType: string
    confidenceScore?: number | null
    actor: string
    reason?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
  }

  export type IntelLinkageEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    actor?: StringFieldUpdateOperationsInput | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelLinkageEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    personId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    actor?: StringFieldUpdateOperationsInput | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntelPersonIdentifierListRelationFilter = {
    every?: IntelPersonIdentifierWhereInput
    some?: IntelPersonIdentifierWhereInput
    none?: IntelPersonIdentifierWhereInput
  }

  export type IntelBiometricProfileListRelationFilter = {
    every?: IntelBiometricProfileWhereInput
    some?: IntelBiometricProfileWhereInput
    none?: IntelBiometricProfileWhereInput
  }

  export type IntelRiskSignalListRelationFilter = {
    every?: IntelRiskSignalWhereInput
    some?: IntelRiskSignalWhereInput
    none?: IntelRiskSignalWhereInput
  }

  export type IntelPersonTenantPresenceListRelationFilter = {
    every?: IntelPersonTenantPresenceWhereInput
    some?: IntelPersonTenantPresenceWhereInput
    none?: IntelPersonTenantPresenceWhereInput
  }

  export type IntelReviewCaseListRelationFilter = {
    every?: IntelReviewCaseWhereInput
    some?: IntelReviewCaseWhereInput
    none?: IntelReviewCaseWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type IntelPersonIdentifierOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IntelBiometricProfileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IntelRiskSignalOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IntelPersonTenantPresenceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IntelReviewCaseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IntelPersonCountOrderByAggregateInput = {
    id?: SortOrder
    globalRiskScore?: SortOrder
    isWatchlisted?: SortOrder
    hasDuplicateFlag?: SortOrder
    fraudSignalCount?: SortOrder
    verificationConfidence?: SortOrder
    fullName?: SortOrder
    dateOfBirth?: SortOrder
    address?: SortOrder
    gender?: SortOrder
    photoUrl?: SortOrder
    verificationStatus?: SortOrder
    verificationProvider?: SortOrder
    verificationCountryCode?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntelPersonAvgOrderByAggregateInput = {
    globalRiskScore?: SortOrder
    fraudSignalCount?: SortOrder
    verificationConfidence?: SortOrder
  }

  export type IntelPersonMaxOrderByAggregateInput = {
    id?: SortOrder
    globalRiskScore?: SortOrder
    isWatchlisted?: SortOrder
    hasDuplicateFlag?: SortOrder
    fraudSignalCount?: SortOrder
    verificationConfidence?: SortOrder
    fullName?: SortOrder
    dateOfBirth?: SortOrder
    address?: SortOrder
    gender?: SortOrder
    photoUrl?: SortOrder
    verificationStatus?: SortOrder
    verificationProvider?: SortOrder
    verificationCountryCode?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntelPersonMinOrderByAggregateInput = {
    id?: SortOrder
    globalRiskScore?: SortOrder
    isWatchlisted?: SortOrder
    hasDuplicateFlag?: SortOrder
    fraudSignalCount?: SortOrder
    verificationConfidence?: SortOrder
    fullName?: SortOrder
    dateOfBirth?: SortOrder
    address?: SortOrder
    gender?: SortOrder
    photoUrl?: SortOrder
    verificationStatus?: SortOrder
    verificationProvider?: SortOrder
    verificationCountryCode?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntelPersonSumOrderByAggregateInput = {
    globalRiskScore?: SortOrder
    fraudSignalCount?: SortOrder
    verificationConfidence?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntelPersonRelationFilter = {
    is?: IntelPersonWhereInput
    isNot?: IntelPersonWhereInput
  }

  export type IntelPersonIdentifierTypeValueCompoundUniqueInput = {
    type: string
    value: string
  }

  export type IntelPersonIdentifierCountOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    countryCode?: SortOrder
    isVerified?: SortOrder
    createdAt?: SortOrder
  }

  export type IntelPersonIdentifierMaxOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    countryCode?: SortOrder
    isVerified?: SortOrder
    createdAt?: SortOrder
  }

  export type IntelPersonIdentifierMinOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    countryCode?: SortOrder
    isVerified?: SortOrder
    createdAt?: SortOrder
  }

  export type BytesFilter<$PrismaModel = never> = {
    equals?: Buffer | BytesFieldRefInput<$PrismaModel>
    in?: Buffer[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Buffer[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesFilter<$PrismaModel> | Buffer
  }

  export type IntelBiometricProfileCountOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    modality?: SortOrder
    embeddingCiphertext?: SortOrder
    qualityScore?: SortOrder
    isActive?: SortOrder
    enrolledAt?: SortOrder
  }

  export type IntelBiometricProfileAvgOrderByAggregateInput = {
    qualityScore?: SortOrder
  }

  export type IntelBiometricProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    modality?: SortOrder
    embeddingCiphertext?: SortOrder
    qualityScore?: SortOrder
    isActive?: SortOrder
    enrolledAt?: SortOrder
  }

  export type IntelBiometricProfileMinOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    modality?: SortOrder
    embeddingCiphertext?: SortOrder
    qualityScore?: SortOrder
    isActive?: SortOrder
    enrolledAt?: SortOrder
  }

  export type IntelBiometricProfileSumOrderByAggregateInput = {
    qualityScore?: SortOrder
  }

  export type BytesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Buffer | BytesFieldRefInput<$PrismaModel>
    in?: Buffer[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Buffer[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesWithAggregatesFilter<$PrismaModel> | Buffer
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBytesFilter<$PrismaModel>
    _max?: NestedBytesFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type IntelRiskSignalCountOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    severity?: SortOrder
    source?: SortOrder
    isActive?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type IntelRiskSignalMaxOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    severity?: SortOrder
    source?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
  }

  export type IntelRiskSignalMinOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    severity?: SortOrder
    source?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntelPersonTenantPresencePersonIdTenantIdRoleTypeCompoundUniqueInput = {
    personId: string
    tenantId: string
    roleType: string
  }

  export type IntelPersonTenantPresenceCountOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    tenantId?: SortOrder
    roleType?: SortOrder
    createdAt?: SortOrder
  }

  export type IntelPersonTenantPresenceMaxOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    tenantId?: SortOrder
    roleType?: SortOrder
    createdAt?: SortOrder
  }

  export type IntelPersonTenantPresenceMinOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    tenantId?: SortOrder
    roleType?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntelReviewCaseCountOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    status?: SortOrder
    resolution?: SortOrder
    confidenceScore?: SortOrder
    evidence?: SortOrder
    reviewedBy?: SortOrder
    reviewedAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntelReviewCaseAvgOrderByAggregateInput = {
    confidenceScore?: SortOrder
  }

  export type IntelReviewCaseMaxOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    status?: SortOrder
    resolution?: SortOrder
    confidenceScore?: SortOrder
    reviewedBy?: SortOrder
    reviewedAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntelReviewCaseMinOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    status?: SortOrder
    resolution?: SortOrder
    confidenceScore?: SortOrder
    reviewedBy?: SortOrder
    reviewedAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntelReviewCaseSumOrderByAggregateInput = {
    confidenceScore?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntelWatchlistEntryCountOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    reason?: SortOrder
    addedBy?: SortOrder
    expiresAt?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntelWatchlistEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    reason?: SortOrder
    addedBy?: SortOrder
    expiresAt?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntelWatchlistEntryMinOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    type?: SortOrder
    reason?: SortOrder
    addedBy?: SortOrder
    expiresAt?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type IntelLinkageEventCountOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    eventType?: SortOrder
    confidenceScore?: SortOrder
    actor?: SortOrder
    reason?: SortOrder
    metadata?: SortOrder
    occurredAt?: SortOrder
  }

  export type IntelLinkageEventAvgOrderByAggregateInput = {
    confidenceScore?: SortOrder
  }

  export type IntelLinkageEventMaxOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    eventType?: SortOrder
    confidenceScore?: SortOrder
    actor?: SortOrder
    reason?: SortOrder
    occurredAt?: SortOrder
  }

  export type IntelLinkageEventMinOrderByAggregateInput = {
    id?: SortOrder
    personId?: SortOrder
    eventType?: SortOrder
    confidenceScore?: SortOrder
    actor?: SortOrder
    reason?: SortOrder
    occurredAt?: SortOrder
  }

  export type IntelLinkageEventSumOrderByAggregateInput = {
    confidenceScore?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntelPersonIdentifierCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelPersonIdentifierCreateWithoutPersonInput, IntelPersonIdentifierUncheckedCreateWithoutPersonInput> | IntelPersonIdentifierCreateWithoutPersonInput[] | IntelPersonIdentifierUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelPersonIdentifierCreateOrConnectWithoutPersonInput | IntelPersonIdentifierCreateOrConnectWithoutPersonInput[]
    createMany?: IntelPersonIdentifierCreateManyPersonInputEnvelope
    connect?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
  }

  export type IntelBiometricProfileCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelBiometricProfileCreateWithoutPersonInput, IntelBiometricProfileUncheckedCreateWithoutPersonInput> | IntelBiometricProfileCreateWithoutPersonInput[] | IntelBiometricProfileUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelBiometricProfileCreateOrConnectWithoutPersonInput | IntelBiometricProfileCreateOrConnectWithoutPersonInput[]
    createMany?: IntelBiometricProfileCreateManyPersonInputEnvelope
    connect?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
  }

  export type IntelRiskSignalCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelRiskSignalCreateWithoutPersonInput, IntelRiskSignalUncheckedCreateWithoutPersonInput> | IntelRiskSignalCreateWithoutPersonInput[] | IntelRiskSignalUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelRiskSignalCreateOrConnectWithoutPersonInput | IntelRiskSignalCreateOrConnectWithoutPersonInput[]
    createMany?: IntelRiskSignalCreateManyPersonInputEnvelope
    connect?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
  }

  export type IntelPersonTenantPresenceCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelPersonTenantPresenceCreateWithoutPersonInput, IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput> | IntelPersonTenantPresenceCreateWithoutPersonInput[] | IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelPersonTenantPresenceCreateOrConnectWithoutPersonInput | IntelPersonTenantPresenceCreateOrConnectWithoutPersonInput[]
    createMany?: IntelPersonTenantPresenceCreateManyPersonInputEnvelope
    connect?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
  }

  export type IntelReviewCaseCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelReviewCaseCreateWithoutPersonInput, IntelReviewCaseUncheckedCreateWithoutPersonInput> | IntelReviewCaseCreateWithoutPersonInput[] | IntelReviewCaseUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelReviewCaseCreateOrConnectWithoutPersonInput | IntelReviewCaseCreateOrConnectWithoutPersonInput[]
    createMany?: IntelReviewCaseCreateManyPersonInputEnvelope
    connect?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
  }

  export type IntelPersonIdentifierUncheckedCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelPersonIdentifierCreateWithoutPersonInput, IntelPersonIdentifierUncheckedCreateWithoutPersonInput> | IntelPersonIdentifierCreateWithoutPersonInput[] | IntelPersonIdentifierUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelPersonIdentifierCreateOrConnectWithoutPersonInput | IntelPersonIdentifierCreateOrConnectWithoutPersonInput[]
    createMany?: IntelPersonIdentifierCreateManyPersonInputEnvelope
    connect?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
  }

  export type IntelBiometricProfileUncheckedCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelBiometricProfileCreateWithoutPersonInput, IntelBiometricProfileUncheckedCreateWithoutPersonInput> | IntelBiometricProfileCreateWithoutPersonInput[] | IntelBiometricProfileUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelBiometricProfileCreateOrConnectWithoutPersonInput | IntelBiometricProfileCreateOrConnectWithoutPersonInput[]
    createMany?: IntelBiometricProfileCreateManyPersonInputEnvelope
    connect?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
  }

  export type IntelRiskSignalUncheckedCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelRiskSignalCreateWithoutPersonInput, IntelRiskSignalUncheckedCreateWithoutPersonInput> | IntelRiskSignalCreateWithoutPersonInput[] | IntelRiskSignalUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelRiskSignalCreateOrConnectWithoutPersonInput | IntelRiskSignalCreateOrConnectWithoutPersonInput[]
    createMany?: IntelRiskSignalCreateManyPersonInputEnvelope
    connect?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
  }

  export type IntelPersonTenantPresenceUncheckedCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelPersonTenantPresenceCreateWithoutPersonInput, IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput> | IntelPersonTenantPresenceCreateWithoutPersonInput[] | IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelPersonTenantPresenceCreateOrConnectWithoutPersonInput | IntelPersonTenantPresenceCreateOrConnectWithoutPersonInput[]
    createMany?: IntelPersonTenantPresenceCreateManyPersonInputEnvelope
    connect?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
  }

  export type IntelReviewCaseUncheckedCreateNestedManyWithoutPersonInput = {
    create?: XOR<IntelReviewCaseCreateWithoutPersonInput, IntelReviewCaseUncheckedCreateWithoutPersonInput> | IntelReviewCaseCreateWithoutPersonInput[] | IntelReviewCaseUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelReviewCaseCreateOrConnectWithoutPersonInput | IntelReviewCaseCreateOrConnectWithoutPersonInput[]
    createMany?: IntelReviewCaseCreateManyPersonInputEnvelope
    connect?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntelPersonIdentifierUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelPersonIdentifierCreateWithoutPersonInput, IntelPersonIdentifierUncheckedCreateWithoutPersonInput> | IntelPersonIdentifierCreateWithoutPersonInput[] | IntelPersonIdentifierUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelPersonIdentifierCreateOrConnectWithoutPersonInput | IntelPersonIdentifierCreateOrConnectWithoutPersonInput[]
    upsert?: IntelPersonIdentifierUpsertWithWhereUniqueWithoutPersonInput | IntelPersonIdentifierUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelPersonIdentifierCreateManyPersonInputEnvelope
    set?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
    disconnect?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
    delete?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
    connect?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
    update?: IntelPersonIdentifierUpdateWithWhereUniqueWithoutPersonInput | IntelPersonIdentifierUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelPersonIdentifierUpdateManyWithWhereWithoutPersonInput | IntelPersonIdentifierUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelPersonIdentifierScalarWhereInput | IntelPersonIdentifierScalarWhereInput[]
  }

  export type IntelBiometricProfileUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelBiometricProfileCreateWithoutPersonInput, IntelBiometricProfileUncheckedCreateWithoutPersonInput> | IntelBiometricProfileCreateWithoutPersonInput[] | IntelBiometricProfileUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelBiometricProfileCreateOrConnectWithoutPersonInput | IntelBiometricProfileCreateOrConnectWithoutPersonInput[]
    upsert?: IntelBiometricProfileUpsertWithWhereUniqueWithoutPersonInput | IntelBiometricProfileUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelBiometricProfileCreateManyPersonInputEnvelope
    set?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
    disconnect?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
    delete?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
    connect?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
    update?: IntelBiometricProfileUpdateWithWhereUniqueWithoutPersonInput | IntelBiometricProfileUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelBiometricProfileUpdateManyWithWhereWithoutPersonInput | IntelBiometricProfileUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelBiometricProfileScalarWhereInput | IntelBiometricProfileScalarWhereInput[]
  }

  export type IntelRiskSignalUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelRiskSignalCreateWithoutPersonInput, IntelRiskSignalUncheckedCreateWithoutPersonInput> | IntelRiskSignalCreateWithoutPersonInput[] | IntelRiskSignalUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelRiskSignalCreateOrConnectWithoutPersonInput | IntelRiskSignalCreateOrConnectWithoutPersonInput[]
    upsert?: IntelRiskSignalUpsertWithWhereUniqueWithoutPersonInput | IntelRiskSignalUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelRiskSignalCreateManyPersonInputEnvelope
    set?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
    disconnect?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
    delete?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
    connect?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
    update?: IntelRiskSignalUpdateWithWhereUniqueWithoutPersonInput | IntelRiskSignalUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelRiskSignalUpdateManyWithWhereWithoutPersonInput | IntelRiskSignalUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelRiskSignalScalarWhereInput | IntelRiskSignalScalarWhereInput[]
  }

  export type IntelPersonTenantPresenceUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelPersonTenantPresenceCreateWithoutPersonInput, IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput> | IntelPersonTenantPresenceCreateWithoutPersonInput[] | IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelPersonTenantPresenceCreateOrConnectWithoutPersonInput | IntelPersonTenantPresenceCreateOrConnectWithoutPersonInput[]
    upsert?: IntelPersonTenantPresenceUpsertWithWhereUniqueWithoutPersonInput | IntelPersonTenantPresenceUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelPersonTenantPresenceCreateManyPersonInputEnvelope
    set?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
    disconnect?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
    delete?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
    connect?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
    update?: IntelPersonTenantPresenceUpdateWithWhereUniqueWithoutPersonInput | IntelPersonTenantPresenceUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelPersonTenantPresenceUpdateManyWithWhereWithoutPersonInput | IntelPersonTenantPresenceUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelPersonTenantPresenceScalarWhereInput | IntelPersonTenantPresenceScalarWhereInput[]
  }

  export type IntelReviewCaseUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelReviewCaseCreateWithoutPersonInput, IntelReviewCaseUncheckedCreateWithoutPersonInput> | IntelReviewCaseCreateWithoutPersonInput[] | IntelReviewCaseUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelReviewCaseCreateOrConnectWithoutPersonInput | IntelReviewCaseCreateOrConnectWithoutPersonInput[]
    upsert?: IntelReviewCaseUpsertWithWhereUniqueWithoutPersonInput | IntelReviewCaseUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelReviewCaseCreateManyPersonInputEnvelope
    set?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
    disconnect?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
    delete?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
    connect?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
    update?: IntelReviewCaseUpdateWithWhereUniqueWithoutPersonInput | IntelReviewCaseUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelReviewCaseUpdateManyWithWhereWithoutPersonInput | IntelReviewCaseUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelReviewCaseScalarWhereInput | IntelReviewCaseScalarWhereInput[]
  }

  export type IntelPersonIdentifierUncheckedUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelPersonIdentifierCreateWithoutPersonInput, IntelPersonIdentifierUncheckedCreateWithoutPersonInput> | IntelPersonIdentifierCreateWithoutPersonInput[] | IntelPersonIdentifierUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelPersonIdentifierCreateOrConnectWithoutPersonInput | IntelPersonIdentifierCreateOrConnectWithoutPersonInput[]
    upsert?: IntelPersonIdentifierUpsertWithWhereUniqueWithoutPersonInput | IntelPersonIdentifierUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelPersonIdentifierCreateManyPersonInputEnvelope
    set?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
    disconnect?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
    delete?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
    connect?: IntelPersonIdentifierWhereUniqueInput | IntelPersonIdentifierWhereUniqueInput[]
    update?: IntelPersonIdentifierUpdateWithWhereUniqueWithoutPersonInput | IntelPersonIdentifierUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelPersonIdentifierUpdateManyWithWhereWithoutPersonInput | IntelPersonIdentifierUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelPersonIdentifierScalarWhereInput | IntelPersonIdentifierScalarWhereInput[]
  }

  export type IntelBiometricProfileUncheckedUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelBiometricProfileCreateWithoutPersonInput, IntelBiometricProfileUncheckedCreateWithoutPersonInput> | IntelBiometricProfileCreateWithoutPersonInput[] | IntelBiometricProfileUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelBiometricProfileCreateOrConnectWithoutPersonInput | IntelBiometricProfileCreateOrConnectWithoutPersonInput[]
    upsert?: IntelBiometricProfileUpsertWithWhereUniqueWithoutPersonInput | IntelBiometricProfileUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelBiometricProfileCreateManyPersonInputEnvelope
    set?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
    disconnect?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
    delete?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
    connect?: IntelBiometricProfileWhereUniqueInput | IntelBiometricProfileWhereUniqueInput[]
    update?: IntelBiometricProfileUpdateWithWhereUniqueWithoutPersonInput | IntelBiometricProfileUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelBiometricProfileUpdateManyWithWhereWithoutPersonInput | IntelBiometricProfileUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelBiometricProfileScalarWhereInput | IntelBiometricProfileScalarWhereInput[]
  }

  export type IntelRiskSignalUncheckedUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelRiskSignalCreateWithoutPersonInput, IntelRiskSignalUncheckedCreateWithoutPersonInput> | IntelRiskSignalCreateWithoutPersonInput[] | IntelRiskSignalUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelRiskSignalCreateOrConnectWithoutPersonInput | IntelRiskSignalCreateOrConnectWithoutPersonInput[]
    upsert?: IntelRiskSignalUpsertWithWhereUniqueWithoutPersonInput | IntelRiskSignalUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelRiskSignalCreateManyPersonInputEnvelope
    set?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
    disconnect?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
    delete?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
    connect?: IntelRiskSignalWhereUniqueInput | IntelRiskSignalWhereUniqueInput[]
    update?: IntelRiskSignalUpdateWithWhereUniqueWithoutPersonInput | IntelRiskSignalUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelRiskSignalUpdateManyWithWhereWithoutPersonInput | IntelRiskSignalUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelRiskSignalScalarWhereInput | IntelRiskSignalScalarWhereInput[]
  }

  export type IntelPersonTenantPresenceUncheckedUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelPersonTenantPresenceCreateWithoutPersonInput, IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput> | IntelPersonTenantPresenceCreateWithoutPersonInput[] | IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelPersonTenantPresenceCreateOrConnectWithoutPersonInput | IntelPersonTenantPresenceCreateOrConnectWithoutPersonInput[]
    upsert?: IntelPersonTenantPresenceUpsertWithWhereUniqueWithoutPersonInput | IntelPersonTenantPresenceUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelPersonTenantPresenceCreateManyPersonInputEnvelope
    set?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
    disconnect?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
    delete?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
    connect?: IntelPersonTenantPresenceWhereUniqueInput | IntelPersonTenantPresenceWhereUniqueInput[]
    update?: IntelPersonTenantPresenceUpdateWithWhereUniqueWithoutPersonInput | IntelPersonTenantPresenceUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelPersonTenantPresenceUpdateManyWithWhereWithoutPersonInput | IntelPersonTenantPresenceUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelPersonTenantPresenceScalarWhereInput | IntelPersonTenantPresenceScalarWhereInput[]
  }

  export type IntelReviewCaseUncheckedUpdateManyWithoutPersonNestedInput = {
    create?: XOR<IntelReviewCaseCreateWithoutPersonInput, IntelReviewCaseUncheckedCreateWithoutPersonInput> | IntelReviewCaseCreateWithoutPersonInput[] | IntelReviewCaseUncheckedCreateWithoutPersonInput[]
    connectOrCreate?: IntelReviewCaseCreateOrConnectWithoutPersonInput | IntelReviewCaseCreateOrConnectWithoutPersonInput[]
    upsert?: IntelReviewCaseUpsertWithWhereUniqueWithoutPersonInput | IntelReviewCaseUpsertWithWhereUniqueWithoutPersonInput[]
    createMany?: IntelReviewCaseCreateManyPersonInputEnvelope
    set?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
    disconnect?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
    delete?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
    connect?: IntelReviewCaseWhereUniqueInput | IntelReviewCaseWhereUniqueInput[]
    update?: IntelReviewCaseUpdateWithWhereUniqueWithoutPersonInput | IntelReviewCaseUpdateWithWhereUniqueWithoutPersonInput[]
    updateMany?: IntelReviewCaseUpdateManyWithWhereWithoutPersonInput | IntelReviewCaseUpdateManyWithWhereWithoutPersonInput[]
    deleteMany?: IntelReviewCaseScalarWhereInput | IntelReviewCaseScalarWhereInput[]
  }

  export type IntelPersonCreateNestedOneWithoutIdentifiersInput = {
    create?: XOR<IntelPersonCreateWithoutIdentifiersInput, IntelPersonUncheckedCreateWithoutIdentifiersInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutIdentifiersInput
    connect?: IntelPersonWhereUniqueInput
  }

  export type IntelPersonUpdateOneRequiredWithoutIdentifiersNestedInput = {
    create?: XOR<IntelPersonCreateWithoutIdentifiersInput, IntelPersonUncheckedCreateWithoutIdentifiersInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutIdentifiersInput
    upsert?: IntelPersonUpsertWithoutIdentifiersInput
    connect?: IntelPersonWhereUniqueInput
    update?: XOR<XOR<IntelPersonUpdateToOneWithWhereWithoutIdentifiersInput, IntelPersonUpdateWithoutIdentifiersInput>, IntelPersonUncheckedUpdateWithoutIdentifiersInput>
  }

  export type IntelPersonCreateNestedOneWithoutBiometricsInput = {
    create?: XOR<IntelPersonCreateWithoutBiometricsInput, IntelPersonUncheckedCreateWithoutBiometricsInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutBiometricsInput
    connect?: IntelPersonWhereUniqueInput
  }

  export type BytesFieldUpdateOperationsInput = {
    set?: Buffer
  }

  export type IntelPersonUpdateOneRequiredWithoutBiometricsNestedInput = {
    create?: XOR<IntelPersonCreateWithoutBiometricsInput, IntelPersonUncheckedCreateWithoutBiometricsInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutBiometricsInput
    upsert?: IntelPersonUpsertWithoutBiometricsInput
    connect?: IntelPersonWhereUniqueInput
    update?: XOR<XOR<IntelPersonUpdateToOneWithWhereWithoutBiometricsInput, IntelPersonUpdateWithoutBiometricsInput>, IntelPersonUncheckedUpdateWithoutBiometricsInput>
  }

  export type IntelPersonCreateNestedOneWithoutRiskSignalsInput = {
    create?: XOR<IntelPersonCreateWithoutRiskSignalsInput, IntelPersonUncheckedCreateWithoutRiskSignalsInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutRiskSignalsInput
    connect?: IntelPersonWhereUniqueInput
  }

  export type IntelPersonUpdateOneRequiredWithoutRiskSignalsNestedInput = {
    create?: XOR<IntelPersonCreateWithoutRiskSignalsInput, IntelPersonUncheckedCreateWithoutRiskSignalsInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutRiskSignalsInput
    upsert?: IntelPersonUpsertWithoutRiskSignalsInput
    connect?: IntelPersonWhereUniqueInput
    update?: XOR<XOR<IntelPersonUpdateToOneWithWhereWithoutRiskSignalsInput, IntelPersonUpdateWithoutRiskSignalsInput>, IntelPersonUncheckedUpdateWithoutRiskSignalsInput>
  }

  export type IntelPersonCreateNestedOneWithoutTenantPresencesInput = {
    create?: XOR<IntelPersonCreateWithoutTenantPresencesInput, IntelPersonUncheckedCreateWithoutTenantPresencesInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutTenantPresencesInput
    connect?: IntelPersonWhereUniqueInput
  }

  export type IntelPersonUpdateOneRequiredWithoutTenantPresencesNestedInput = {
    create?: XOR<IntelPersonCreateWithoutTenantPresencesInput, IntelPersonUncheckedCreateWithoutTenantPresencesInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutTenantPresencesInput
    upsert?: IntelPersonUpsertWithoutTenantPresencesInput
    connect?: IntelPersonWhereUniqueInput
    update?: XOR<XOR<IntelPersonUpdateToOneWithWhereWithoutTenantPresencesInput, IntelPersonUpdateWithoutTenantPresencesInput>, IntelPersonUncheckedUpdateWithoutTenantPresencesInput>
  }

  export type IntelPersonCreateNestedOneWithoutReviewCasesInput = {
    create?: XOR<IntelPersonCreateWithoutReviewCasesInput, IntelPersonUncheckedCreateWithoutReviewCasesInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutReviewCasesInput
    connect?: IntelPersonWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntelPersonUpdateOneRequiredWithoutReviewCasesNestedInput = {
    create?: XOR<IntelPersonCreateWithoutReviewCasesInput, IntelPersonUncheckedCreateWithoutReviewCasesInput>
    connectOrCreate?: IntelPersonCreateOrConnectWithoutReviewCasesInput
    upsert?: IntelPersonUpsertWithoutReviewCasesInput
    connect?: IntelPersonWhereUniqueInput
    update?: XOR<XOR<IntelPersonUpdateToOneWithWhereWithoutReviewCasesInput, IntelPersonUpdateWithoutReviewCasesInput>, IntelPersonUncheckedUpdateWithoutReviewCasesInput>
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBytesFilter<$PrismaModel = never> = {
    equals?: Buffer | BytesFieldRefInput<$PrismaModel>
    in?: Buffer[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Buffer[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesFilter<$PrismaModel> | Buffer
  }

  export type NestedBytesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Buffer | BytesFieldRefInput<$PrismaModel>
    in?: Buffer[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Buffer[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesWithAggregatesFilter<$PrismaModel> | Buffer
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBytesFilter<$PrismaModel>
    _max?: NestedBytesFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntelPersonIdentifierCreateWithoutPersonInput = {
    id?: string
    type: string
    value: string
    countryCode?: string | null
    isVerified?: boolean
    createdAt?: Date | string
  }

  export type IntelPersonIdentifierUncheckedCreateWithoutPersonInput = {
    id?: string
    type: string
    value: string
    countryCode?: string | null
    isVerified?: boolean
    createdAt?: Date | string
  }

  export type IntelPersonIdentifierCreateOrConnectWithoutPersonInput = {
    where: IntelPersonIdentifierWhereUniqueInput
    create: XOR<IntelPersonIdentifierCreateWithoutPersonInput, IntelPersonIdentifierUncheckedCreateWithoutPersonInput>
  }

  export type IntelPersonIdentifierCreateManyPersonInputEnvelope = {
    data: IntelPersonIdentifierCreateManyPersonInput | IntelPersonIdentifierCreateManyPersonInput[]
    skipDuplicates?: boolean
  }

  export type IntelBiometricProfileCreateWithoutPersonInput = {
    id?: string
    modality: string
    embeddingCiphertext: Buffer
    qualityScore: number
    isActive?: boolean
    enrolledAt?: Date | string
  }

  export type IntelBiometricProfileUncheckedCreateWithoutPersonInput = {
    id?: string
    modality: string
    embeddingCiphertext: Buffer
    qualityScore: number
    isActive?: boolean
    enrolledAt?: Date | string
  }

  export type IntelBiometricProfileCreateOrConnectWithoutPersonInput = {
    where: IntelBiometricProfileWhereUniqueInput
    create: XOR<IntelBiometricProfileCreateWithoutPersonInput, IntelBiometricProfileUncheckedCreateWithoutPersonInput>
  }

  export type IntelBiometricProfileCreateManyPersonInputEnvelope = {
    data: IntelBiometricProfileCreateManyPersonInput | IntelBiometricProfileCreateManyPersonInput[]
    skipDuplicates?: boolean
  }

  export type IntelRiskSignalCreateWithoutPersonInput = {
    id?: string
    type: string
    severity: string
    source: string
    isActive?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type IntelRiskSignalUncheckedCreateWithoutPersonInput = {
    id?: string
    type: string
    severity: string
    source: string
    isActive?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type IntelRiskSignalCreateOrConnectWithoutPersonInput = {
    where: IntelRiskSignalWhereUniqueInput
    create: XOR<IntelRiskSignalCreateWithoutPersonInput, IntelRiskSignalUncheckedCreateWithoutPersonInput>
  }

  export type IntelRiskSignalCreateManyPersonInputEnvelope = {
    data: IntelRiskSignalCreateManyPersonInput | IntelRiskSignalCreateManyPersonInput[]
    skipDuplicates?: boolean
  }

  export type IntelPersonTenantPresenceCreateWithoutPersonInput = {
    id?: string
    tenantId: string
    roleType?: string
    createdAt?: Date | string
  }

  export type IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput = {
    id?: string
    tenantId: string
    roleType?: string
    createdAt?: Date | string
  }

  export type IntelPersonTenantPresenceCreateOrConnectWithoutPersonInput = {
    where: IntelPersonTenantPresenceWhereUniqueInput
    create: XOR<IntelPersonTenantPresenceCreateWithoutPersonInput, IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput>
  }

  export type IntelPersonTenantPresenceCreateManyPersonInputEnvelope = {
    data: IntelPersonTenantPresenceCreateManyPersonInput | IntelPersonTenantPresenceCreateManyPersonInput[]
    skipDuplicates?: boolean
  }

  export type IntelReviewCaseCreateWithoutPersonInput = {
    id?: string
    status?: string
    resolution?: string | null
    confidenceScore: number
    evidence: JsonNullValueInput | InputJsonValue
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IntelReviewCaseUncheckedCreateWithoutPersonInput = {
    id?: string
    status?: string
    resolution?: string | null
    confidenceScore: number
    evidence: JsonNullValueInput | InputJsonValue
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IntelReviewCaseCreateOrConnectWithoutPersonInput = {
    where: IntelReviewCaseWhereUniqueInput
    create: XOR<IntelReviewCaseCreateWithoutPersonInput, IntelReviewCaseUncheckedCreateWithoutPersonInput>
  }

  export type IntelReviewCaseCreateManyPersonInputEnvelope = {
    data: IntelReviewCaseCreateManyPersonInput | IntelReviewCaseCreateManyPersonInput[]
    skipDuplicates?: boolean
  }

  export type IntelPersonIdentifierUpsertWithWhereUniqueWithoutPersonInput = {
    where: IntelPersonIdentifierWhereUniqueInput
    update: XOR<IntelPersonIdentifierUpdateWithoutPersonInput, IntelPersonIdentifierUncheckedUpdateWithoutPersonInput>
    create: XOR<IntelPersonIdentifierCreateWithoutPersonInput, IntelPersonIdentifierUncheckedCreateWithoutPersonInput>
  }

  export type IntelPersonIdentifierUpdateWithWhereUniqueWithoutPersonInput = {
    where: IntelPersonIdentifierWhereUniqueInput
    data: XOR<IntelPersonIdentifierUpdateWithoutPersonInput, IntelPersonIdentifierUncheckedUpdateWithoutPersonInput>
  }

  export type IntelPersonIdentifierUpdateManyWithWhereWithoutPersonInput = {
    where: IntelPersonIdentifierScalarWhereInput
    data: XOR<IntelPersonIdentifierUpdateManyMutationInput, IntelPersonIdentifierUncheckedUpdateManyWithoutPersonInput>
  }

  export type IntelPersonIdentifierScalarWhereInput = {
    AND?: IntelPersonIdentifierScalarWhereInput | IntelPersonIdentifierScalarWhereInput[]
    OR?: IntelPersonIdentifierScalarWhereInput[]
    NOT?: IntelPersonIdentifierScalarWhereInput | IntelPersonIdentifierScalarWhereInput[]
    id?: StringFilter<"IntelPersonIdentifier"> | string
    personId?: StringFilter<"IntelPersonIdentifier"> | string
    type?: StringFilter<"IntelPersonIdentifier"> | string
    value?: StringFilter<"IntelPersonIdentifier"> | string
    countryCode?: StringNullableFilter<"IntelPersonIdentifier"> | string | null
    isVerified?: BoolFilter<"IntelPersonIdentifier"> | boolean
    createdAt?: DateTimeFilter<"IntelPersonIdentifier"> | Date | string
  }

  export type IntelBiometricProfileUpsertWithWhereUniqueWithoutPersonInput = {
    where: IntelBiometricProfileWhereUniqueInput
    update: XOR<IntelBiometricProfileUpdateWithoutPersonInput, IntelBiometricProfileUncheckedUpdateWithoutPersonInput>
    create: XOR<IntelBiometricProfileCreateWithoutPersonInput, IntelBiometricProfileUncheckedCreateWithoutPersonInput>
  }

  export type IntelBiometricProfileUpdateWithWhereUniqueWithoutPersonInput = {
    where: IntelBiometricProfileWhereUniqueInput
    data: XOR<IntelBiometricProfileUpdateWithoutPersonInput, IntelBiometricProfileUncheckedUpdateWithoutPersonInput>
  }

  export type IntelBiometricProfileUpdateManyWithWhereWithoutPersonInput = {
    where: IntelBiometricProfileScalarWhereInput
    data: XOR<IntelBiometricProfileUpdateManyMutationInput, IntelBiometricProfileUncheckedUpdateManyWithoutPersonInput>
  }

  export type IntelBiometricProfileScalarWhereInput = {
    AND?: IntelBiometricProfileScalarWhereInput | IntelBiometricProfileScalarWhereInput[]
    OR?: IntelBiometricProfileScalarWhereInput[]
    NOT?: IntelBiometricProfileScalarWhereInput | IntelBiometricProfileScalarWhereInput[]
    id?: StringFilter<"IntelBiometricProfile"> | string
    personId?: StringFilter<"IntelBiometricProfile"> | string
    modality?: StringFilter<"IntelBiometricProfile"> | string
    embeddingCiphertext?: BytesFilter<"IntelBiometricProfile"> | Buffer
    qualityScore?: FloatFilter<"IntelBiometricProfile"> | number
    isActive?: BoolFilter<"IntelBiometricProfile"> | boolean
    enrolledAt?: DateTimeFilter<"IntelBiometricProfile"> | Date | string
  }

  export type IntelRiskSignalUpsertWithWhereUniqueWithoutPersonInput = {
    where: IntelRiskSignalWhereUniqueInput
    update: XOR<IntelRiskSignalUpdateWithoutPersonInput, IntelRiskSignalUncheckedUpdateWithoutPersonInput>
    create: XOR<IntelRiskSignalCreateWithoutPersonInput, IntelRiskSignalUncheckedCreateWithoutPersonInput>
  }

  export type IntelRiskSignalUpdateWithWhereUniqueWithoutPersonInput = {
    where: IntelRiskSignalWhereUniqueInput
    data: XOR<IntelRiskSignalUpdateWithoutPersonInput, IntelRiskSignalUncheckedUpdateWithoutPersonInput>
  }

  export type IntelRiskSignalUpdateManyWithWhereWithoutPersonInput = {
    where: IntelRiskSignalScalarWhereInput
    data: XOR<IntelRiskSignalUpdateManyMutationInput, IntelRiskSignalUncheckedUpdateManyWithoutPersonInput>
  }

  export type IntelRiskSignalScalarWhereInput = {
    AND?: IntelRiskSignalScalarWhereInput | IntelRiskSignalScalarWhereInput[]
    OR?: IntelRiskSignalScalarWhereInput[]
    NOT?: IntelRiskSignalScalarWhereInput | IntelRiskSignalScalarWhereInput[]
    id?: StringFilter<"IntelRiskSignal"> | string
    personId?: StringFilter<"IntelRiskSignal"> | string
    type?: StringFilter<"IntelRiskSignal"> | string
    severity?: StringFilter<"IntelRiskSignal"> | string
    source?: StringFilter<"IntelRiskSignal"> | string
    isActive?: BoolFilter<"IntelRiskSignal"> | boolean
    metadata?: JsonNullableFilter<"IntelRiskSignal">
    createdAt?: DateTimeFilter<"IntelRiskSignal"> | Date | string
  }

  export type IntelPersonTenantPresenceUpsertWithWhereUniqueWithoutPersonInput = {
    where: IntelPersonTenantPresenceWhereUniqueInput
    update: XOR<IntelPersonTenantPresenceUpdateWithoutPersonInput, IntelPersonTenantPresenceUncheckedUpdateWithoutPersonInput>
    create: XOR<IntelPersonTenantPresenceCreateWithoutPersonInput, IntelPersonTenantPresenceUncheckedCreateWithoutPersonInput>
  }

  export type IntelPersonTenantPresenceUpdateWithWhereUniqueWithoutPersonInput = {
    where: IntelPersonTenantPresenceWhereUniqueInput
    data: XOR<IntelPersonTenantPresenceUpdateWithoutPersonInput, IntelPersonTenantPresenceUncheckedUpdateWithoutPersonInput>
  }

  export type IntelPersonTenantPresenceUpdateManyWithWhereWithoutPersonInput = {
    where: IntelPersonTenantPresenceScalarWhereInput
    data: XOR<IntelPersonTenantPresenceUpdateManyMutationInput, IntelPersonTenantPresenceUncheckedUpdateManyWithoutPersonInput>
  }

  export type IntelPersonTenantPresenceScalarWhereInput = {
    AND?: IntelPersonTenantPresenceScalarWhereInput | IntelPersonTenantPresenceScalarWhereInput[]
    OR?: IntelPersonTenantPresenceScalarWhereInput[]
    NOT?: IntelPersonTenantPresenceScalarWhereInput | IntelPersonTenantPresenceScalarWhereInput[]
    id?: StringFilter<"IntelPersonTenantPresence"> | string
    personId?: StringFilter<"IntelPersonTenantPresence"> | string
    tenantId?: StringFilter<"IntelPersonTenantPresence"> | string
    roleType?: StringFilter<"IntelPersonTenantPresence"> | string
    createdAt?: DateTimeFilter<"IntelPersonTenantPresence"> | Date | string
  }

  export type IntelReviewCaseUpsertWithWhereUniqueWithoutPersonInput = {
    where: IntelReviewCaseWhereUniqueInput
    update: XOR<IntelReviewCaseUpdateWithoutPersonInput, IntelReviewCaseUncheckedUpdateWithoutPersonInput>
    create: XOR<IntelReviewCaseCreateWithoutPersonInput, IntelReviewCaseUncheckedCreateWithoutPersonInput>
  }

  export type IntelReviewCaseUpdateWithWhereUniqueWithoutPersonInput = {
    where: IntelReviewCaseWhereUniqueInput
    data: XOR<IntelReviewCaseUpdateWithoutPersonInput, IntelReviewCaseUncheckedUpdateWithoutPersonInput>
  }

  export type IntelReviewCaseUpdateManyWithWhereWithoutPersonInput = {
    where: IntelReviewCaseScalarWhereInput
    data: XOR<IntelReviewCaseUpdateManyMutationInput, IntelReviewCaseUncheckedUpdateManyWithoutPersonInput>
  }

  export type IntelReviewCaseScalarWhereInput = {
    AND?: IntelReviewCaseScalarWhereInput | IntelReviewCaseScalarWhereInput[]
    OR?: IntelReviewCaseScalarWhereInput[]
    NOT?: IntelReviewCaseScalarWhereInput | IntelReviewCaseScalarWhereInput[]
    id?: StringFilter<"IntelReviewCase"> | string
    personId?: StringFilter<"IntelReviewCase"> | string
    status?: StringFilter<"IntelReviewCase"> | string
    resolution?: StringNullableFilter<"IntelReviewCase"> | string | null
    confidenceScore?: FloatFilter<"IntelReviewCase"> | number
    evidence?: JsonFilter<"IntelReviewCase">
    reviewedBy?: StringNullableFilter<"IntelReviewCase"> | string | null
    reviewedAt?: DateTimeNullableFilter<"IntelReviewCase"> | Date | string | null
    notes?: StringNullableFilter<"IntelReviewCase"> | string | null
    createdAt?: DateTimeFilter<"IntelReviewCase"> | Date | string
    updatedAt?: DateTimeFilter<"IntelReviewCase"> | Date | string
  }

  export type IntelPersonCreateWithoutIdentifiersInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    biometrics?: IntelBiometricProfileCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonUncheckedCreateWithoutIdentifiersInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    biometrics?: IntelBiometricProfileUncheckedCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalUncheckedCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseUncheckedCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonCreateOrConnectWithoutIdentifiersInput = {
    where: IntelPersonWhereUniqueInput
    create: XOR<IntelPersonCreateWithoutIdentifiersInput, IntelPersonUncheckedCreateWithoutIdentifiersInput>
  }

  export type IntelPersonUpsertWithoutIdentifiersInput = {
    update: XOR<IntelPersonUpdateWithoutIdentifiersInput, IntelPersonUncheckedUpdateWithoutIdentifiersInput>
    create: XOR<IntelPersonCreateWithoutIdentifiersInput, IntelPersonUncheckedCreateWithoutIdentifiersInput>
    where?: IntelPersonWhereInput
  }

  export type IntelPersonUpdateToOneWithWhereWithoutIdentifiersInput = {
    where?: IntelPersonWhereInput
    data: XOR<IntelPersonUpdateWithoutIdentifiersInput, IntelPersonUncheckedUpdateWithoutIdentifiersInput>
  }

  export type IntelPersonUpdateWithoutIdentifiersInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    biometrics?: IntelBiometricProfileUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonUncheckedUpdateWithoutIdentifiersInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    biometrics?: IntelBiometricProfileUncheckedUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUncheckedUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUncheckedUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonCreateWithoutBiometricsInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonUncheckedCreateWithoutBiometricsInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierUncheckedCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalUncheckedCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseUncheckedCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonCreateOrConnectWithoutBiometricsInput = {
    where: IntelPersonWhereUniqueInput
    create: XOR<IntelPersonCreateWithoutBiometricsInput, IntelPersonUncheckedCreateWithoutBiometricsInput>
  }

  export type IntelPersonUpsertWithoutBiometricsInput = {
    update: XOR<IntelPersonUpdateWithoutBiometricsInput, IntelPersonUncheckedUpdateWithoutBiometricsInput>
    create: XOR<IntelPersonCreateWithoutBiometricsInput, IntelPersonUncheckedCreateWithoutBiometricsInput>
    where?: IntelPersonWhereInput
  }

  export type IntelPersonUpdateToOneWithWhereWithoutBiometricsInput = {
    where?: IntelPersonWhereInput
    data: XOR<IntelPersonUpdateWithoutBiometricsInput, IntelPersonUncheckedUpdateWithoutBiometricsInput>
  }

  export type IntelPersonUpdateWithoutBiometricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonUncheckedUpdateWithoutBiometricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUncheckedUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUncheckedUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUncheckedUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonCreateWithoutRiskSignalsInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierCreateNestedManyWithoutPersonInput
    biometrics?: IntelBiometricProfileCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonUncheckedCreateWithoutRiskSignalsInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierUncheckedCreateNestedManyWithoutPersonInput
    biometrics?: IntelBiometricProfileUncheckedCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseUncheckedCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonCreateOrConnectWithoutRiskSignalsInput = {
    where: IntelPersonWhereUniqueInput
    create: XOR<IntelPersonCreateWithoutRiskSignalsInput, IntelPersonUncheckedCreateWithoutRiskSignalsInput>
  }

  export type IntelPersonUpsertWithoutRiskSignalsInput = {
    update: XOR<IntelPersonUpdateWithoutRiskSignalsInput, IntelPersonUncheckedUpdateWithoutRiskSignalsInput>
    create: XOR<IntelPersonCreateWithoutRiskSignalsInput, IntelPersonUncheckedCreateWithoutRiskSignalsInput>
    where?: IntelPersonWhereInput
  }

  export type IntelPersonUpdateToOneWithWhereWithoutRiskSignalsInput = {
    where?: IntelPersonWhereInput
    data: XOR<IntelPersonUpdateWithoutRiskSignalsInput, IntelPersonUncheckedUpdateWithoutRiskSignalsInput>
  }

  export type IntelPersonUpdateWithoutRiskSignalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUpdateManyWithoutPersonNestedInput
    biometrics?: IntelBiometricProfileUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonUncheckedUpdateWithoutRiskSignalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUncheckedUpdateManyWithoutPersonNestedInput
    biometrics?: IntelBiometricProfileUncheckedUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUncheckedUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonCreateWithoutTenantPresencesInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierCreateNestedManyWithoutPersonInput
    biometrics?: IntelBiometricProfileCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonUncheckedCreateWithoutTenantPresencesInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierUncheckedCreateNestedManyWithoutPersonInput
    biometrics?: IntelBiometricProfileUncheckedCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalUncheckedCreateNestedManyWithoutPersonInput
    reviewCases?: IntelReviewCaseUncheckedCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonCreateOrConnectWithoutTenantPresencesInput = {
    where: IntelPersonWhereUniqueInput
    create: XOR<IntelPersonCreateWithoutTenantPresencesInput, IntelPersonUncheckedCreateWithoutTenantPresencesInput>
  }

  export type IntelPersonUpsertWithoutTenantPresencesInput = {
    update: XOR<IntelPersonUpdateWithoutTenantPresencesInput, IntelPersonUncheckedUpdateWithoutTenantPresencesInput>
    create: XOR<IntelPersonCreateWithoutTenantPresencesInput, IntelPersonUncheckedCreateWithoutTenantPresencesInput>
    where?: IntelPersonWhereInput
  }

  export type IntelPersonUpdateToOneWithWhereWithoutTenantPresencesInput = {
    where?: IntelPersonWhereInput
    data: XOR<IntelPersonUpdateWithoutTenantPresencesInput, IntelPersonUncheckedUpdateWithoutTenantPresencesInput>
  }

  export type IntelPersonUpdateWithoutTenantPresencesInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUpdateManyWithoutPersonNestedInput
    biometrics?: IntelBiometricProfileUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonUncheckedUpdateWithoutTenantPresencesInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUncheckedUpdateManyWithoutPersonNestedInput
    biometrics?: IntelBiometricProfileUncheckedUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUncheckedUpdateManyWithoutPersonNestedInput
    reviewCases?: IntelReviewCaseUncheckedUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonCreateWithoutReviewCasesInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierCreateNestedManyWithoutPersonInput
    biometrics?: IntelBiometricProfileCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonUncheckedCreateWithoutReviewCasesInput = {
    id?: string
    globalRiskScore?: number
    isWatchlisted?: boolean
    hasDuplicateFlag?: boolean
    fraudSignalCount?: number
    verificationConfidence?: number
    fullName?: string | null
    dateOfBirth?: string | null
    address?: string | null
    gender?: string | null
    photoUrl?: string | null
    verificationStatus?: string | null
    verificationProvider?: string | null
    verificationCountryCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    identifiers?: IntelPersonIdentifierUncheckedCreateNestedManyWithoutPersonInput
    biometrics?: IntelBiometricProfileUncheckedCreateNestedManyWithoutPersonInput
    riskSignals?: IntelRiskSignalUncheckedCreateNestedManyWithoutPersonInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedCreateNestedManyWithoutPersonInput
  }

  export type IntelPersonCreateOrConnectWithoutReviewCasesInput = {
    where: IntelPersonWhereUniqueInput
    create: XOR<IntelPersonCreateWithoutReviewCasesInput, IntelPersonUncheckedCreateWithoutReviewCasesInput>
  }

  export type IntelPersonUpsertWithoutReviewCasesInput = {
    update: XOR<IntelPersonUpdateWithoutReviewCasesInput, IntelPersonUncheckedUpdateWithoutReviewCasesInput>
    create: XOR<IntelPersonCreateWithoutReviewCasesInput, IntelPersonUncheckedCreateWithoutReviewCasesInput>
    where?: IntelPersonWhereInput
  }

  export type IntelPersonUpdateToOneWithWhereWithoutReviewCasesInput = {
    where?: IntelPersonWhereInput
    data: XOR<IntelPersonUpdateWithoutReviewCasesInput, IntelPersonUncheckedUpdateWithoutReviewCasesInput>
  }

  export type IntelPersonUpdateWithoutReviewCasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUpdateManyWithoutPersonNestedInput
    biometrics?: IntelBiometricProfileUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonUncheckedUpdateWithoutReviewCasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalRiskScore?: IntFieldUpdateOperationsInput | number
    isWatchlisted?: BoolFieldUpdateOperationsInput | boolean
    hasDuplicateFlag?: BoolFieldUpdateOperationsInput | boolean
    fraudSignalCount?: IntFieldUpdateOperationsInput | number
    verificationConfidence?: FloatFieldUpdateOperationsInput | number
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableStringFieldUpdateOperationsInput | string | null
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verificationStatus?: NullableStringFieldUpdateOperationsInput | string | null
    verificationProvider?: NullableStringFieldUpdateOperationsInput | string | null
    verificationCountryCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifiers?: IntelPersonIdentifierUncheckedUpdateManyWithoutPersonNestedInput
    biometrics?: IntelBiometricProfileUncheckedUpdateManyWithoutPersonNestedInput
    riskSignals?: IntelRiskSignalUncheckedUpdateManyWithoutPersonNestedInput
    tenantPresences?: IntelPersonTenantPresenceUncheckedUpdateManyWithoutPersonNestedInput
  }

  export type IntelPersonIdentifierCreateManyPersonInput = {
    id?: string
    type: string
    value: string
    countryCode?: string | null
    isVerified?: boolean
    createdAt?: Date | string
  }

  export type IntelBiometricProfileCreateManyPersonInput = {
    id?: string
    modality: string
    embeddingCiphertext: Buffer
    qualityScore: number
    isActive?: boolean
    enrolledAt?: Date | string
  }

  export type IntelRiskSignalCreateManyPersonInput = {
    id?: string
    type: string
    severity: string
    source: string
    isActive?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type IntelPersonTenantPresenceCreateManyPersonInput = {
    id?: string
    tenantId: string
    roleType?: string
    createdAt?: Date | string
  }

  export type IntelReviewCaseCreateManyPersonInput = {
    id?: string
    status?: string
    resolution?: string | null
    confidenceScore: number
    evidence: JsonNullValueInput | InputJsonValue
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IntelPersonIdentifierUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    countryCode?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonIdentifierUncheckedUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    countryCode?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonIdentifierUncheckedUpdateManyWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    countryCode?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelBiometricProfileUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    modality?: StringFieldUpdateOperationsInput | string
    embeddingCiphertext?: BytesFieldUpdateOperationsInput | Buffer
    qualityScore?: FloatFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    enrolledAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelBiometricProfileUncheckedUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    modality?: StringFieldUpdateOperationsInput | string
    embeddingCiphertext?: BytesFieldUpdateOperationsInput | Buffer
    qualityScore?: FloatFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    enrolledAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelBiometricProfileUncheckedUpdateManyWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    modality?: StringFieldUpdateOperationsInput | string
    embeddingCiphertext?: BytesFieldUpdateOperationsInput | Buffer
    qualityScore?: FloatFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    enrolledAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelRiskSignalUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelRiskSignalUncheckedUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelRiskSignalUncheckedUpdateManyWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonTenantPresenceUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonTenantPresenceUncheckedUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelPersonTenantPresenceUncheckedUpdateManyWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelReviewCaseUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: FloatFieldUpdateOperationsInput | number
    evidence?: JsonNullValueInput | InputJsonValue
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelReviewCaseUncheckedUpdateWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: FloatFieldUpdateOperationsInput | number
    evidence?: JsonNullValueInput | InputJsonValue
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntelReviewCaseUncheckedUpdateManyWithoutPersonInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: FloatFieldUpdateOperationsInput | number
    evidence?: JsonNullValueInput | InputJsonValue
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use IntelPersonCountOutputTypeDefaultArgs instead
     */
    export type IntelPersonCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IntelPersonCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IntelPersonDefaultArgs instead
     */
    export type IntelPersonArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IntelPersonDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IntelPersonIdentifierDefaultArgs instead
     */
    export type IntelPersonIdentifierArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IntelPersonIdentifierDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IntelBiometricProfileDefaultArgs instead
     */
    export type IntelBiometricProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IntelBiometricProfileDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IntelRiskSignalDefaultArgs instead
     */
    export type IntelRiskSignalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IntelRiskSignalDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IntelPersonTenantPresenceDefaultArgs instead
     */
    export type IntelPersonTenantPresenceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IntelPersonTenantPresenceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IntelReviewCaseDefaultArgs instead
     */
    export type IntelReviewCaseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IntelReviewCaseDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IntelWatchlistEntryDefaultArgs instead
     */
    export type IntelWatchlistEntryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IntelWatchlistEntryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IntelLinkageEventDefaultArgs instead
     */
    export type IntelLinkageEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IntelLinkageEventDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}