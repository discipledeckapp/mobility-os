
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
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model BusinessEntity
 * 
 */
export type BusinessEntity = $Result.DefaultSelection<Prisma.$BusinessEntityPayload>
/**
 * Model OperatingUnit
 * 
 */
export type OperatingUnit = $Result.DefaultSelection<Prisma.$OperatingUnitPayload>
/**
 * Model Fleet
 * 
 */
export type Fleet = $Result.DefaultSelection<Prisma.$FleetPayload>
/**
 * Model Driver
 * 
 */
export type Driver = $Result.DefaultSelection<Prisma.$DriverPayload>
/**
 * Model Vehicle
 * 
 */
export type Vehicle = $Result.DefaultSelection<Prisma.$VehiclePayload>
/**
 * Model Assignment
 * 
 */
export type Assignment = $Result.DefaultSelection<Prisma.$AssignmentPayload>
/**
 * Model Remittance
 * 
 */
export type Remittance = $Result.DefaultSelection<Prisma.$RemittancePayload>
/**
 * Model OperationalWallet
 * 
 */
export type OperationalWallet = $Result.DefaultSelection<Prisma.$OperationalWalletPayload>
/**
 * Model OperationalWalletEntry
 * 
 */
export type OperationalWalletEntry = $Result.DefaultSelection<Prisma.$OperationalWalletEntryPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model AuthOtp
 * 
 */
export type AuthOtp = $Result.DefaultSelection<Prisma.$AuthOtpPayload>
/**
 * Model PasswordResetToken
 * 
 */
export type PasswordResetToken = $Result.DefaultSelection<Prisma.$PasswordResetTokenPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
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
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
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
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs>;

  /**
   * `prisma.businessEntity`: Exposes CRUD operations for the **BusinessEntity** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BusinessEntities
    * const businessEntities = await prisma.businessEntity.findMany()
    * ```
    */
  get businessEntity(): Prisma.BusinessEntityDelegate<ExtArgs>;

  /**
   * `prisma.operatingUnit`: Exposes CRUD operations for the **OperatingUnit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OperatingUnits
    * const operatingUnits = await prisma.operatingUnit.findMany()
    * ```
    */
  get operatingUnit(): Prisma.OperatingUnitDelegate<ExtArgs>;

  /**
   * `prisma.fleet`: Exposes CRUD operations for the **Fleet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Fleets
    * const fleets = await prisma.fleet.findMany()
    * ```
    */
  get fleet(): Prisma.FleetDelegate<ExtArgs>;

  /**
   * `prisma.driver`: Exposes CRUD operations for the **Driver** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Drivers
    * const drivers = await prisma.driver.findMany()
    * ```
    */
  get driver(): Prisma.DriverDelegate<ExtArgs>;

  /**
   * `prisma.vehicle`: Exposes CRUD operations for the **Vehicle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Vehicles
    * const vehicles = await prisma.vehicle.findMany()
    * ```
    */
  get vehicle(): Prisma.VehicleDelegate<ExtArgs>;

  /**
   * `prisma.assignment`: Exposes CRUD operations for the **Assignment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Assignments
    * const assignments = await prisma.assignment.findMany()
    * ```
    */
  get assignment(): Prisma.AssignmentDelegate<ExtArgs>;

  /**
   * `prisma.remittance`: Exposes CRUD operations for the **Remittance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Remittances
    * const remittances = await prisma.remittance.findMany()
    * ```
    */
  get remittance(): Prisma.RemittanceDelegate<ExtArgs>;

  /**
   * `prisma.operationalWallet`: Exposes CRUD operations for the **OperationalWallet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OperationalWallets
    * const operationalWallets = await prisma.operationalWallet.findMany()
    * ```
    */
  get operationalWallet(): Prisma.OperationalWalletDelegate<ExtArgs>;

  /**
   * `prisma.operationalWalletEntry`: Exposes CRUD operations for the **OperationalWalletEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OperationalWalletEntries
    * const operationalWalletEntries = await prisma.operationalWalletEntry.findMany()
    * ```
    */
  get operationalWalletEntry(): Prisma.OperationalWalletEntryDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.authOtp`: Exposes CRUD operations for the **AuthOtp** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuthOtps
    * const authOtps = await prisma.authOtp.findMany()
    * ```
    */
  get authOtp(): Prisma.AuthOtpDelegate<ExtArgs>;

  /**
   * `prisma.passwordResetToken`: Exposes CRUD operations for the **PasswordResetToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PasswordResetTokens
    * const passwordResetTokens = await prisma.passwordResetToken.findMany()
    * ```
    */
  get passwordResetToken(): Prisma.PasswordResetTokenDelegate<ExtArgs>;
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
    Tenant: 'Tenant',
    BusinessEntity: 'BusinessEntity',
    OperatingUnit: 'OperatingUnit',
    Fleet: 'Fleet',
    Driver: 'Driver',
    Vehicle: 'Vehicle',
    Assignment: 'Assignment',
    Remittance: 'Remittance',
    OperationalWallet: 'OperationalWallet',
    OperationalWalletEntry: 'OperationalWalletEntry',
    User: 'User',
    AuthOtp: 'AuthOtp',
    PasswordResetToken: 'PasswordResetToken'
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
      modelProps: "tenant" | "businessEntity" | "operatingUnit" | "fleet" | "driver" | "vehicle" | "assignment" | "remittance" | "operationalWallet" | "operationalWalletEntry" | "user" | "authOtp" | "passwordResetToken"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      BusinessEntity: {
        payload: Prisma.$BusinessEntityPayload<ExtArgs>
        fields: Prisma.BusinessEntityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BusinessEntityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BusinessEntityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload>
          }
          findFirst: {
            args: Prisma.BusinessEntityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BusinessEntityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload>
          }
          findMany: {
            args: Prisma.BusinessEntityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload>[]
          }
          create: {
            args: Prisma.BusinessEntityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload>
          }
          createMany: {
            args: Prisma.BusinessEntityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BusinessEntityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload>[]
          }
          delete: {
            args: Prisma.BusinessEntityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload>
          }
          update: {
            args: Prisma.BusinessEntityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload>
          }
          deleteMany: {
            args: Prisma.BusinessEntityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BusinessEntityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BusinessEntityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessEntityPayload>
          }
          aggregate: {
            args: Prisma.BusinessEntityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBusinessEntity>
          }
          groupBy: {
            args: Prisma.BusinessEntityGroupByArgs<ExtArgs>
            result: $Utils.Optional<BusinessEntityGroupByOutputType>[]
          }
          count: {
            args: Prisma.BusinessEntityCountArgs<ExtArgs>
            result: $Utils.Optional<BusinessEntityCountAggregateOutputType> | number
          }
        }
      }
      OperatingUnit: {
        payload: Prisma.$OperatingUnitPayload<ExtArgs>
        fields: Prisma.OperatingUnitFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OperatingUnitFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OperatingUnitFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload>
          }
          findFirst: {
            args: Prisma.OperatingUnitFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OperatingUnitFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload>
          }
          findMany: {
            args: Prisma.OperatingUnitFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload>[]
          }
          create: {
            args: Prisma.OperatingUnitCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload>
          }
          createMany: {
            args: Prisma.OperatingUnitCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OperatingUnitCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload>[]
          }
          delete: {
            args: Prisma.OperatingUnitDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload>
          }
          update: {
            args: Prisma.OperatingUnitUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload>
          }
          deleteMany: {
            args: Prisma.OperatingUnitDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OperatingUnitUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OperatingUnitUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperatingUnitPayload>
          }
          aggregate: {
            args: Prisma.OperatingUnitAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOperatingUnit>
          }
          groupBy: {
            args: Prisma.OperatingUnitGroupByArgs<ExtArgs>
            result: $Utils.Optional<OperatingUnitGroupByOutputType>[]
          }
          count: {
            args: Prisma.OperatingUnitCountArgs<ExtArgs>
            result: $Utils.Optional<OperatingUnitCountAggregateOutputType> | number
          }
        }
      }
      Fleet: {
        payload: Prisma.$FleetPayload<ExtArgs>
        fields: Prisma.FleetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FleetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FleetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload>
          }
          findFirst: {
            args: Prisma.FleetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FleetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload>
          }
          findMany: {
            args: Prisma.FleetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload>[]
          }
          create: {
            args: Prisma.FleetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload>
          }
          createMany: {
            args: Prisma.FleetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FleetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload>[]
          }
          delete: {
            args: Prisma.FleetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload>
          }
          update: {
            args: Prisma.FleetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload>
          }
          deleteMany: {
            args: Prisma.FleetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FleetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FleetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FleetPayload>
          }
          aggregate: {
            args: Prisma.FleetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFleet>
          }
          groupBy: {
            args: Prisma.FleetGroupByArgs<ExtArgs>
            result: $Utils.Optional<FleetGroupByOutputType>[]
          }
          count: {
            args: Prisma.FleetCountArgs<ExtArgs>
            result: $Utils.Optional<FleetCountAggregateOutputType> | number
          }
        }
      }
      Driver: {
        payload: Prisma.$DriverPayload<ExtArgs>
        fields: Prisma.DriverFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DriverFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DriverFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          findFirst: {
            args: Prisma.DriverFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DriverFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          findMany: {
            args: Prisma.DriverFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[]
          }
          create: {
            args: Prisma.DriverCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          createMany: {
            args: Prisma.DriverCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DriverCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[]
          }
          delete: {
            args: Prisma.DriverDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          update: {
            args: Prisma.DriverUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          deleteMany: {
            args: Prisma.DriverDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DriverUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DriverUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          aggregate: {
            args: Prisma.DriverAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDriver>
          }
          groupBy: {
            args: Prisma.DriverGroupByArgs<ExtArgs>
            result: $Utils.Optional<DriverGroupByOutputType>[]
          }
          count: {
            args: Prisma.DriverCountArgs<ExtArgs>
            result: $Utils.Optional<DriverCountAggregateOutputType> | number
          }
        }
      }
      Vehicle: {
        payload: Prisma.$VehiclePayload<ExtArgs>
        fields: Prisma.VehicleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VehicleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VehicleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          findFirst: {
            args: Prisma.VehicleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VehicleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          findMany: {
            args: Prisma.VehicleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>[]
          }
          create: {
            args: Prisma.VehicleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          createMany: {
            args: Prisma.VehicleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VehicleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>[]
          }
          delete: {
            args: Prisma.VehicleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          update: {
            args: Prisma.VehicleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          deleteMany: {
            args: Prisma.VehicleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VehicleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.VehicleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          aggregate: {
            args: Prisma.VehicleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVehicle>
          }
          groupBy: {
            args: Prisma.VehicleGroupByArgs<ExtArgs>
            result: $Utils.Optional<VehicleGroupByOutputType>[]
          }
          count: {
            args: Prisma.VehicleCountArgs<ExtArgs>
            result: $Utils.Optional<VehicleCountAggregateOutputType> | number
          }
        }
      }
      Assignment: {
        payload: Prisma.$AssignmentPayload<ExtArgs>
        fields: Prisma.AssignmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssignmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssignmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>
          }
          findFirst: {
            args: Prisma.AssignmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssignmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>
          }
          findMany: {
            args: Prisma.AssignmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>[]
          }
          create: {
            args: Prisma.AssignmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>
          }
          createMany: {
            args: Prisma.AssignmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssignmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>[]
          }
          delete: {
            args: Prisma.AssignmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>
          }
          update: {
            args: Prisma.AssignmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>
          }
          deleteMany: {
            args: Prisma.AssignmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssignmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AssignmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>
          }
          aggregate: {
            args: Prisma.AssignmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssignment>
          }
          groupBy: {
            args: Prisma.AssignmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssignmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssignmentCountArgs<ExtArgs>
            result: $Utils.Optional<AssignmentCountAggregateOutputType> | number
          }
        }
      }
      Remittance: {
        payload: Prisma.$RemittancePayload<ExtArgs>
        fields: Prisma.RemittanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RemittanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RemittanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload>
          }
          findFirst: {
            args: Prisma.RemittanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RemittanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload>
          }
          findMany: {
            args: Prisma.RemittanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload>[]
          }
          create: {
            args: Prisma.RemittanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload>
          }
          createMany: {
            args: Prisma.RemittanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RemittanceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload>[]
          }
          delete: {
            args: Prisma.RemittanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload>
          }
          update: {
            args: Prisma.RemittanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload>
          }
          deleteMany: {
            args: Prisma.RemittanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RemittanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RemittanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RemittancePayload>
          }
          aggregate: {
            args: Prisma.RemittanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRemittance>
          }
          groupBy: {
            args: Prisma.RemittanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<RemittanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.RemittanceCountArgs<ExtArgs>
            result: $Utils.Optional<RemittanceCountAggregateOutputType> | number
          }
        }
      }
      OperationalWallet: {
        payload: Prisma.$OperationalWalletPayload<ExtArgs>
        fields: Prisma.OperationalWalletFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OperationalWalletFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OperationalWalletFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload>
          }
          findFirst: {
            args: Prisma.OperationalWalletFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OperationalWalletFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload>
          }
          findMany: {
            args: Prisma.OperationalWalletFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload>[]
          }
          create: {
            args: Prisma.OperationalWalletCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload>
          }
          createMany: {
            args: Prisma.OperationalWalletCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OperationalWalletCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload>[]
          }
          delete: {
            args: Prisma.OperationalWalletDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload>
          }
          update: {
            args: Prisma.OperationalWalletUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload>
          }
          deleteMany: {
            args: Prisma.OperationalWalletDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OperationalWalletUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OperationalWalletUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletPayload>
          }
          aggregate: {
            args: Prisma.OperationalWalletAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOperationalWallet>
          }
          groupBy: {
            args: Prisma.OperationalWalletGroupByArgs<ExtArgs>
            result: $Utils.Optional<OperationalWalletGroupByOutputType>[]
          }
          count: {
            args: Prisma.OperationalWalletCountArgs<ExtArgs>
            result: $Utils.Optional<OperationalWalletCountAggregateOutputType> | number
          }
        }
      }
      OperationalWalletEntry: {
        payload: Prisma.$OperationalWalletEntryPayload<ExtArgs>
        fields: Prisma.OperationalWalletEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OperationalWalletEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OperationalWalletEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload>
          }
          findFirst: {
            args: Prisma.OperationalWalletEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OperationalWalletEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload>
          }
          findMany: {
            args: Prisma.OperationalWalletEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload>[]
          }
          create: {
            args: Prisma.OperationalWalletEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload>
          }
          createMany: {
            args: Prisma.OperationalWalletEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OperationalWalletEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload>[]
          }
          delete: {
            args: Prisma.OperationalWalletEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload>
          }
          update: {
            args: Prisma.OperationalWalletEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload>
          }
          deleteMany: {
            args: Prisma.OperationalWalletEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OperationalWalletEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OperationalWalletEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalWalletEntryPayload>
          }
          aggregate: {
            args: Prisma.OperationalWalletEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOperationalWalletEntry>
          }
          groupBy: {
            args: Prisma.OperationalWalletEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<OperationalWalletEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.OperationalWalletEntryCountArgs<ExtArgs>
            result: $Utils.Optional<OperationalWalletEntryCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      AuthOtp: {
        payload: Prisma.$AuthOtpPayload<ExtArgs>
        fields: Prisma.AuthOtpFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuthOtpFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuthOtpFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload>
          }
          findFirst: {
            args: Prisma.AuthOtpFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuthOtpFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload>
          }
          findMany: {
            args: Prisma.AuthOtpFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload>[]
          }
          create: {
            args: Prisma.AuthOtpCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload>
          }
          createMany: {
            args: Prisma.AuthOtpCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuthOtpCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload>[]
          }
          delete: {
            args: Prisma.AuthOtpDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload>
          }
          update: {
            args: Prisma.AuthOtpUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload>
          }
          deleteMany: {
            args: Prisma.AuthOtpDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuthOtpUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AuthOtpUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthOtpPayload>
          }
          aggregate: {
            args: Prisma.AuthOtpAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuthOtp>
          }
          groupBy: {
            args: Prisma.AuthOtpGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuthOtpGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuthOtpCountArgs<ExtArgs>
            result: $Utils.Optional<AuthOtpCountAggregateOutputType> | number
          }
        }
      }
      PasswordResetToken: {
        payload: Prisma.$PasswordResetTokenPayload<ExtArgs>
        fields: Prisma.PasswordResetTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PasswordResetTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PasswordResetTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          findFirst: {
            args: Prisma.PasswordResetTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PasswordResetTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          findMany: {
            args: Prisma.PasswordResetTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>[]
          }
          create: {
            args: Prisma.PasswordResetTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          createMany: {
            args: Prisma.PasswordResetTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PasswordResetTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>[]
          }
          delete: {
            args: Prisma.PasswordResetTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          update: {
            args: Prisma.PasswordResetTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          deleteMany: {
            args: Prisma.PasswordResetTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PasswordResetTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PasswordResetTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          aggregate: {
            args: Prisma.PasswordResetTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePasswordResetToken>
          }
          groupBy: {
            args: Prisma.PasswordResetTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<PasswordResetTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.PasswordResetTokenCountArgs<ExtArgs>
            result: $Utils.Optional<PasswordResetTokenCountAggregateOutputType> | number
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
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    businessEntities: number
    users: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessEntities?: boolean | TenantCountOutputTypeCountBusinessEntitiesArgs
    users?: boolean | TenantCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountBusinessEntitiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BusinessEntityWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Count Type BusinessEntityCountOutputType
   */

  export type BusinessEntityCountOutputType = {
    operatingUnits: number
  }

  export type BusinessEntityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operatingUnits?: boolean | BusinessEntityCountOutputTypeCountOperatingUnitsArgs
  }

  // Custom InputTypes
  /**
   * BusinessEntityCountOutputType without action
   */
  export type BusinessEntityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntityCountOutputType
     */
    select?: BusinessEntityCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BusinessEntityCountOutputType without action
   */
  export type BusinessEntityCountOutputTypeCountOperatingUnitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OperatingUnitWhereInput
  }


  /**
   * Count Type OperatingUnitCountOutputType
   */

  export type OperatingUnitCountOutputType = {
    fleets: number
  }

  export type OperatingUnitCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fleets?: boolean | OperatingUnitCountOutputTypeCountFleetsArgs
  }

  // Custom InputTypes
  /**
   * OperatingUnitCountOutputType without action
   */
  export type OperatingUnitCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnitCountOutputType
     */
    select?: OperatingUnitCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OperatingUnitCountOutputType without action
   */
  export type OperatingUnitCountOutputTypeCountFleetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FleetWhereInput
  }


  /**
   * Count Type FleetCountOutputType
   */

  export type FleetCountOutputType = {
    drivers: number
    vehicles: number
  }

  export type FleetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    drivers?: boolean | FleetCountOutputTypeCountDriversArgs
    vehicles?: boolean | FleetCountOutputTypeCountVehiclesArgs
  }

  // Custom InputTypes
  /**
   * FleetCountOutputType without action
   */
  export type FleetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FleetCountOutputType
     */
    select?: FleetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FleetCountOutputType without action
   */
  export type FleetCountOutputTypeCountDriversArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DriverWhereInput
  }

  /**
   * FleetCountOutputType without action
   */
  export type FleetCountOutputTypeCountVehiclesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VehicleWhereInput
  }


  /**
   * Count Type OperationalWalletCountOutputType
   */

  export type OperationalWalletCountOutputType = {
    entries: number
  }

  export type OperationalWalletCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    entries?: boolean | OperationalWalletCountOutputTypeCountEntriesArgs
  }

  // Custom InputTypes
  /**
   * OperationalWalletCountOutputType without action
   */
  export type OperationalWalletCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletCountOutputType
     */
    select?: OperationalWalletCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OperationalWalletCountOutputType without action
   */
  export type OperationalWalletCountOutputTypeCountEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OperationalWalletEntryWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    authOtps: number
    passwordResetTokens: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    authOtps?: boolean | UserCountOutputTypeCountAuthOtpsArgs
    passwordResetTokens?: boolean | UserCountOutputTypeCountPasswordResetTokensArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAuthOtpsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthOtpWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPasswordResetTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PasswordResetTokenWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    slug: string | null
    name: string | null
    country: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    slug: string | null
    name: string | null
    country: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    slug: number
    name: number
    country: number
    status: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    country?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    country?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    country?: true
    status?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    slug: string
    name: string
    country: string
    status: string
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    country?: boolean
    status?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    businessEntities?: boolean | Tenant$businessEntitiesArgs<ExtArgs>
    users?: boolean | Tenant$usersArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    country?: boolean
    status?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    slug?: boolean
    name?: boolean
    country?: boolean
    status?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessEntities?: boolean | Tenant$businessEntitiesArgs<ExtArgs>
    users?: boolean | Tenant$usersArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      businessEntities: Prisma.$BusinessEntityPayload<ExtArgs>[]
      users: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      slug: string
      name: string
      country: string
      status: string
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
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
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businessEntities<T extends Tenant$businessEntitiesArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$businessEntitiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "findMany"> | Null>
    users<T extends Tenant$usersArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Tenant model
   */ 
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly country: FieldRef<"Tenant", 'String'>
    readonly status: FieldRef<"Tenant", 'String'>
    readonly metadata: FieldRef<"Tenant", 'Json'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly updatedAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
  }

  /**
   * Tenant.businessEntities
   */
  export type Tenant$businessEntitiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    where?: BusinessEntityWhereInput
    orderBy?: BusinessEntityOrderByWithRelationInput | BusinessEntityOrderByWithRelationInput[]
    cursor?: BusinessEntityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BusinessEntityScalarFieldEnum | BusinessEntityScalarFieldEnum[]
  }

  /**
   * Tenant.users
   */
  export type Tenant$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model BusinessEntity
   */

  export type AggregateBusinessEntity = {
    _count: BusinessEntityCountAggregateOutputType | null
    _min: BusinessEntityMinAggregateOutputType | null
    _max: BusinessEntityMaxAggregateOutputType | null
  }

  export type BusinessEntityMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    country: string | null
    businessModel: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BusinessEntityMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    country: string | null
    businessModel: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BusinessEntityCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    country: number
    businessModel: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BusinessEntityMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    country?: true
    businessModel?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BusinessEntityMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    country?: true
    businessModel?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BusinessEntityCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    country?: true
    businessModel?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BusinessEntityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BusinessEntity to aggregate.
     */
    where?: BusinessEntityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BusinessEntities to fetch.
     */
    orderBy?: BusinessEntityOrderByWithRelationInput | BusinessEntityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BusinessEntityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BusinessEntities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BusinessEntities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BusinessEntities
    **/
    _count?: true | BusinessEntityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BusinessEntityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BusinessEntityMaxAggregateInputType
  }

  export type GetBusinessEntityAggregateType<T extends BusinessEntityAggregateArgs> = {
        [P in keyof T & keyof AggregateBusinessEntity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBusinessEntity[P]>
      : GetScalarType<T[P], AggregateBusinessEntity[P]>
  }




  export type BusinessEntityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BusinessEntityWhereInput
    orderBy?: BusinessEntityOrderByWithAggregationInput | BusinessEntityOrderByWithAggregationInput[]
    by: BusinessEntityScalarFieldEnum[] | BusinessEntityScalarFieldEnum
    having?: BusinessEntityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BusinessEntityCountAggregateInputType | true
    _min?: BusinessEntityMinAggregateInputType
    _max?: BusinessEntityMaxAggregateInputType
  }

  export type BusinessEntityGroupByOutputType = {
    id: string
    tenantId: string
    name: string
    country: string
    businessModel: string
    status: string
    createdAt: Date
    updatedAt: Date
    _count: BusinessEntityCountAggregateOutputType | null
    _min: BusinessEntityMinAggregateOutputType | null
    _max: BusinessEntityMaxAggregateOutputType | null
  }

  type GetBusinessEntityGroupByPayload<T extends BusinessEntityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BusinessEntityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BusinessEntityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BusinessEntityGroupByOutputType[P]>
            : GetScalarType<T[P], BusinessEntityGroupByOutputType[P]>
        }
      >
    >


  export type BusinessEntitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    country?: boolean
    businessModel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    operatingUnits?: boolean | BusinessEntity$operatingUnitsArgs<ExtArgs>
    _count?: boolean | BusinessEntityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["businessEntity"]>

  export type BusinessEntitySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    country?: boolean
    businessModel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["businessEntity"]>

  export type BusinessEntitySelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    country?: boolean
    businessModel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BusinessEntityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    operatingUnits?: boolean | BusinessEntity$operatingUnitsArgs<ExtArgs>
    _count?: boolean | BusinessEntityCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BusinessEntityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $BusinessEntityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BusinessEntity"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      operatingUnits: Prisma.$OperatingUnitPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      name: string
      country: string
      businessModel: string
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["businessEntity"]>
    composites: {}
  }

  type BusinessEntityGetPayload<S extends boolean | null | undefined | BusinessEntityDefaultArgs> = $Result.GetResult<Prisma.$BusinessEntityPayload, S>

  type BusinessEntityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BusinessEntityFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BusinessEntityCountAggregateInputType | true
    }

  export interface BusinessEntityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BusinessEntity'], meta: { name: 'BusinessEntity' } }
    /**
     * Find zero or one BusinessEntity that matches the filter.
     * @param {BusinessEntityFindUniqueArgs} args - Arguments to find a BusinessEntity
     * @example
     * // Get one BusinessEntity
     * const businessEntity = await prisma.businessEntity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BusinessEntityFindUniqueArgs>(args: SelectSubset<T, BusinessEntityFindUniqueArgs<ExtArgs>>): Prisma__BusinessEntityClient<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one BusinessEntity that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BusinessEntityFindUniqueOrThrowArgs} args - Arguments to find a BusinessEntity
     * @example
     * // Get one BusinessEntity
     * const businessEntity = await prisma.businessEntity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BusinessEntityFindUniqueOrThrowArgs>(args: SelectSubset<T, BusinessEntityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BusinessEntityClient<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first BusinessEntity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessEntityFindFirstArgs} args - Arguments to find a BusinessEntity
     * @example
     * // Get one BusinessEntity
     * const businessEntity = await prisma.businessEntity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BusinessEntityFindFirstArgs>(args?: SelectSubset<T, BusinessEntityFindFirstArgs<ExtArgs>>): Prisma__BusinessEntityClient<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first BusinessEntity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessEntityFindFirstOrThrowArgs} args - Arguments to find a BusinessEntity
     * @example
     * // Get one BusinessEntity
     * const businessEntity = await prisma.businessEntity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BusinessEntityFindFirstOrThrowArgs>(args?: SelectSubset<T, BusinessEntityFindFirstOrThrowArgs<ExtArgs>>): Prisma__BusinessEntityClient<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more BusinessEntities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessEntityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BusinessEntities
     * const businessEntities = await prisma.businessEntity.findMany()
     * 
     * // Get first 10 BusinessEntities
     * const businessEntities = await prisma.businessEntity.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const businessEntityWithIdOnly = await prisma.businessEntity.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BusinessEntityFindManyArgs>(args?: SelectSubset<T, BusinessEntityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a BusinessEntity.
     * @param {BusinessEntityCreateArgs} args - Arguments to create a BusinessEntity.
     * @example
     * // Create one BusinessEntity
     * const BusinessEntity = await prisma.businessEntity.create({
     *   data: {
     *     // ... data to create a BusinessEntity
     *   }
     * })
     * 
     */
    create<T extends BusinessEntityCreateArgs>(args: SelectSubset<T, BusinessEntityCreateArgs<ExtArgs>>): Prisma__BusinessEntityClient<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many BusinessEntities.
     * @param {BusinessEntityCreateManyArgs} args - Arguments to create many BusinessEntities.
     * @example
     * // Create many BusinessEntities
     * const businessEntity = await prisma.businessEntity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BusinessEntityCreateManyArgs>(args?: SelectSubset<T, BusinessEntityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BusinessEntities and returns the data saved in the database.
     * @param {BusinessEntityCreateManyAndReturnArgs} args - Arguments to create many BusinessEntities.
     * @example
     * // Create many BusinessEntities
     * const businessEntity = await prisma.businessEntity.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BusinessEntities and only return the `id`
     * const businessEntityWithIdOnly = await prisma.businessEntity.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BusinessEntityCreateManyAndReturnArgs>(args?: SelectSubset<T, BusinessEntityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a BusinessEntity.
     * @param {BusinessEntityDeleteArgs} args - Arguments to delete one BusinessEntity.
     * @example
     * // Delete one BusinessEntity
     * const BusinessEntity = await prisma.businessEntity.delete({
     *   where: {
     *     // ... filter to delete one BusinessEntity
     *   }
     * })
     * 
     */
    delete<T extends BusinessEntityDeleteArgs>(args: SelectSubset<T, BusinessEntityDeleteArgs<ExtArgs>>): Prisma__BusinessEntityClient<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one BusinessEntity.
     * @param {BusinessEntityUpdateArgs} args - Arguments to update one BusinessEntity.
     * @example
     * // Update one BusinessEntity
     * const businessEntity = await prisma.businessEntity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BusinessEntityUpdateArgs>(args: SelectSubset<T, BusinessEntityUpdateArgs<ExtArgs>>): Prisma__BusinessEntityClient<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more BusinessEntities.
     * @param {BusinessEntityDeleteManyArgs} args - Arguments to filter BusinessEntities to delete.
     * @example
     * // Delete a few BusinessEntities
     * const { count } = await prisma.businessEntity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BusinessEntityDeleteManyArgs>(args?: SelectSubset<T, BusinessEntityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BusinessEntities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessEntityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BusinessEntities
     * const businessEntity = await prisma.businessEntity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BusinessEntityUpdateManyArgs>(args: SelectSubset<T, BusinessEntityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one BusinessEntity.
     * @param {BusinessEntityUpsertArgs} args - Arguments to update or create a BusinessEntity.
     * @example
     * // Update or create a BusinessEntity
     * const businessEntity = await prisma.businessEntity.upsert({
     *   create: {
     *     // ... data to create a BusinessEntity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BusinessEntity we want to update
     *   }
     * })
     */
    upsert<T extends BusinessEntityUpsertArgs>(args: SelectSubset<T, BusinessEntityUpsertArgs<ExtArgs>>): Prisma__BusinessEntityClient<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of BusinessEntities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessEntityCountArgs} args - Arguments to filter BusinessEntities to count.
     * @example
     * // Count the number of BusinessEntities
     * const count = await prisma.businessEntity.count({
     *   where: {
     *     // ... the filter for the BusinessEntities we want to count
     *   }
     * })
    **/
    count<T extends BusinessEntityCountArgs>(
      args?: Subset<T, BusinessEntityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BusinessEntityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BusinessEntity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessEntityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BusinessEntityAggregateArgs>(args: Subset<T, BusinessEntityAggregateArgs>): Prisma.PrismaPromise<GetBusinessEntityAggregateType<T>>

    /**
     * Group by BusinessEntity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessEntityGroupByArgs} args - Group by arguments.
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
      T extends BusinessEntityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BusinessEntityGroupByArgs['orderBy'] }
        : { orderBy?: BusinessEntityGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, BusinessEntityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBusinessEntityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BusinessEntity model
   */
  readonly fields: BusinessEntityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BusinessEntity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BusinessEntityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    operatingUnits<T extends BusinessEntity$operatingUnitsArgs<ExtArgs> = {}>(args?: Subset<T, BusinessEntity$operatingUnitsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the BusinessEntity model
   */ 
  interface BusinessEntityFieldRefs {
    readonly id: FieldRef<"BusinessEntity", 'String'>
    readonly tenantId: FieldRef<"BusinessEntity", 'String'>
    readonly name: FieldRef<"BusinessEntity", 'String'>
    readonly country: FieldRef<"BusinessEntity", 'String'>
    readonly businessModel: FieldRef<"BusinessEntity", 'String'>
    readonly status: FieldRef<"BusinessEntity", 'String'>
    readonly createdAt: FieldRef<"BusinessEntity", 'DateTime'>
    readonly updatedAt: FieldRef<"BusinessEntity", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BusinessEntity findUnique
   */
  export type BusinessEntityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    /**
     * Filter, which BusinessEntity to fetch.
     */
    where: BusinessEntityWhereUniqueInput
  }

  /**
   * BusinessEntity findUniqueOrThrow
   */
  export type BusinessEntityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    /**
     * Filter, which BusinessEntity to fetch.
     */
    where: BusinessEntityWhereUniqueInput
  }

  /**
   * BusinessEntity findFirst
   */
  export type BusinessEntityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    /**
     * Filter, which BusinessEntity to fetch.
     */
    where?: BusinessEntityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BusinessEntities to fetch.
     */
    orderBy?: BusinessEntityOrderByWithRelationInput | BusinessEntityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BusinessEntities.
     */
    cursor?: BusinessEntityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BusinessEntities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BusinessEntities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BusinessEntities.
     */
    distinct?: BusinessEntityScalarFieldEnum | BusinessEntityScalarFieldEnum[]
  }

  /**
   * BusinessEntity findFirstOrThrow
   */
  export type BusinessEntityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    /**
     * Filter, which BusinessEntity to fetch.
     */
    where?: BusinessEntityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BusinessEntities to fetch.
     */
    orderBy?: BusinessEntityOrderByWithRelationInput | BusinessEntityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BusinessEntities.
     */
    cursor?: BusinessEntityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BusinessEntities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BusinessEntities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BusinessEntities.
     */
    distinct?: BusinessEntityScalarFieldEnum | BusinessEntityScalarFieldEnum[]
  }

  /**
   * BusinessEntity findMany
   */
  export type BusinessEntityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    /**
     * Filter, which BusinessEntities to fetch.
     */
    where?: BusinessEntityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BusinessEntities to fetch.
     */
    orderBy?: BusinessEntityOrderByWithRelationInput | BusinessEntityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BusinessEntities.
     */
    cursor?: BusinessEntityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BusinessEntities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BusinessEntities.
     */
    skip?: number
    distinct?: BusinessEntityScalarFieldEnum | BusinessEntityScalarFieldEnum[]
  }

  /**
   * BusinessEntity create
   */
  export type BusinessEntityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    /**
     * The data needed to create a BusinessEntity.
     */
    data: XOR<BusinessEntityCreateInput, BusinessEntityUncheckedCreateInput>
  }

  /**
   * BusinessEntity createMany
   */
  export type BusinessEntityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BusinessEntities.
     */
    data: BusinessEntityCreateManyInput | BusinessEntityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BusinessEntity createManyAndReturn
   */
  export type BusinessEntityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many BusinessEntities.
     */
    data: BusinessEntityCreateManyInput | BusinessEntityCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BusinessEntity update
   */
  export type BusinessEntityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    /**
     * The data needed to update a BusinessEntity.
     */
    data: XOR<BusinessEntityUpdateInput, BusinessEntityUncheckedUpdateInput>
    /**
     * Choose, which BusinessEntity to update.
     */
    where: BusinessEntityWhereUniqueInput
  }

  /**
   * BusinessEntity updateMany
   */
  export type BusinessEntityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BusinessEntities.
     */
    data: XOR<BusinessEntityUpdateManyMutationInput, BusinessEntityUncheckedUpdateManyInput>
    /**
     * Filter which BusinessEntities to update
     */
    where?: BusinessEntityWhereInput
  }

  /**
   * BusinessEntity upsert
   */
  export type BusinessEntityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    /**
     * The filter to search for the BusinessEntity to update in case it exists.
     */
    where: BusinessEntityWhereUniqueInput
    /**
     * In case the BusinessEntity found by the `where` argument doesn't exist, create a new BusinessEntity with this data.
     */
    create: XOR<BusinessEntityCreateInput, BusinessEntityUncheckedCreateInput>
    /**
     * In case the BusinessEntity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BusinessEntityUpdateInput, BusinessEntityUncheckedUpdateInput>
  }

  /**
   * BusinessEntity delete
   */
  export type BusinessEntityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
    /**
     * Filter which BusinessEntity to delete.
     */
    where: BusinessEntityWhereUniqueInput
  }

  /**
   * BusinessEntity deleteMany
   */
  export type BusinessEntityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BusinessEntities to delete
     */
    where?: BusinessEntityWhereInput
  }

  /**
   * BusinessEntity.operatingUnits
   */
  export type BusinessEntity$operatingUnitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    where?: OperatingUnitWhereInput
    orderBy?: OperatingUnitOrderByWithRelationInput | OperatingUnitOrderByWithRelationInput[]
    cursor?: OperatingUnitWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OperatingUnitScalarFieldEnum | OperatingUnitScalarFieldEnum[]
  }

  /**
   * BusinessEntity without action
   */
  export type BusinessEntityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessEntity
     */
    select?: BusinessEntitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessEntityInclude<ExtArgs> | null
  }


  /**
   * Model OperatingUnit
   */

  export type AggregateOperatingUnit = {
    _count: OperatingUnitCountAggregateOutputType | null
    _min: OperatingUnitMinAggregateOutputType | null
    _max: OperatingUnitMaxAggregateOutputType | null
  }

  export type OperatingUnitMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    businessEntityId: string | null
    name: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OperatingUnitMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    businessEntityId: string | null
    name: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OperatingUnitCountAggregateOutputType = {
    id: number
    tenantId: number
    businessEntityId: number
    name: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OperatingUnitMinAggregateInputType = {
    id?: true
    tenantId?: true
    businessEntityId?: true
    name?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OperatingUnitMaxAggregateInputType = {
    id?: true
    tenantId?: true
    businessEntityId?: true
    name?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OperatingUnitCountAggregateInputType = {
    id?: true
    tenantId?: true
    businessEntityId?: true
    name?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OperatingUnitAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OperatingUnit to aggregate.
     */
    where?: OperatingUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperatingUnits to fetch.
     */
    orderBy?: OperatingUnitOrderByWithRelationInput | OperatingUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OperatingUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperatingUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperatingUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OperatingUnits
    **/
    _count?: true | OperatingUnitCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OperatingUnitMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OperatingUnitMaxAggregateInputType
  }

  export type GetOperatingUnitAggregateType<T extends OperatingUnitAggregateArgs> = {
        [P in keyof T & keyof AggregateOperatingUnit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOperatingUnit[P]>
      : GetScalarType<T[P], AggregateOperatingUnit[P]>
  }




  export type OperatingUnitGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OperatingUnitWhereInput
    orderBy?: OperatingUnitOrderByWithAggregationInput | OperatingUnitOrderByWithAggregationInput[]
    by: OperatingUnitScalarFieldEnum[] | OperatingUnitScalarFieldEnum
    having?: OperatingUnitScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OperatingUnitCountAggregateInputType | true
    _min?: OperatingUnitMinAggregateInputType
    _max?: OperatingUnitMaxAggregateInputType
  }

  export type OperatingUnitGroupByOutputType = {
    id: string
    tenantId: string
    businessEntityId: string
    name: string
    status: string
    createdAt: Date
    updatedAt: Date
    _count: OperatingUnitCountAggregateOutputType | null
    _min: OperatingUnitMinAggregateOutputType | null
    _max: OperatingUnitMaxAggregateOutputType | null
  }

  type GetOperatingUnitGroupByPayload<T extends OperatingUnitGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OperatingUnitGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OperatingUnitGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OperatingUnitGroupByOutputType[P]>
            : GetScalarType<T[P], OperatingUnitGroupByOutputType[P]>
        }
      >
    >


  export type OperatingUnitSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    businessEntityId?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    businessEntity?: boolean | BusinessEntityDefaultArgs<ExtArgs>
    fleets?: boolean | OperatingUnit$fleetsArgs<ExtArgs>
    _count?: boolean | OperatingUnitCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operatingUnit"]>

  export type OperatingUnitSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    businessEntityId?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    businessEntity?: boolean | BusinessEntityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operatingUnit"]>

  export type OperatingUnitSelectScalar = {
    id?: boolean
    tenantId?: boolean
    businessEntityId?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OperatingUnitInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessEntity?: boolean | BusinessEntityDefaultArgs<ExtArgs>
    fleets?: boolean | OperatingUnit$fleetsArgs<ExtArgs>
    _count?: boolean | OperatingUnitCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OperatingUnitIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessEntity?: boolean | BusinessEntityDefaultArgs<ExtArgs>
  }

  export type $OperatingUnitPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OperatingUnit"
    objects: {
      businessEntity: Prisma.$BusinessEntityPayload<ExtArgs>
      fleets: Prisma.$FleetPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      businessEntityId: string
      name: string
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["operatingUnit"]>
    composites: {}
  }

  type OperatingUnitGetPayload<S extends boolean | null | undefined | OperatingUnitDefaultArgs> = $Result.GetResult<Prisma.$OperatingUnitPayload, S>

  type OperatingUnitCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OperatingUnitFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OperatingUnitCountAggregateInputType | true
    }

  export interface OperatingUnitDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OperatingUnit'], meta: { name: 'OperatingUnit' } }
    /**
     * Find zero or one OperatingUnit that matches the filter.
     * @param {OperatingUnitFindUniqueArgs} args - Arguments to find a OperatingUnit
     * @example
     * // Get one OperatingUnit
     * const operatingUnit = await prisma.operatingUnit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OperatingUnitFindUniqueArgs>(args: SelectSubset<T, OperatingUnitFindUniqueArgs<ExtArgs>>): Prisma__OperatingUnitClient<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OperatingUnit that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OperatingUnitFindUniqueOrThrowArgs} args - Arguments to find a OperatingUnit
     * @example
     * // Get one OperatingUnit
     * const operatingUnit = await prisma.operatingUnit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OperatingUnitFindUniqueOrThrowArgs>(args: SelectSubset<T, OperatingUnitFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OperatingUnitClient<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OperatingUnit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperatingUnitFindFirstArgs} args - Arguments to find a OperatingUnit
     * @example
     * // Get one OperatingUnit
     * const operatingUnit = await prisma.operatingUnit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OperatingUnitFindFirstArgs>(args?: SelectSubset<T, OperatingUnitFindFirstArgs<ExtArgs>>): Prisma__OperatingUnitClient<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OperatingUnit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperatingUnitFindFirstOrThrowArgs} args - Arguments to find a OperatingUnit
     * @example
     * // Get one OperatingUnit
     * const operatingUnit = await prisma.operatingUnit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OperatingUnitFindFirstOrThrowArgs>(args?: SelectSubset<T, OperatingUnitFindFirstOrThrowArgs<ExtArgs>>): Prisma__OperatingUnitClient<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OperatingUnits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperatingUnitFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OperatingUnits
     * const operatingUnits = await prisma.operatingUnit.findMany()
     * 
     * // Get first 10 OperatingUnits
     * const operatingUnits = await prisma.operatingUnit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const operatingUnitWithIdOnly = await prisma.operatingUnit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OperatingUnitFindManyArgs>(args?: SelectSubset<T, OperatingUnitFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OperatingUnit.
     * @param {OperatingUnitCreateArgs} args - Arguments to create a OperatingUnit.
     * @example
     * // Create one OperatingUnit
     * const OperatingUnit = await prisma.operatingUnit.create({
     *   data: {
     *     // ... data to create a OperatingUnit
     *   }
     * })
     * 
     */
    create<T extends OperatingUnitCreateArgs>(args: SelectSubset<T, OperatingUnitCreateArgs<ExtArgs>>): Prisma__OperatingUnitClient<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OperatingUnits.
     * @param {OperatingUnitCreateManyArgs} args - Arguments to create many OperatingUnits.
     * @example
     * // Create many OperatingUnits
     * const operatingUnit = await prisma.operatingUnit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OperatingUnitCreateManyArgs>(args?: SelectSubset<T, OperatingUnitCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OperatingUnits and returns the data saved in the database.
     * @param {OperatingUnitCreateManyAndReturnArgs} args - Arguments to create many OperatingUnits.
     * @example
     * // Create many OperatingUnits
     * const operatingUnit = await prisma.operatingUnit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OperatingUnits and only return the `id`
     * const operatingUnitWithIdOnly = await prisma.operatingUnit.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OperatingUnitCreateManyAndReturnArgs>(args?: SelectSubset<T, OperatingUnitCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OperatingUnit.
     * @param {OperatingUnitDeleteArgs} args - Arguments to delete one OperatingUnit.
     * @example
     * // Delete one OperatingUnit
     * const OperatingUnit = await prisma.operatingUnit.delete({
     *   where: {
     *     // ... filter to delete one OperatingUnit
     *   }
     * })
     * 
     */
    delete<T extends OperatingUnitDeleteArgs>(args: SelectSubset<T, OperatingUnitDeleteArgs<ExtArgs>>): Prisma__OperatingUnitClient<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OperatingUnit.
     * @param {OperatingUnitUpdateArgs} args - Arguments to update one OperatingUnit.
     * @example
     * // Update one OperatingUnit
     * const operatingUnit = await prisma.operatingUnit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OperatingUnitUpdateArgs>(args: SelectSubset<T, OperatingUnitUpdateArgs<ExtArgs>>): Prisma__OperatingUnitClient<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OperatingUnits.
     * @param {OperatingUnitDeleteManyArgs} args - Arguments to filter OperatingUnits to delete.
     * @example
     * // Delete a few OperatingUnits
     * const { count } = await prisma.operatingUnit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OperatingUnitDeleteManyArgs>(args?: SelectSubset<T, OperatingUnitDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OperatingUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperatingUnitUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OperatingUnits
     * const operatingUnit = await prisma.operatingUnit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OperatingUnitUpdateManyArgs>(args: SelectSubset<T, OperatingUnitUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OperatingUnit.
     * @param {OperatingUnitUpsertArgs} args - Arguments to update or create a OperatingUnit.
     * @example
     * // Update or create a OperatingUnit
     * const operatingUnit = await prisma.operatingUnit.upsert({
     *   create: {
     *     // ... data to create a OperatingUnit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OperatingUnit we want to update
     *   }
     * })
     */
    upsert<T extends OperatingUnitUpsertArgs>(args: SelectSubset<T, OperatingUnitUpsertArgs<ExtArgs>>): Prisma__OperatingUnitClient<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OperatingUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperatingUnitCountArgs} args - Arguments to filter OperatingUnits to count.
     * @example
     * // Count the number of OperatingUnits
     * const count = await prisma.operatingUnit.count({
     *   where: {
     *     // ... the filter for the OperatingUnits we want to count
     *   }
     * })
    **/
    count<T extends OperatingUnitCountArgs>(
      args?: Subset<T, OperatingUnitCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OperatingUnitCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OperatingUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperatingUnitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OperatingUnitAggregateArgs>(args: Subset<T, OperatingUnitAggregateArgs>): Prisma.PrismaPromise<GetOperatingUnitAggregateType<T>>

    /**
     * Group by OperatingUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperatingUnitGroupByArgs} args - Group by arguments.
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
      T extends OperatingUnitGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OperatingUnitGroupByArgs['orderBy'] }
        : { orderBy?: OperatingUnitGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OperatingUnitGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOperatingUnitGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OperatingUnit model
   */
  readonly fields: OperatingUnitFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OperatingUnit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OperatingUnitClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businessEntity<T extends BusinessEntityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BusinessEntityDefaultArgs<ExtArgs>>): Prisma__BusinessEntityClient<$Result.GetResult<Prisma.$BusinessEntityPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    fleets<T extends OperatingUnit$fleetsArgs<ExtArgs> = {}>(args?: Subset<T, OperatingUnit$fleetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the OperatingUnit model
   */ 
  interface OperatingUnitFieldRefs {
    readonly id: FieldRef<"OperatingUnit", 'String'>
    readonly tenantId: FieldRef<"OperatingUnit", 'String'>
    readonly businessEntityId: FieldRef<"OperatingUnit", 'String'>
    readonly name: FieldRef<"OperatingUnit", 'String'>
    readonly status: FieldRef<"OperatingUnit", 'String'>
    readonly createdAt: FieldRef<"OperatingUnit", 'DateTime'>
    readonly updatedAt: FieldRef<"OperatingUnit", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OperatingUnit findUnique
   */
  export type OperatingUnitFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    /**
     * Filter, which OperatingUnit to fetch.
     */
    where: OperatingUnitWhereUniqueInput
  }

  /**
   * OperatingUnit findUniqueOrThrow
   */
  export type OperatingUnitFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    /**
     * Filter, which OperatingUnit to fetch.
     */
    where: OperatingUnitWhereUniqueInput
  }

  /**
   * OperatingUnit findFirst
   */
  export type OperatingUnitFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    /**
     * Filter, which OperatingUnit to fetch.
     */
    where?: OperatingUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperatingUnits to fetch.
     */
    orderBy?: OperatingUnitOrderByWithRelationInput | OperatingUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OperatingUnits.
     */
    cursor?: OperatingUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperatingUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperatingUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OperatingUnits.
     */
    distinct?: OperatingUnitScalarFieldEnum | OperatingUnitScalarFieldEnum[]
  }

  /**
   * OperatingUnit findFirstOrThrow
   */
  export type OperatingUnitFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    /**
     * Filter, which OperatingUnit to fetch.
     */
    where?: OperatingUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperatingUnits to fetch.
     */
    orderBy?: OperatingUnitOrderByWithRelationInput | OperatingUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OperatingUnits.
     */
    cursor?: OperatingUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperatingUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperatingUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OperatingUnits.
     */
    distinct?: OperatingUnitScalarFieldEnum | OperatingUnitScalarFieldEnum[]
  }

  /**
   * OperatingUnit findMany
   */
  export type OperatingUnitFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    /**
     * Filter, which OperatingUnits to fetch.
     */
    where?: OperatingUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperatingUnits to fetch.
     */
    orderBy?: OperatingUnitOrderByWithRelationInput | OperatingUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OperatingUnits.
     */
    cursor?: OperatingUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperatingUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperatingUnits.
     */
    skip?: number
    distinct?: OperatingUnitScalarFieldEnum | OperatingUnitScalarFieldEnum[]
  }

  /**
   * OperatingUnit create
   */
  export type OperatingUnitCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    /**
     * The data needed to create a OperatingUnit.
     */
    data: XOR<OperatingUnitCreateInput, OperatingUnitUncheckedCreateInput>
  }

  /**
   * OperatingUnit createMany
   */
  export type OperatingUnitCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OperatingUnits.
     */
    data: OperatingUnitCreateManyInput | OperatingUnitCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OperatingUnit createManyAndReturn
   */
  export type OperatingUnitCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OperatingUnits.
     */
    data: OperatingUnitCreateManyInput | OperatingUnitCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OperatingUnit update
   */
  export type OperatingUnitUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    /**
     * The data needed to update a OperatingUnit.
     */
    data: XOR<OperatingUnitUpdateInput, OperatingUnitUncheckedUpdateInput>
    /**
     * Choose, which OperatingUnit to update.
     */
    where: OperatingUnitWhereUniqueInput
  }

  /**
   * OperatingUnit updateMany
   */
  export type OperatingUnitUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OperatingUnits.
     */
    data: XOR<OperatingUnitUpdateManyMutationInput, OperatingUnitUncheckedUpdateManyInput>
    /**
     * Filter which OperatingUnits to update
     */
    where?: OperatingUnitWhereInput
  }

  /**
   * OperatingUnit upsert
   */
  export type OperatingUnitUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    /**
     * The filter to search for the OperatingUnit to update in case it exists.
     */
    where: OperatingUnitWhereUniqueInput
    /**
     * In case the OperatingUnit found by the `where` argument doesn't exist, create a new OperatingUnit with this data.
     */
    create: XOR<OperatingUnitCreateInput, OperatingUnitUncheckedCreateInput>
    /**
     * In case the OperatingUnit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OperatingUnitUpdateInput, OperatingUnitUncheckedUpdateInput>
  }

  /**
   * OperatingUnit delete
   */
  export type OperatingUnitDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
    /**
     * Filter which OperatingUnit to delete.
     */
    where: OperatingUnitWhereUniqueInput
  }

  /**
   * OperatingUnit deleteMany
   */
  export type OperatingUnitDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OperatingUnits to delete
     */
    where?: OperatingUnitWhereInput
  }

  /**
   * OperatingUnit.fleets
   */
  export type OperatingUnit$fleetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    where?: FleetWhereInput
    orderBy?: FleetOrderByWithRelationInput | FleetOrderByWithRelationInput[]
    cursor?: FleetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FleetScalarFieldEnum | FleetScalarFieldEnum[]
  }

  /**
   * OperatingUnit without action
   */
  export type OperatingUnitDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatingUnit
     */
    select?: OperatingUnitSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperatingUnitInclude<ExtArgs> | null
  }


  /**
   * Model Fleet
   */

  export type AggregateFleet = {
    _count: FleetCountAggregateOutputType | null
    _min: FleetMinAggregateOutputType | null
    _max: FleetMaxAggregateOutputType | null
  }

  export type FleetMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    operatingUnitId: string | null
    name: string | null
    businessModel: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FleetMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    operatingUnitId: string | null
    name: string | null
    businessModel: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FleetCountAggregateOutputType = {
    id: number
    tenantId: number
    operatingUnitId: number
    name: number
    businessModel: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FleetMinAggregateInputType = {
    id?: true
    tenantId?: true
    operatingUnitId?: true
    name?: true
    businessModel?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FleetMaxAggregateInputType = {
    id?: true
    tenantId?: true
    operatingUnitId?: true
    name?: true
    businessModel?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FleetCountAggregateInputType = {
    id?: true
    tenantId?: true
    operatingUnitId?: true
    name?: true
    businessModel?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FleetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Fleet to aggregate.
     */
    where?: FleetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fleets to fetch.
     */
    orderBy?: FleetOrderByWithRelationInput | FleetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FleetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fleets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fleets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Fleets
    **/
    _count?: true | FleetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FleetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FleetMaxAggregateInputType
  }

  export type GetFleetAggregateType<T extends FleetAggregateArgs> = {
        [P in keyof T & keyof AggregateFleet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFleet[P]>
      : GetScalarType<T[P], AggregateFleet[P]>
  }




  export type FleetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FleetWhereInput
    orderBy?: FleetOrderByWithAggregationInput | FleetOrderByWithAggregationInput[]
    by: FleetScalarFieldEnum[] | FleetScalarFieldEnum
    having?: FleetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FleetCountAggregateInputType | true
    _min?: FleetMinAggregateInputType
    _max?: FleetMaxAggregateInputType
  }

  export type FleetGroupByOutputType = {
    id: string
    tenantId: string
    operatingUnitId: string
    name: string
    businessModel: string
    status: string
    createdAt: Date
    updatedAt: Date
    _count: FleetCountAggregateOutputType | null
    _min: FleetMinAggregateOutputType | null
    _max: FleetMaxAggregateOutputType | null
  }

  type GetFleetGroupByPayload<T extends FleetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FleetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FleetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FleetGroupByOutputType[P]>
            : GetScalarType<T[P], FleetGroupByOutputType[P]>
        }
      >
    >


  export type FleetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    operatingUnitId?: boolean
    name?: boolean
    businessModel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    operatingUnit?: boolean | OperatingUnitDefaultArgs<ExtArgs>
    drivers?: boolean | Fleet$driversArgs<ExtArgs>
    vehicles?: boolean | Fleet$vehiclesArgs<ExtArgs>
    _count?: boolean | FleetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fleet"]>

  export type FleetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    operatingUnitId?: boolean
    name?: boolean
    businessModel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    operatingUnit?: boolean | OperatingUnitDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fleet"]>

  export type FleetSelectScalar = {
    id?: boolean
    tenantId?: boolean
    operatingUnitId?: boolean
    name?: boolean
    businessModel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FleetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operatingUnit?: boolean | OperatingUnitDefaultArgs<ExtArgs>
    drivers?: boolean | Fleet$driversArgs<ExtArgs>
    vehicles?: boolean | Fleet$vehiclesArgs<ExtArgs>
    _count?: boolean | FleetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FleetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operatingUnit?: boolean | OperatingUnitDefaultArgs<ExtArgs>
  }

  export type $FleetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Fleet"
    objects: {
      operatingUnit: Prisma.$OperatingUnitPayload<ExtArgs>
      drivers: Prisma.$DriverPayload<ExtArgs>[]
      vehicles: Prisma.$VehiclePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      operatingUnitId: string
      name: string
      businessModel: string
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["fleet"]>
    composites: {}
  }

  type FleetGetPayload<S extends boolean | null | undefined | FleetDefaultArgs> = $Result.GetResult<Prisma.$FleetPayload, S>

  type FleetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FleetFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FleetCountAggregateInputType | true
    }

  export interface FleetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Fleet'], meta: { name: 'Fleet' } }
    /**
     * Find zero or one Fleet that matches the filter.
     * @param {FleetFindUniqueArgs} args - Arguments to find a Fleet
     * @example
     * // Get one Fleet
     * const fleet = await prisma.fleet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FleetFindUniqueArgs>(args: SelectSubset<T, FleetFindUniqueArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Fleet that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FleetFindUniqueOrThrowArgs} args - Arguments to find a Fleet
     * @example
     * // Get one Fleet
     * const fleet = await prisma.fleet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FleetFindUniqueOrThrowArgs>(args: SelectSubset<T, FleetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Fleet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FleetFindFirstArgs} args - Arguments to find a Fleet
     * @example
     * // Get one Fleet
     * const fleet = await prisma.fleet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FleetFindFirstArgs>(args?: SelectSubset<T, FleetFindFirstArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Fleet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FleetFindFirstOrThrowArgs} args - Arguments to find a Fleet
     * @example
     * // Get one Fleet
     * const fleet = await prisma.fleet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FleetFindFirstOrThrowArgs>(args?: SelectSubset<T, FleetFindFirstOrThrowArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Fleets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FleetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Fleets
     * const fleets = await prisma.fleet.findMany()
     * 
     * // Get first 10 Fleets
     * const fleets = await prisma.fleet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fleetWithIdOnly = await prisma.fleet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FleetFindManyArgs>(args?: SelectSubset<T, FleetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Fleet.
     * @param {FleetCreateArgs} args - Arguments to create a Fleet.
     * @example
     * // Create one Fleet
     * const Fleet = await prisma.fleet.create({
     *   data: {
     *     // ... data to create a Fleet
     *   }
     * })
     * 
     */
    create<T extends FleetCreateArgs>(args: SelectSubset<T, FleetCreateArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Fleets.
     * @param {FleetCreateManyArgs} args - Arguments to create many Fleets.
     * @example
     * // Create many Fleets
     * const fleet = await prisma.fleet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FleetCreateManyArgs>(args?: SelectSubset<T, FleetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Fleets and returns the data saved in the database.
     * @param {FleetCreateManyAndReturnArgs} args - Arguments to create many Fleets.
     * @example
     * // Create many Fleets
     * const fleet = await prisma.fleet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Fleets and only return the `id`
     * const fleetWithIdOnly = await prisma.fleet.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FleetCreateManyAndReturnArgs>(args?: SelectSubset<T, FleetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Fleet.
     * @param {FleetDeleteArgs} args - Arguments to delete one Fleet.
     * @example
     * // Delete one Fleet
     * const Fleet = await prisma.fleet.delete({
     *   where: {
     *     // ... filter to delete one Fleet
     *   }
     * })
     * 
     */
    delete<T extends FleetDeleteArgs>(args: SelectSubset<T, FleetDeleteArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Fleet.
     * @param {FleetUpdateArgs} args - Arguments to update one Fleet.
     * @example
     * // Update one Fleet
     * const fleet = await prisma.fleet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FleetUpdateArgs>(args: SelectSubset<T, FleetUpdateArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Fleets.
     * @param {FleetDeleteManyArgs} args - Arguments to filter Fleets to delete.
     * @example
     * // Delete a few Fleets
     * const { count } = await prisma.fleet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FleetDeleteManyArgs>(args?: SelectSubset<T, FleetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Fleets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FleetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Fleets
     * const fleet = await prisma.fleet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FleetUpdateManyArgs>(args: SelectSubset<T, FleetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Fleet.
     * @param {FleetUpsertArgs} args - Arguments to update or create a Fleet.
     * @example
     * // Update or create a Fleet
     * const fleet = await prisma.fleet.upsert({
     *   create: {
     *     // ... data to create a Fleet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Fleet we want to update
     *   }
     * })
     */
    upsert<T extends FleetUpsertArgs>(args: SelectSubset<T, FleetUpsertArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Fleets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FleetCountArgs} args - Arguments to filter Fleets to count.
     * @example
     * // Count the number of Fleets
     * const count = await prisma.fleet.count({
     *   where: {
     *     // ... the filter for the Fleets we want to count
     *   }
     * })
    **/
    count<T extends FleetCountArgs>(
      args?: Subset<T, FleetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FleetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Fleet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FleetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FleetAggregateArgs>(args: Subset<T, FleetAggregateArgs>): Prisma.PrismaPromise<GetFleetAggregateType<T>>

    /**
     * Group by Fleet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FleetGroupByArgs} args - Group by arguments.
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
      T extends FleetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FleetGroupByArgs['orderBy'] }
        : { orderBy?: FleetGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FleetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFleetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Fleet model
   */
  readonly fields: FleetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Fleet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FleetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    operatingUnit<T extends OperatingUnitDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OperatingUnitDefaultArgs<ExtArgs>>): Prisma__OperatingUnitClient<$Result.GetResult<Prisma.$OperatingUnitPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    drivers<T extends Fleet$driversArgs<ExtArgs> = {}>(args?: Subset<T, Fleet$driversArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findMany"> | Null>
    vehicles<T extends Fleet$vehiclesArgs<ExtArgs> = {}>(args?: Subset<T, Fleet$vehiclesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Fleet model
   */ 
  interface FleetFieldRefs {
    readonly id: FieldRef<"Fleet", 'String'>
    readonly tenantId: FieldRef<"Fleet", 'String'>
    readonly operatingUnitId: FieldRef<"Fleet", 'String'>
    readonly name: FieldRef<"Fleet", 'String'>
    readonly businessModel: FieldRef<"Fleet", 'String'>
    readonly status: FieldRef<"Fleet", 'String'>
    readonly createdAt: FieldRef<"Fleet", 'DateTime'>
    readonly updatedAt: FieldRef<"Fleet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Fleet findUnique
   */
  export type FleetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    /**
     * Filter, which Fleet to fetch.
     */
    where: FleetWhereUniqueInput
  }

  /**
   * Fleet findUniqueOrThrow
   */
  export type FleetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    /**
     * Filter, which Fleet to fetch.
     */
    where: FleetWhereUniqueInput
  }

  /**
   * Fleet findFirst
   */
  export type FleetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    /**
     * Filter, which Fleet to fetch.
     */
    where?: FleetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fleets to fetch.
     */
    orderBy?: FleetOrderByWithRelationInput | FleetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Fleets.
     */
    cursor?: FleetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fleets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fleets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Fleets.
     */
    distinct?: FleetScalarFieldEnum | FleetScalarFieldEnum[]
  }

  /**
   * Fleet findFirstOrThrow
   */
  export type FleetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    /**
     * Filter, which Fleet to fetch.
     */
    where?: FleetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fleets to fetch.
     */
    orderBy?: FleetOrderByWithRelationInput | FleetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Fleets.
     */
    cursor?: FleetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fleets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fleets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Fleets.
     */
    distinct?: FleetScalarFieldEnum | FleetScalarFieldEnum[]
  }

  /**
   * Fleet findMany
   */
  export type FleetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    /**
     * Filter, which Fleets to fetch.
     */
    where?: FleetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fleets to fetch.
     */
    orderBy?: FleetOrderByWithRelationInput | FleetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Fleets.
     */
    cursor?: FleetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fleets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fleets.
     */
    skip?: number
    distinct?: FleetScalarFieldEnum | FleetScalarFieldEnum[]
  }

  /**
   * Fleet create
   */
  export type FleetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    /**
     * The data needed to create a Fleet.
     */
    data: XOR<FleetCreateInput, FleetUncheckedCreateInput>
  }

  /**
   * Fleet createMany
   */
  export type FleetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Fleets.
     */
    data: FleetCreateManyInput | FleetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Fleet createManyAndReturn
   */
  export type FleetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Fleets.
     */
    data: FleetCreateManyInput | FleetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Fleet update
   */
  export type FleetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    /**
     * The data needed to update a Fleet.
     */
    data: XOR<FleetUpdateInput, FleetUncheckedUpdateInput>
    /**
     * Choose, which Fleet to update.
     */
    where: FleetWhereUniqueInput
  }

  /**
   * Fleet updateMany
   */
  export type FleetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Fleets.
     */
    data: XOR<FleetUpdateManyMutationInput, FleetUncheckedUpdateManyInput>
    /**
     * Filter which Fleets to update
     */
    where?: FleetWhereInput
  }

  /**
   * Fleet upsert
   */
  export type FleetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    /**
     * The filter to search for the Fleet to update in case it exists.
     */
    where: FleetWhereUniqueInput
    /**
     * In case the Fleet found by the `where` argument doesn't exist, create a new Fleet with this data.
     */
    create: XOR<FleetCreateInput, FleetUncheckedCreateInput>
    /**
     * In case the Fleet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FleetUpdateInput, FleetUncheckedUpdateInput>
  }

  /**
   * Fleet delete
   */
  export type FleetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
    /**
     * Filter which Fleet to delete.
     */
    where: FleetWhereUniqueInput
  }

  /**
   * Fleet deleteMany
   */
  export type FleetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Fleets to delete
     */
    where?: FleetWhereInput
  }

  /**
   * Fleet.drivers
   */
  export type Fleet$driversArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    where?: DriverWhereInput
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    cursor?: DriverWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Fleet.vehicles
   */
  export type Fleet$vehiclesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    where?: VehicleWhereInput
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    cursor?: VehicleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Fleet without action
   */
  export type FleetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fleet
     */
    select?: FleetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FleetInclude<ExtArgs> | null
  }


  /**
   * Model Driver
   */

  export type AggregateDriver = {
    _count: DriverCountAggregateOutputType | null
    _min: DriverMinAggregateOutputType | null
    _max: DriverMaxAggregateOutputType | null
  }

  export type DriverMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    fleetId: string | null
    status: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    email: string | null
    dateOfBirth: string | null
    nationality: string | null
    personId: string | null
    businessEntityId: string | null
    operatingUnitId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DriverMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    fleetId: string | null
    status: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    email: string | null
    dateOfBirth: string | null
    nationality: string | null
    personId: string | null
    businessEntityId: string | null
    operatingUnitId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DriverCountAggregateOutputType = {
    id: number
    tenantId: number
    fleetId: number
    status: number
    firstName: number
    lastName: number
    phone: number
    email: number
    dateOfBirth: number
    nationality: number
    personId: number
    businessEntityId: number
    operatingUnitId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DriverMinAggregateInputType = {
    id?: true
    tenantId?: true
    fleetId?: true
    status?: true
    firstName?: true
    lastName?: true
    phone?: true
    email?: true
    dateOfBirth?: true
    nationality?: true
    personId?: true
    businessEntityId?: true
    operatingUnitId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DriverMaxAggregateInputType = {
    id?: true
    tenantId?: true
    fleetId?: true
    status?: true
    firstName?: true
    lastName?: true
    phone?: true
    email?: true
    dateOfBirth?: true
    nationality?: true
    personId?: true
    businessEntityId?: true
    operatingUnitId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DriverCountAggregateInputType = {
    id?: true
    tenantId?: true
    fleetId?: true
    status?: true
    firstName?: true
    lastName?: true
    phone?: true
    email?: true
    dateOfBirth?: true
    nationality?: true
    personId?: true
    businessEntityId?: true
    operatingUnitId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DriverAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Driver to aggregate.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Drivers
    **/
    _count?: true | DriverCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DriverMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DriverMaxAggregateInputType
  }

  export type GetDriverAggregateType<T extends DriverAggregateArgs> = {
        [P in keyof T & keyof AggregateDriver]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDriver[P]>
      : GetScalarType<T[P], AggregateDriver[P]>
  }




  export type DriverGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DriverWhereInput
    orderBy?: DriverOrderByWithAggregationInput | DriverOrderByWithAggregationInput[]
    by: DriverScalarFieldEnum[] | DriverScalarFieldEnum
    having?: DriverScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DriverCountAggregateInputType | true
    _min?: DriverMinAggregateInputType
    _max?: DriverMaxAggregateInputType
  }

  export type DriverGroupByOutputType = {
    id: string
    tenantId: string
    fleetId: string
    status: string
    firstName: string
    lastName: string
    phone: string
    email: string | null
    dateOfBirth: string | null
    nationality: string | null
    personId: string | null
    businessEntityId: string
    operatingUnitId: string
    createdAt: Date
    updatedAt: Date
    _count: DriverCountAggregateOutputType | null
    _min: DriverMinAggregateOutputType | null
    _max: DriverMaxAggregateOutputType | null
  }

  type GetDriverGroupByPayload<T extends DriverGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DriverGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DriverGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DriverGroupByOutputType[P]>
            : GetScalarType<T[P], DriverGroupByOutputType[P]>
        }
      >
    >


  export type DriverSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    fleetId?: boolean
    status?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    email?: boolean
    dateOfBirth?: boolean
    nationality?: boolean
    personId?: boolean
    businessEntityId?: boolean
    operatingUnitId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fleet?: boolean | FleetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["driver"]>

  export type DriverSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    fleetId?: boolean
    status?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    email?: boolean
    dateOfBirth?: boolean
    nationality?: boolean
    personId?: boolean
    businessEntityId?: boolean
    operatingUnitId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fleet?: boolean | FleetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["driver"]>

  export type DriverSelectScalar = {
    id?: boolean
    tenantId?: boolean
    fleetId?: boolean
    status?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    email?: boolean
    dateOfBirth?: boolean
    nationality?: boolean
    personId?: boolean
    businessEntityId?: boolean
    operatingUnitId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DriverInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fleet?: boolean | FleetDefaultArgs<ExtArgs>
  }
  export type DriverIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fleet?: boolean | FleetDefaultArgs<ExtArgs>
  }

  export type $DriverPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Driver"
    objects: {
      fleet: Prisma.$FleetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      fleetId: string
      status: string
      firstName: string
      lastName: string
      phone: string
      email: string | null
      dateOfBirth: string | null
      nationality: string | null
      personId: string | null
      businessEntityId: string
      operatingUnitId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["driver"]>
    composites: {}
  }

  type DriverGetPayload<S extends boolean | null | undefined | DriverDefaultArgs> = $Result.GetResult<Prisma.$DriverPayload, S>

  type DriverCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DriverFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DriverCountAggregateInputType | true
    }

  export interface DriverDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Driver'], meta: { name: 'Driver' } }
    /**
     * Find zero or one Driver that matches the filter.
     * @param {DriverFindUniqueArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DriverFindUniqueArgs>(args: SelectSubset<T, DriverFindUniqueArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Driver that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DriverFindUniqueOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DriverFindUniqueOrThrowArgs>(args: SelectSubset<T, DriverFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Driver that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DriverFindFirstArgs>(args?: SelectSubset<T, DriverFindFirstArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Driver that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DriverFindFirstOrThrowArgs>(args?: SelectSubset<T, DriverFindFirstOrThrowArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Drivers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Drivers
     * const drivers = await prisma.driver.findMany()
     * 
     * // Get first 10 Drivers
     * const drivers = await prisma.driver.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const driverWithIdOnly = await prisma.driver.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DriverFindManyArgs>(args?: SelectSubset<T, DriverFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Driver.
     * @param {DriverCreateArgs} args - Arguments to create a Driver.
     * @example
     * // Create one Driver
     * const Driver = await prisma.driver.create({
     *   data: {
     *     // ... data to create a Driver
     *   }
     * })
     * 
     */
    create<T extends DriverCreateArgs>(args: SelectSubset<T, DriverCreateArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Drivers.
     * @param {DriverCreateManyArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DriverCreateManyArgs>(args?: SelectSubset<T, DriverCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Drivers and returns the data saved in the database.
     * @param {DriverCreateManyAndReturnArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Drivers and only return the `id`
     * const driverWithIdOnly = await prisma.driver.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DriverCreateManyAndReturnArgs>(args?: SelectSubset<T, DriverCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Driver.
     * @param {DriverDeleteArgs} args - Arguments to delete one Driver.
     * @example
     * // Delete one Driver
     * const Driver = await prisma.driver.delete({
     *   where: {
     *     // ... filter to delete one Driver
     *   }
     * })
     * 
     */
    delete<T extends DriverDeleteArgs>(args: SelectSubset<T, DriverDeleteArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Driver.
     * @param {DriverUpdateArgs} args - Arguments to update one Driver.
     * @example
     * // Update one Driver
     * const driver = await prisma.driver.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DriverUpdateArgs>(args: SelectSubset<T, DriverUpdateArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Drivers.
     * @param {DriverDeleteManyArgs} args - Arguments to filter Drivers to delete.
     * @example
     * // Delete a few Drivers
     * const { count } = await prisma.driver.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DriverDeleteManyArgs>(args?: SelectSubset<T, DriverDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Drivers
     * const driver = await prisma.driver.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DriverUpdateManyArgs>(args: SelectSubset<T, DriverUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Driver.
     * @param {DriverUpsertArgs} args - Arguments to update or create a Driver.
     * @example
     * // Update or create a Driver
     * const driver = await prisma.driver.upsert({
     *   create: {
     *     // ... data to create a Driver
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Driver we want to update
     *   }
     * })
     */
    upsert<T extends DriverUpsertArgs>(args: SelectSubset<T, DriverUpsertArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverCountArgs} args - Arguments to filter Drivers to count.
     * @example
     * // Count the number of Drivers
     * const count = await prisma.driver.count({
     *   where: {
     *     // ... the filter for the Drivers we want to count
     *   }
     * })
    **/
    count<T extends DriverCountArgs>(
      args?: Subset<T, DriverCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DriverCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DriverAggregateArgs>(args: Subset<T, DriverAggregateArgs>): Prisma.PrismaPromise<GetDriverAggregateType<T>>

    /**
     * Group by Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverGroupByArgs} args - Group by arguments.
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
      T extends DriverGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DriverGroupByArgs['orderBy'] }
        : { orderBy?: DriverGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DriverGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDriverGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Driver model
   */
  readonly fields: DriverFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Driver.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DriverClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    fleet<T extends FleetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FleetDefaultArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the Driver model
   */ 
  interface DriverFieldRefs {
    readonly id: FieldRef<"Driver", 'String'>
    readonly tenantId: FieldRef<"Driver", 'String'>
    readonly fleetId: FieldRef<"Driver", 'String'>
    readonly status: FieldRef<"Driver", 'String'>
    readonly firstName: FieldRef<"Driver", 'String'>
    readonly lastName: FieldRef<"Driver", 'String'>
    readonly phone: FieldRef<"Driver", 'String'>
    readonly email: FieldRef<"Driver", 'String'>
    readonly dateOfBirth: FieldRef<"Driver", 'String'>
    readonly nationality: FieldRef<"Driver", 'String'>
    readonly personId: FieldRef<"Driver", 'String'>
    readonly businessEntityId: FieldRef<"Driver", 'String'>
    readonly operatingUnitId: FieldRef<"Driver", 'String'>
    readonly createdAt: FieldRef<"Driver", 'DateTime'>
    readonly updatedAt: FieldRef<"Driver", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Driver findUnique
   */
  export type DriverFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver findUniqueOrThrow
   */
  export type DriverFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver findFirst
   */
  export type DriverFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver findFirstOrThrow
   */
  export type DriverFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver findMany
   */
  export type DriverFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Drivers to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver create
   */
  export type DriverCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * The data needed to create a Driver.
     */
    data: XOR<DriverCreateInput, DriverUncheckedCreateInput>
  }

  /**
   * Driver createMany
   */
  export type DriverCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Driver createManyAndReturn
   */
  export type DriverCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Driver update
   */
  export type DriverUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * The data needed to update a Driver.
     */
    data: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>
    /**
     * Choose, which Driver to update.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver updateMany
   */
  export type DriverUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Drivers.
     */
    data: XOR<DriverUpdateManyMutationInput, DriverUncheckedUpdateManyInput>
    /**
     * Filter which Drivers to update
     */
    where?: DriverWhereInput
  }

  /**
   * Driver upsert
   */
  export type DriverUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * The filter to search for the Driver to update in case it exists.
     */
    where: DriverWhereUniqueInput
    /**
     * In case the Driver found by the `where` argument doesn't exist, create a new Driver with this data.
     */
    create: XOR<DriverCreateInput, DriverUncheckedCreateInput>
    /**
     * In case the Driver was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>
  }

  /**
   * Driver delete
   */
  export type DriverDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter which Driver to delete.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver deleteMany
   */
  export type DriverDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Drivers to delete
     */
    where?: DriverWhereInput
  }

  /**
   * Driver without action
   */
  export type DriverDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
  }


  /**
   * Model Vehicle
   */

  export type AggregateVehicle = {
    _count: VehicleCountAggregateOutputType | null
    _avg: VehicleAvgAggregateOutputType | null
    _sum: VehicleSumAggregateOutputType | null
    _min: VehicleMinAggregateOutputType | null
    _max: VehicleMaxAggregateOutputType | null
  }

  export type VehicleAvgAggregateOutputType = {
    year: number | null
  }

  export type VehicleSumAggregateOutputType = {
    year: number | null
  }

  export type VehicleMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    fleetId: string | null
    status: string | null
    vehicleType: string | null
    make: string | null
    model: string | null
    year: number | null
    plate: string | null
    color: string | null
    vin: string | null
    operatingUnitId: string | null
    businessEntityId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VehicleMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    fleetId: string | null
    status: string | null
    vehicleType: string | null
    make: string | null
    model: string | null
    year: number | null
    plate: string | null
    color: string | null
    vin: string | null
    operatingUnitId: string | null
    businessEntityId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VehicleCountAggregateOutputType = {
    id: number
    tenantId: number
    fleetId: number
    status: number
    vehicleType: number
    make: number
    model: number
    year: number
    plate: number
    color: number
    vin: number
    operatingUnitId: number
    businessEntityId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VehicleAvgAggregateInputType = {
    year?: true
  }

  export type VehicleSumAggregateInputType = {
    year?: true
  }

  export type VehicleMinAggregateInputType = {
    id?: true
    tenantId?: true
    fleetId?: true
    status?: true
    vehicleType?: true
    make?: true
    model?: true
    year?: true
    plate?: true
    color?: true
    vin?: true
    operatingUnitId?: true
    businessEntityId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VehicleMaxAggregateInputType = {
    id?: true
    tenantId?: true
    fleetId?: true
    status?: true
    vehicleType?: true
    make?: true
    model?: true
    year?: true
    plate?: true
    color?: true
    vin?: true
    operatingUnitId?: true
    businessEntityId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VehicleCountAggregateInputType = {
    id?: true
    tenantId?: true
    fleetId?: true
    status?: true
    vehicleType?: true
    make?: true
    model?: true
    year?: true
    plate?: true
    color?: true
    vin?: true
    operatingUnitId?: true
    businessEntityId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VehicleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vehicle to aggregate.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Vehicles
    **/
    _count?: true | VehicleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VehicleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VehicleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VehicleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VehicleMaxAggregateInputType
  }

  export type GetVehicleAggregateType<T extends VehicleAggregateArgs> = {
        [P in keyof T & keyof AggregateVehicle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVehicle[P]>
      : GetScalarType<T[P], AggregateVehicle[P]>
  }




  export type VehicleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VehicleWhereInput
    orderBy?: VehicleOrderByWithAggregationInput | VehicleOrderByWithAggregationInput[]
    by: VehicleScalarFieldEnum[] | VehicleScalarFieldEnum
    having?: VehicleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VehicleCountAggregateInputType | true
    _avg?: VehicleAvgAggregateInputType
    _sum?: VehicleSumAggregateInputType
    _min?: VehicleMinAggregateInputType
    _max?: VehicleMaxAggregateInputType
  }

  export type VehicleGroupByOutputType = {
    id: string
    tenantId: string
    fleetId: string
    status: string
    vehicleType: string
    make: string
    model: string
    year: number
    plate: string
    color: string | null
    vin: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt: Date
    updatedAt: Date
    _count: VehicleCountAggregateOutputType | null
    _avg: VehicleAvgAggregateOutputType | null
    _sum: VehicleSumAggregateOutputType | null
    _min: VehicleMinAggregateOutputType | null
    _max: VehicleMaxAggregateOutputType | null
  }

  type GetVehicleGroupByPayload<T extends VehicleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VehicleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VehicleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VehicleGroupByOutputType[P]>
            : GetScalarType<T[P], VehicleGroupByOutputType[P]>
        }
      >
    >


  export type VehicleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    fleetId?: boolean
    status?: boolean
    vehicleType?: boolean
    make?: boolean
    model?: boolean
    year?: boolean
    plate?: boolean
    color?: boolean
    vin?: boolean
    operatingUnitId?: boolean
    businessEntityId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fleet?: boolean | FleetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vehicle"]>

  export type VehicleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    fleetId?: boolean
    status?: boolean
    vehicleType?: boolean
    make?: boolean
    model?: boolean
    year?: boolean
    plate?: boolean
    color?: boolean
    vin?: boolean
    operatingUnitId?: boolean
    businessEntityId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fleet?: boolean | FleetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vehicle"]>

  export type VehicleSelectScalar = {
    id?: boolean
    tenantId?: boolean
    fleetId?: boolean
    status?: boolean
    vehicleType?: boolean
    make?: boolean
    model?: boolean
    year?: boolean
    plate?: boolean
    color?: boolean
    vin?: boolean
    operatingUnitId?: boolean
    businessEntityId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VehicleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fleet?: boolean | FleetDefaultArgs<ExtArgs>
  }
  export type VehicleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fleet?: boolean | FleetDefaultArgs<ExtArgs>
  }

  export type $VehiclePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Vehicle"
    objects: {
      fleet: Prisma.$FleetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      fleetId: string
      status: string
      vehicleType: string
      make: string
      model: string
      year: number
      plate: string
      color: string | null
      vin: string | null
      operatingUnitId: string
      businessEntityId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["vehicle"]>
    composites: {}
  }

  type VehicleGetPayload<S extends boolean | null | undefined | VehicleDefaultArgs> = $Result.GetResult<Prisma.$VehiclePayload, S>

  type VehicleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<VehicleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: VehicleCountAggregateInputType | true
    }

  export interface VehicleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Vehicle'], meta: { name: 'Vehicle' } }
    /**
     * Find zero or one Vehicle that matches the filter.
     * @param {VehicleFindUniqueArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VehicleFindUniqueArgs>(args: SelectSubset<T, VehicleFindUniqueArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Vehicle that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {VehicleFindUniqueOrThrowArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VehicleFindUniqueOrThrowArgs>(args: SelectSubset<T, VehicleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Vehicle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleFindFirstArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VehicleFindFirstArgs>(args?: SelectSubset<T, VehicleFindFirstArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Vehicle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleFindFirstOrThrowArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VehicleFindFirstOrThrowArgs>(args?: SelectSubset<T, VehicleFindFirstOrThrowArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Vehicles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Vehicles
     * const vehicles = await prisma.vehicle.findMany()
     * 
     * // Get first 10 Vehicles
     * const vehicles = await prisma.vehicle.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vehicleWithIdOnly = await prisma.vehicle.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VehicleFindManyArgs>(args?: SelectSubset<T, VehicleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Vehicle.
     * @param {VehicleCreateArgs} args - Arguments to create a Vehicle.
     * @example
     * // Create one Vehicle
     * const Vehicle = await prisma.vehicle.create({
     *   data: {
     *     // ... data to create a Vehicle
     *   }
     * })
     * 
     */
    create<T extends VehicleCreateArgs>(args: SelectSubset<T, VehicleCreateArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Vehicles.
     * @param {VehicleCreateManyArgs} args - Arguments to create many Vehicles.
     * @example
     * // Create many Vehicles
     * const vehicle = await prisma.vehicle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VehicleCreateManyArgs>(args?: SelectSubset<T, VehicleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Vehicles and returns the data saved in the database.
     * @param {VehicleCreateManyAndReturnArgs} args - Arguments to create many Vehicles.
     * @example
     * // Create many Vehicles
     * const vehicle = await prisma.vehicle.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Vehicles and only return the `id`
     * const vehicleWithIdOnly = await prisma.vehicle.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VehicleCreateManyAndReturnArgs>(args?: SelectSubset<T, VehicleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Vehicle.
     * @param {VehicleDeleteArgs} args - Arguments to delete one Vehicle.
     * @example
     * // Delete one Vehicle
     * const Vehicle = await prisma.vehicle.delete({
     *   where: {
     *     // ... filter to delete one Vehicle
     *   }
     * })
     * 
     */
    delete<T extends VehicleDeleteArgs>(args: SelectSubset<T, VehicleDeleteArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Vehicle.
     * @param {VehicleUpdateArgs} args - Arguments to update one Vehicle.
     * @example
     * // Update one Vehicle
     * const vehicle = await prisma.vehicle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VehicleUpdateArgs>(args: SelectSubset<T, VehicleUpdateArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Vehicles.
     * @param {VehicleDeleteManyArgs} args - Arguments to filter Vehicles to delete.
     * @example
     * // Delete a few Vehicles
     * const { count } = await prisma.vehicle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VehicleDeleteManyArgs>(args?: SelectSubset<T, VehicleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vehicles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Vehicles
     * const vehicle = await prisma.vehicle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VehicleUpdateManyArgs>(args: SelectSubset<T, VehicleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Vehicle.
     * @param {VehicleUpsertArgs} args - Arguments to update or create a Vehicle.
     * @example
     * // Update or create a Vehicle
     * const vehicle = await prisma.vehicle.upsert({
     *   create: {
     *     // ... data to create a Vehicle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Vehicle we want to update
     *   }
     * })
     */
    upsert<T extends VehicleUpsertArgs>(args: SelectSubset<T, VehicleUpsertArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Vehicles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleCountArgs} args - Arguments to filter Vehicles to count.
     * @example
     * // Count the number of Vehicles
     * const count = await prisma.vehicle.count({
     *   where: {
     *     // ... the filter for the Vehicles we want to count
     *   }
     * })
    **/
    count<T extends VehicleCountArgs>(
      args?: Subset<T, VehicleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VehicleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Vehicle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VehicleAggregateArgs>(args: Subset<T, VehicleAggregateArgs>): Prisma.PrismaPromise<GetVehicleAggregateType<T>>

    /**
     * Group by Vehicle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleGroupByArgs} args - Group by arguments.
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
      T extends VehicleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VehicleGroupByArgs['orderBy'] }
        : { orderBy?: VehicleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, VehicleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVehicleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Vehicle model
   */
  readonly fields: VehicleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Vehicle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VehicleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    fleet<T extends FleetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FleetDefaultArgs<ExtArgs>>): Prisma__FleetClient<$Result.GetResult<Prisma.$FleetPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the Vehicle model
   */ 
  interface VehicleFieldRefs {
    readonly id: FieldRef<"Vehicle", 'String'>
    readonly tenantId: FieldRef<"Vehicle", 'String'>
    readonly fleetId: FieldRef<"Vehicle", 'String'>
    readonly status: FieldRef<"Vehicle", 'String'>
    readonly vehicleType: FieldRef<"Vehicle", 'String'>
    readonly make: FieldRef<"Vehicle", 'String'>
    readonly model: FieldRef<"Vehicle", 'String'>
    readonly year: FieldRef<"Vehicle", 'Int'>
    readonly plate: FieldRef<"Vehicle", 'String'>
    readonly color: FieldRef<"Vehicle", 'String'>
    readonly vin: FieldRef<"Vehicle", 'String'>
    readonly operatingUnitId: FieldRef<"Vehicle", 'String'>
    readonly businessEntityId: FieldRef<"Vehicle", 'String'>
    readonly createdAt: FieldRef<"Vehicle", 'DateTime'>
    readonly updatedAt: FieldRef<"Vehicle", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Vehicle findUnique
   */
  export type VehicleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle findUniqueOrThrow
   */
  export type VehicleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle findFirst
   */
  export type VehicleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vehicles.
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vehicles.
     */
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Vehicle findFirstOrThrow
   */
  export type VehicleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vehicles.
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vehicles.
     */
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Vehicle findMany
   */
  export type VehicleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicles to fetch.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Vehicles.
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Vehicle create
   */
  export type VehicleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * The data needed to create a Vehicle.
     */
    data: XOR<VehicleCreateInput, VehicleUncheckedCreateInput>
  }

  /**
   * Vehicle createMany
   */
  export type VehicleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Vehicles.
     */
    data: VehicleCreateManyInput | VehicleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Vehicle createManyAndReturn
   */
  export type VehicleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Vehicles.
     */
    data: VehicleCreateManyInput | VehicleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Vehicle update
   */
  export type VehicleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * The data needed to update a Vehicle.
     */
    data: XOR<VehicleUpdateInput, VehicleUncheckedUpdateInput>
    /**
     * Choose, which Vehicle to update.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle updateMany
   */
  export type VehicleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Vehicles.
     */
    data: XOR<VehicleUpdateManyMutationInput, VehicleUncheckedUpdateManyInput>
    /**
     * Filter which Vehicles to update
     */
    where?: VehicleWhereInput
  }

  /**
   * Vehicle upsert
   */
  export type VehicleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * The filter to search for the Vehicle to update in case it exists.
     */
    where: VehicleWhereUniqueInput
    /**
     * In case the Vehicle found by the `where` argument doesn't exist, create a new Vehicle with this data.
     */
    create: XOR<VehicleCreateInput, VehicleUncheckedCreateInput>
    /**
     * In case the Vehicle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VehicleUpdateInput, VehicleUncheckedUpdateInput>
  }

  /**
   * Vehicle delete
   */
  export type VehicleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter which Vehicle to delete.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle deleteMany
   */
  export type VehicleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vehicles to delete
     */
    where?: VehicleWhereInput
  }

  /**
   * Vehicle without action
   */
  export type VehicleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
  }


  /**
   * Model Assignment
   */

  export type AggregateAssignment = {
    _count: AssignmentCountAggregateOutputType | null
    _min: AssignmentMinAggregateOutputType | null
    _max: AssignmentMaxAggregateOutputType | null
  }

  export type AssignmentMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    fleetId: string | null
    driverId: string | null
    vehicleId: string | null
    status: string | null
    startedAt: Date | null
    endedAt: Date | null
    notes: string | null
    operatingUnitId: string | null
    businessEntityId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssignmentMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    fleetId: string | null
    driverId: string | null
    vehicleId: string | null
    status: string | null
    startedAt: Date | null
    endedAt: Date | null
    notes: string | null
    operatingUnitId: string | null
    businessEntityId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssignmentCountAggregateOutputType = {
    id: number
    tenantId: number
    fleetId: number
    driverId: number
    vehicleId: number
    status: number
    startedAt: number
    endedAt: number
    notes: number
    operatingUnitId: number
    businessEntityId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AssignmentMinAggregateInputType = {
    id?: true
    tenantId?: true
    fleetId?: true
    driverId?: true
    vehicleId?: true
    status?: true
    startedAt?: true
    endedAt?: true
    notes?: true
    operatingUnitId?: true
    businessEntityId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssignmentMaxAggregateInputType = {
    id?: true
    tenantId?: true
    fleetId?: true
    driverId?: true
    vehicleId?: true
    status?: true
    startedAt?: true
    endedAt?: true
    notes?: true
    operatingUnitId?: true
    businessEntityId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssignmentCountAggregateInputType = {
    id?: true
    tenantId?: true
    fleetId?: true
    driverId?: true
    vehicleId?: true
    status?: true
    startedAt?: true
    endedAt?: true
    notes?: true
    operatingUnitId?: true
    businessEntityId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AssignmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Assignment to aggregate.
     */
    where?: AssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assignments to fetch.
     */
    orderBy?: AssignmentOrderByWithRelationInput | AssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Assignments
    **/
    _count?: true | AssignmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssignmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssignmentMaxAggregateInputType
  }

  export type GetAssignmentAggregateType<T extends AssignmentAggregateArgs> = {
        [P in keyof T & keyof AggregateAssignment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssignment[P]>
      : GetScalarType<T[P], AggregateAssignment[P]>
  }




  export type AssignmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssignmentWhereInput
    orderBy?: AssignmentOrderByWithAggregationInput | AssignmentOrderByWithAggregationInput[]
    by: AssignmentScalarFieldEnum[] | AssignmentScalarFieldEnum
    having?: AssignmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssignmentCountAggregateInputType | true
    _min?: AssignmentMinAggregateInputType
    _max?: AssignmentMaxAggregateInputType
  }

  export type AssignmentGroupByOutputType = {
    id: string
    tenantId: string
    fleetId: string
    driverId: string
    vehicleId: string
    status: string
    startedAt: Date
    endedAt: Date | null
    notes: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt: Date
    updatedAt: Date
    _count: AssignmentCountAggregateOutputType | null
    _min: AssignmentMinAggregateOutputType | null
    _max: AssignmentMaxAggregateOutputType | null
  }

  type GetAssignmentGroupByPayload<T extends AssignmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssignmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssignmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssignmentGroupByOutputType[P]>
            : GetScalarType<T[P], AssignmentGroupByOutputType[P]>
        }
      >
    >


  export type AssignmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    fleetId?: boolean
    driverId?: boolean
    vehicleId?: boolean
    status?: boolean
    startedAt?: boolean
    endedAt?: boolean
    notes?: boolean
    operatingUnitId?: boolean
    businessEntityId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["assignment"]>

  export type AssignmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    fleetId?: boolean
    driverId?: boolean
    vehicleId?: boolean
    status?: boolean
    startedAt?: boolean
    endedAt?: boolean
    notes?: boolean
    operatingUnitId?: boolean
    businessEntityId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["assignment"]>

  export type AssignmentSelectScalar = {
    id?: boolean
    tenantId?: boolean
    fleetId?: boolean
    driverId?: boolean
    vehicleId?: boolean
    status?: boolean
    startedAt?: boolean
    endedAt?: boolean
    notes?: boolean
    operatingUnitId?: boolean
    businessEntityId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $AssignmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Assignment"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      fleetId: string
      driverId: string
      vehicleId: string
      status: string
      startedAt: Date
      endedAt: Date | null
      notes: string | null
      operatingUnitId: string
      businessEntityId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["assignment"]>
    composites: {}
  }

  type AssignmentGetPayload<S extends boolean | null | undefined | AssignmentDefaultArgs> = $Result.GetResult<Prisma.$AssignmentPayload, S>

  type AssignmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AssignmentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AssignmentCountAggregateInputType | true
    }

  export interface AssignmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Assignment'], meta: { name: 'Assignment' } }
    /**
     * Find zero or one Assignment that matches the filter.
     * @param {AssignmentFindUniqueArgs} args - Arguments to find a Assignment
     * @example
     * // Get one Assignment
     * const assignment = await prisma.assignment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssignmentFindUniqueArgs>(args: SelectSubset<T, AssignmentFindUniqueArgs<ExtArgs>>): Prisma__AssignmentClient<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Assignment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AssignmentFindUniqueOrThrowArgs} args - Arguments to find a Assignment
     * @example
     * // Get one Assignment
     * const assignment = await prisma.assignment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssignmentFindUniqueOrThrowArgs>(args: SelectSubset<T, AssignmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssignmentClient<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Assignment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentFindFirstArgs} args - Arguments to find a Assignment
     * @example
     * // Get one Assignment
     * const assignment = await prisma.assignment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssignmentFindFirstArgs>(args?: SelectSubset<T, AssignmentFindFirstArgs<ExtArgs>>): Prisma__AssignmentClient<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Assignment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentFindFirstOrThrowArgs} args - Arguments to find a Assignment
     * @example
     * // Get one Assignment
     * const assignment = await prisma.assignment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssignmentFindFirstOrThrowArgs>(args?: SelectSubset<T, AssignmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssignmentClient<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Assignments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Assignments
     * const assignments = await prisma.assignment.findMany()
     * 
     * // Get first 10 Assignments
     * const assignments = await prisma.assignment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assignmentWithIdOnly = await prisma.assignment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssignmentFindManyArgs>(args?: SelectSubset<T, AssignmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Assignment.
     * @param {AssignmentCreateArgs} args - Arguments to create a Assignment.
     * @example
     * // Create one Assignment
     * const Assignment = await prisma.assignment.create({
     *   data: {
     *     // ... data to create a Assignment
     *   }
     * })
     * 
     */
    create<T extends AssignmentCreateArgs>(args: SelectSubset<T, AssignmentCreateArgs<ExtArgs>>): Prisma__AssignmentClient<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Assignments.
     * @param {AssignmentCreateManyArgs} args - Arguments to create many Assignments.
     * @example
     * // Create many Assignments
     * const assignment = await prisma.assignment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssignmentCreateManyArgs>(args?: SelectSubset<T, AssignmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Assignments and returns the data saved in the database.
     * @param {AssignmentCreateManyAndReturnArgs} args - Arguments to create many Assignments.
     * @example
     * // Create many Assignments
     * const assignment = await prisma.assignment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Assignments and only return the `id`
     * const assignmentWithIdOnly = await prisma.assignment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssignmentCreateManyAndReturnArgs>(args?: SelectSubset<T, AssignmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Assignment.
     * @param {AssignmentDeleteArgs} args - Arguments to delete one Assignment.
     * @example
     * // Delete one Assignment
     * const Assignment = await prisma.assignment.delete({
     *   where: {
     *     // ... filter to delete one Assignment
     *   }
     * })
     * 
     */
    delete<T extends AssignmentDeleteArgs>(args: SelectSubset<T, AssignmentDeleteArgs<ExtArgs>>): Prisma__AssignmentClient<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Assignment.
     * @param {AssignmentUpdateArgs} args - Arguments to update one Assignment.
     * @example
     * // Update one Assignment
     * const assignment = await prisma.assignment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssignmentUpdateArgs>(args: SelectSubset<T, AssignmentUpdateArgs<ExtArgs>>): Prisma__AssignmentClient<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Assignments.
     * @param {AssignmentDeleteManyArgs} args - Arguments to filter Assignments to delete.
     * @example
     * // Delete a few Assignments
     * const { count } = await prisma.assignment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssignmentDeleteManyArgs>(args?: SelectSubset<T, AssignmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Assignments
     * const assignment = await prisma.assignment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssignmentUpdateManyArgs>(args: SelectSubset<T, AssignmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Assignment.
     * @param {AssignmentUpsertArgs} args - Arguments to update or create a Assignment.
     * @example
     * // Update or create a Assignment
     * const assignment = await prisma.assignment.upsert({
     *   create: {
     *     // ... data to create a Assignment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Assignment we want to update
     *   }
     * })
     */
    upsert<T extends AssignmentUpsertArgs>(args: SelectSubset<T, AssignmentUpsertArgs<ExtArgs>>): Prisma__AssignmentClient<$Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Assignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentCountArgs} args - Arguments to filter Assignments to count.
     * @example
     * // Count the number of Assignments
     * const count = await prisma.assignment.count({
     *   where: {
     *     // ... the filter for the Assignments we want to count
     *   }
     * })
    **/
    count<T extends AssignmentCountArgs>(
      args?: Subset<T, AssignmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssignmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Assignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AssignmentAggregateArgs>(args: Subset<T, AssignmentAggregateArgs>): Prisma.PrismaPromise<GetAssignmentAggregateType<T>>

    /**
     * Group by Assignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentGroupByArgs} args - Group by arguments.
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
      T extends AssignmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssignmentGroupByArgs['orderBy'] }
        : { orderBy?: AssignmentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AssignmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssignmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Assignment model
   */
  readonly fields: AssignmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Assignment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssignmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Assignment model
   */ 
  interface AssignmentFieldRefs {
    readonly id: FieldRef<"Assignment", 'String'>
    readonly tenantId: FieldRef<"Assignment", 'String'>
    readonly fleetId: FieldRef<"Assignment", 'String'>
    readonly driverId: FieldRef<"Assignment", 'String'>
    readonly vehicleId: FieldRef<"Assignment", 'String'>
    readonly status: FieldRef<"Assignment", 'String'>
    readonly startedAt: FieldRef<"Assignment", 'DateTime'>
    readonly endedAt: FieldRef<"Assignment", 'DateTime'>
    readonly notes: FieldRef<"Assignment", 'String'>
    readonly operatingUnitId: FieldRef<"Assignment", 'String'>
    readonly businessEntityId: FieldRef<"Assignment", 'String'>
    readonly createdAt: FieldRef<"Assignment", 'DateTime'>
    readonly updatedAt: FieldRef<"Assignment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Assignment findUnique
   */
  export type AssignmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
    /**
     * Filter, which Assignment to fetch.
     */
    where: AssignmentWhereUniqueInput
  }

  /**
   * Assignment findUniqueOrThrow
   */
  export type AssignmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
    /**
     * Filter, which Assignment to fetch.
     */
    where: AssignmentWhereUniqueInput
  }

  /**
   * Assignment findFirst
   */
  export type AssignmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
    /**
     * Filter, which Assignment to fetch.
     */
    where?: AssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assignments to fetch.
     */
    orderBy?: AssignmentOrderByWithRelationInput | AssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assignments.
     */
    cursor?: AssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assignments.
     */
    distinct?: AssignmentScalarFieldEnum | AssignmentScalarFieldEnum[]
  }

  /**
   * Assignment findFirstOrThrow
   */
  export type AssignmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
    /**
     * Filter, which Assignment to fetch.
     */
    where?: AssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assignments to fetch.
     */
    orderBy?: AssignmentOrderByWithRelationInput | AssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assignments.
     */
    cursor?: AssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assignments.
     */
    distinct?: AssignmentScalarFieldEnum | AssignmentScalarFieldEnum[]
  }

  /**
   * Assignment findMany
   */
  export type AssignmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
    /**
     * Filter, which Assignments to fetch.
     */
    where?: AssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assignments to fetch.
     */
    orderBy?: AssignmentOrderByWithRelationInput | AssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Assignments.
     */
    cursor?: AssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assignments.
     */
    skip?: number
    distinct?: AssignmentScalarFieldEnum | AssignmentScalarFieldEnum[]
  }

  /**
   * Assignment create
   */
  export type AssignmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
    /**
     * The data needed to create a Assignment.
     */
    data: XOR<AssignmentCreateInput, AssignmentUncheckedCreateInput>
  }

  /**
   * Assignment createMany
   */
  export type AssignmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Assignments.
     */
    data: AssignmentCreateManyInput | AssignmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Assignment createManyAndReturn
   */
  export type AssignmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Assignments.
     */
    data: AssignmentCreateManyInput | AssignmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Assignment update
   */
  export type AssignmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
    /**
     * The data needed to update a Assignment.
     */
    data: XOR<AssignmentUpdateInput, AssignmentUncheckedUpdateInput>
    /**
     * Choose, which Assignment to update.
     */
    where: AssignmentWhereUniqueInput
  }

  /**
   * Assignment updateMany
   */
  export type AssignmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Assignments.
     */
    data: XOR<AssignmentUpdateManyMutationInput, AssignmentUncheckedUpdateManyInput>
    /**
     * Filter which Assignments to update
     */
    where?: AssignmentWhereInput
  }

  /**
   * Assignment upsert
   */
  export type AssignmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
    /**
     * The filter to search for the Assignment to update in case it exists.
     */
    where: AssignmentWhereUniqueInput
    /**
     * In case the Assignment found by the `where` argument doesn't exist, create a new Assignment with this data.
     */
    create: XOR<AssignmentCreateInput, AssignmentUncheckedCreateInput>
    /**
     * In case the Assignment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssignmentUpdateInput, AssignmentUncheckedUpdateInput>
  }

  /**
   * Assignment delete
   */
  export type AssignmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
    /**
     * Filter which Assignment to delete.
     */
    where: AssignmentWhereUniqueInput
  }

  /**
   * Assignment deleteMany
   */
  export type AssignmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Assignments to delete
     */
    where?: AssignmentWhereInput
  }

  /**
   * Assignment without action
   */
  export type AssignmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null
  }


  /**
   * Model Remittance
   */

  export type AggregateRemittance = {
    _count: RemittanceCountAggregateOutputType | null
    _avg: RemittanceAvgAggregateOutputType | null
    _sum: RemittanceSumAggregateOutputType | null
    _min: RemittanceMinAggregateOutputType | null
    _max: RemittanceMaxAggregateOutputType | null
  }

  export type RemittanceAvgAggregateOutputType = {
    amountMinorUnits: number | null
  }

  export type RemittanceSumAggregateOutputType = {
    amountMinorUnits: number | null
  }

  export type RemittanceMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    assignmentId: string | null
    driverId: string | null
    vehicleId: string | null
    status: string | null
    amountMinorUnits: number | null
    currency: string | null
    dueDate: string | null
    paidDate: string | null
    notes: string | null
    fleetId: string | null
    operatingUnitId: string | null
    businessEntityId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RemittanceMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    assignmentId: string | null
    driverId: string | null
    vehicleId: string | null
    status: string | null
    amountMinorUnits: number | null
    currency: string | null
    dueDate: string | null
    paidDate: string | null
    notes: string | null
    fleetId: string | null
    operatingUnitId: string | null
    businessEntityId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RemittanceCountAggregateOutputType = {
    id: number
    tenantId: number
    assignmentId: number
    driverId: number
    vehicleId: number
    status: number
    amountMinorUnits: number
    currency: number
    dueDate: number
    paidDate: number
    notes: number
    fleetId: number
    operatingUnitId: number
    businessEntityId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RemittanceAvgAggregateInputType = {
    amountMinorUnits?: true
  }

  export type RemittanceSumAggregateInputType = {
    amountMinorUnits?: true
  }

  export type RemittanceMinAggregateInputType = {
    id?: true
    tenantId?: true
    assignmentId?: true
    driverId?: true
    vehicleId?: true
    status?: true
    amountMinorUnits?: true
    currency?: true
    dueDate?: true
    paidDate?: true
    notes?: true
    fleetId?: true
    operatingUnitId?: true
    businessEntityId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RemittanceMaxAggregateInputType = {
    id?: true
    tenantId?: true
    assignmentId?: true
    driverId?: true
    vehicleId?: true
    status?: true
    amountMinorUnits?: true
    currency?: true
    dueDate?: true
    paidDate?: true
    notes?: true
    fleetId?: true
    operatingUnitId?: true
    businessEntityId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RemittanceCountAggregateInputType = {
    id?: true
    tenantId?: true
    assignmentId?: true
    driverId?: true
    vehicleId?: true
    status?: true
    amountMinorUnits?: true
    currency?: true
    dueDate?: true
    paidDate?: true
    notes?: true
    fleetId?: true
    operatingUnitId?: true
    businessEntityId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RemittanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Remittance to aggregate.
     */
    where?: RemittanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Remittances to fetch.
     */
    orderBy?: RemittanceOrderByWithRelationInput | RemittanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RemittanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Remittances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Remittances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Remittances
    **/
    _count?: true | RemittanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RemittanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RemittanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RemittanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RemittanceMaxAggregateInputType
  }

  export type GetRemittanceAggregateType<T extends RemittanceAggregateArgs> = {
        [P in keyof T & keyof AggregateRemittance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRemittance[P]>
      : GetScalarType<T[P], AggregateRemittance[P]>
  }




  export type RemittanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RemittanceWhereInput
    orderBy?: RemittanceOrderByWithAggregationInput | RemittanceOrderByWithAggregationInput[]
    by: RemittanceScalarFieldEnum[] | RemittanceScalarFieldEnum
    having?: RemittanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RemittanceCountAggregateInputType | true
    _avg?: RemittanceAvgAggregateInputType
    _sum?: RemittanceSumAggregateInputType
    _min?: RemittanceMinAggregateInputType
    _max?: RemittanceMaxAggregateInputType
  }

  export type RemittanceGroupByOutputType = {
    id: string
    tenantId: string
    assignmentId: string
    driverId: string
    vehicleId: string
    status: string
    amountMinorUnits: number
    currency: string
    dueDate: string
    paidDate: string | null
    notes: string | null
    fleetId: string
    operatingUnitId: string
    businessEntityId: string
    createdAt: Date
    updatedAt: Date
    _count: RemittanceCountAggregateOutputType | null
    _avg: RemittanceAvgAggregateOutputType | null
    _sum: RemittanceSumAggregateOutputType | null
    _min: RemittanceMinAggregateOutputType | null
    _max: RemittanceMaxAggregateOutputType | null
  }

  type GetRemittanceGroupByPayload<T extends RemittanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RemittanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RemittanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RemittanceGroupByOutputType[P]>
            : GetScalarType<T[P], RemittanceGroupByOutputType[P]>
        }
      >
    >


  export type RemittanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assignmentId?: boolean
    driverId?: boolean
    vehicleId?: boolean
    status?: boolean
    amountMinorUnits?: boolean
    currency?: boolean
    dueDate?: boolean
    paidDate?: boolean
    notes?: boolean
    fleetId?: boolean
    operatingUnitId?: boolean
    businessEntityId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["remittance"]>

  export type RemittanceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assignmentId?: boolean
    driverId?: boolean
    vehicleId?: boolean
    status?: boolean
    amountMinorUnits?: boolean
    currency?: boolean
    dueDate?: boolean
    paidDate?: boolean
    notes?: boolean
    fleetId?: boolean
    operatingUnitId?: boolean
    businessEntityId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["remittance"]>

  export type RemittanceSelectScalar = {
    id?: boolean
    tenantId?: boolean
    assignmentId?: boolean
    driverId?: boolean
    vehicleId?: boolean
    status?: boolean
    amountMinorUnits?: boolean
    currency?: boolean
    dueDate?: boolean
    paidDate?: boolean
    notes?: boolean
    fleetId?: boolean
    operatingUnitId?: boolean
    businessEntityId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $RemittancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Remittance"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      assignmentId: string
      driverId: string
      vehicleId: string
      status: string
      amountMinorUnits: number
      currency: string
      dueDate: string
      paidDate: string | null
      notes: string | null
      fleetId: string
      operatingUnitId: string
      businessEntityId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["remittance"]>
    composites: {}
  }

  type RemittanceGetPayload<S extends boolean | null | undefined | RemittanceDefaultArgs> = $Result.GetResult<Prisma.$RemittancePayload, S>

  type RemittanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RemittanceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RemittanceCountAggregateInputType | true
    }

  export interface RemittanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Remittance'], meta: { name: 'Remittance' } }
    /**
     * Find zero or one Remittance that matches the filter.
     * @param {RemittanceFindUniqueArgs} args - Arguments to find a Remittance
     * @example
     * // Get one Remittance
     * const remittance = await prisma.remittance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RemittanceFindUniqueArgs>(args: SelectSubset<T, RemittanceFindUniqueArgs<ExtArgs>>): Prisma__RemittanceClient<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Remittance that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RemittanceFindUniqueOrThrowArgs} args - Arguments to find a Remittance
     * @example
     * // Get one Remittance
     * const remittance = await prisma.remittance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RemittanceFindUniqueOrThrowArgs>(args: SelectSubset<T, RemittanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RemittanceClient<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Remittance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RemittanceFindFirstArgs} args - Arguments to find a Remittance
     * @example
     * // Get one Remittance
     * const remittance = await prisma.remittance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RemittanceFindFirstArgs>(args?: SelectSubset<T, RemittanceFindFirstArgs<ExtArgs>>): Prisma__RemittanceClient<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Remittance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RemittanceFindFirstOrThrowArgs} args - Arguments to find a Remittance
     * @example
     * // Get one Remittance
     * const remittance = await prisma.remittance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RemittanceFindFirstOrThrowArgs>(args?: SelectSubset<T, RemittanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__RemittanceClient<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Remittances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RemittanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Remittances
     * const remittances = await prisma.remittance.findMany()
     * 
     * // Get first 10 Remittances
     * const remittances = await prisma.remittance.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const remittanceWithIdOnly = await prisma.remittance.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RemittanceFindManyArgs>(args?: SelectSubset<T, RemittanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Remittance.
     * @param {RemittanceCreateArgs} args - Arguments to create a Remittance.
     * @example
     * // Create one Remittance
     * const Remittance = await prisma.remittance.create({
     *   data: {
     *     // ... data to create a Remittance
     *   }
     * })
     * 
     */
    create<T extends RemittanceCreateArgs>(args: SelectSubset<T, RemittanceCreateArgs<ExtArgs>>): Prisma__RemittanceClient<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Remittances.
     * @param {RemittanceCreateManyArgs} args - Arguments to create many Remittances.
     * @example
     * // Create many Remittances
     * const remittance = await prisma.remittance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RemittanceCreateManyArgs>(args?: SelectSubset<T, RemittanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Remittances and returns the data saved in the database.
     * @param {RemittanceCreateManyAndReturnArgs} args - Arguments to create many Remittances.
     * @example
     * // Create many Remittances
     * const remittance = await prisma.remittance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Remittances and only return the `id`
     * const remittanceWithIdOnly = await prisma.remittance.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RemittanceCreateManyAndReturnArgs>(args?: SelectSubset<T, RemittanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Remittance.
     * @param {RemittanceDeleteArgs} args - Arguments to delete one Remittance.
     * @example
     * // Delete one Remittance
     * const Remittance = await prisma.remittance.delete({
     *   where: {
     *     // ... filter to delete one Remittance
     *   }
     * })
     * 
     */
    delete<T extends RemittanceDeleteArgs>(args: SelectSubset<T, RemittanceDeleteArgs<ExtArgs>>): Prisma__RemittanceClient<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Remittance.
     * @param {RemittanceUpdateArgs} args - Arguments to update one Remittance.
     * @example
     * // Update one Remittance
     * const remittance = await prisma.remittance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RemittanceUpdateArgs>(args: SelectSubset<T, RemittanceUpdateArgs<ExtArgs>>): Prisma__RemittanceClient<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Remittances.
     * @param {RemittanceDeleteManyArgs} args - Arguments to filter Remittances to delete.
     * @example
     * // Delete a few Remittances
     * const { count } = await prisma.remittance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RemittanceDeleteManyArgs>(args?: SelectSubset<T, RemittanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Remittances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RemittanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Remittances
     * const remittance = await prisma.remittance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RemittanceUpdateManyArgs>(args: SelectSubset<T, RemittanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Remittance.
     * @param {RemittanceUpsertArgs} args - Arguments to update or create a Remittance.
     * @example
     * // Update or create a Remittance
     * const remittance = await prisma.remittance.upsert({
     *   create: {
     *     // ... data to create a Remittance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Remittance we want to update
     *   }
     * })
     */
    upsert<T extends RemittanceUpsertArgs>(args: SelectSubset<T, RemittanceUpsertArgs<ExtArgs>>): Prisma__RemittanceClient<$Result.GetResult<Prisma.$RemittancePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Remittances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RemittanceCountArgs} args - Arguments to filter Remittances to count.
     * @example
     * // Count the number of Remittances
     * const count = await prisma.remittance.count({
     *   where: {
     *     // ... the filter for the Remittances we want to count
     *   }
     * })
    **/
    count<T extends RemittanceCountArgs>(
      args?: Subset<T, RemittanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RemittanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Remittance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RemittanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RemittanceAggregateArgs>(args: Subset<T, RemittanceAggregateArgs>): Prisma.PrismaPromise<GetRemittanceAggregateType<T>>

    /**
     * Group by Remittance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RemittanceGroupByArgs} args - Group by arguments.
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
      T extends RemittanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RemittanceGroupByArgs['orderBy'] }
        : { orderBy?: RemittanceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, RemittanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRemittanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Remittance model
   */
  readonly fields: RemittanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Remittance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RemittanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Remittance model
   */ 
  interface RemittanceFieldRefs {
    readonly id: FieldRef<"Remittance", 'String'>
    readonly tenantId: FieldRef<"Remittance", 'String'>
    readonly assignmentId: FieldRef<"Remittance", 'String'>
    readonly driverId: FieldRef<"Remittance", 'String'>
    readonly vehicleId: FieldRef<"Remittance", 'String'>
    readonly status: FieldRef<"Remittance", 'String'>
    readonly amountMinorUnits: FieldRef<"Remittance", 'Int'>
    readonly currency: FieldRef<"Remittance", 'String'>
    readonly dueDate: FieldRef<"Remittance", 'String'>
    readonly paidDate: FieldRef<"Remittance", 'String'>
    readonly notes: FieldRef<"Remittance", 'String'>
    readonly fleetId: FieldRef<"Remittance", 'String'>
    readonly operatingUnitId: FieldRef<"Remittance", 'String'>
    readonly businessEntityId: FieldRef<"Remittance", 'String'>
    readonly createdAt: FieldRef<"Remittance", 'DateTime'>
    readonly updatedAt: FieldRef<"Remittance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Remittance findUnique
   */
  export type RemittanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
    /**
     * Filter, which Remittance to fetch.
     */
    where: RemittanceWhereUniqueInput
  }

  /**
   * Remittance findUniqueOrThrow
   */
  export type RemittanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
    /**
     * Filter, which Remittance to fetch.
     */
    where: RemittanceWhereUniqueInput
  }

  /**
   * Remittance findFirst
   */
  export type RemittanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
    /**
     * Filter, which Remittance to fetch.
     */
    where?: RemittanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Remittances to fetch.
     */
    orderBy?: RemittanceOrderByWithRelationInput | RemittanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Remittances.
     */
    cursor?: RemittanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Remittances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Remittances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Remittances.
     */
    distinct?: RemittanceScalarFieldEnum | RemittanceScalarFieldEnum[]
  }

  /**
   * Remittance findFirstOrThrow
   */
  export type RemittanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
    /**
     * Filter, which Remittance to fetch.
     */
    where?: RemittanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Remittances to fetch.
     */
    orderBy?: RemittanceOrderByWithRelationInput | RemittanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Remittances.
     */
    cursor?: RemittanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Remittances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Remittances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Remittances.
     */
    distinct?: RemittanceScalarFieldEnum | RemittanceScalarFieldEnum[]
  }

  /**
   * Remittance findMany
   */
  export type RemittanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
    /**
     * Filter, which Remittances to fetch.
     */
    where?: RemittanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Remittances to fetch.
     */
    orderBy?: RemittanceOrderByWithRelationInput | RemittanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Remittances.
     */
    cursor?: RemittanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Remittances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Remittances.
     */
    skip?: number
    distinct?: RemittanceScalarFieldEnum | RemittanceScalarFieldEnum[]
  }

  /**
   * Remittance create
   */
  export type RemittanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
    /**
     * The data needed to create a Remittance.
     */
    data: XOR<RemittanceCreateInput, RemittanceUncheckedCreateInput>
  }

  /**
   * Remittance createMany
   */
  export type RemittanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Remittances.
     */
    data: RemittanceCreateManyInput | RemittanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Remittance createManyAndReturn
   */
  export type RemittanceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Remittances.
     */
    data: RemittanceCreateManyInput | RemittanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Remittance update
   */
  export type RemittanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
    /**
     * The data needed to update a Remittance.
     */
    data: XOR<RemittanceUpdateInput, RemittanceUncheckedUpdateInput>
    /**
     * Choose, which Remittance to update.
     */
    where: RemittanceWhereUniqueInput
  }

  /**
   * Remittance updateMany
   */
  export type RemittanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Remittances.
     */
    data: XOR<RemittanceUpdateManyMutationInput, RemittanceUncheckedUpdateManyInput>
    /**
     * Filter which Remittances to update
     */
    where?: RemittanceWhereInput
  }

  /**
   * Remittance upsert
   */
  export type RemittanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
    /**
     * The filter to search for the Remittance to update in case it exists.
     */
    where: RemittanceWhereUniqueInput
    /**
     * In case the Remittance found by the `where` argument doesn't exist, create a new Remittance with this data.
     */
    create: XOR<RemittanceCreateInput, RemittanceUncheckedCreateInput>
    /**
     * In case the Remittance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RemittanceUpdateInput, RemittanceUncheckedUpdateInput>
  }

  /**
   * Remittance delete
   */
  export type RemittanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
    /**
     * Filter which Remittance to delete.
     */
    where: RemittanceWhereUniqueInput
  }

  /**
   * Remittance deleteMany
   */
  export type RemittanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Remittances to delete
     */
    where?: RemittanceWhereInput
  }

  /**
   * Remittance without action
   */
  export type RemittanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Remittance
     */
    select?: RemittanceSelect<ExtArgs> | null
  }


  /**
   * Model OperationalWallet
   */

  export type AggregateOperationalWallet = {
    _count: OperationalWalletCountAggregateOutputType | null
    _min: OperationalWalletMinAggregateOutputType | null
    _max: OperationalWalletMaxAggregateOutputType | null
  }

  export type OperationalWalletMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    businessEntityId: string | null
    currency: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OperationalWalletMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    businessEntityId: string | null
    currency: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OperationalWalletCountAggregateOutputType = {
    id: number
    tenantId: number
    businessEntityId: number
    currency: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OperationalWalletMinAggregateInputType = {
    id?: true
    tenantId?: true
    businessEntityId?: true
    currency?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OperationalWalletMaxAggregateInputType = {
    id?: true
    tenantId?: true
    businessEntityId?: true
    currency?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OperationalWalletCountAggregateInputType = {
    id?: true
    tenantId?: true
    businessEntityId?: true
    currency?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OperationalWalletAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OperationalWallet to aggregate.
     */
    where?: OperationalWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalWallets to fetch.
     */
    orderBy?: OperationalWalletOrderByWithRelationInput | OperationalWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OperationalWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalWallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OperationalWallets
    **/
    _count?: true | OperationalWalletCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OperationalWalletMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OperationalWalletMaxAggregateInputType
  }

  export type GetOperationalWalletAggregateType<T extends OperationalWalletAggregateArgs> = {
        [P in keyof T & keyof AggregateOperationalWallet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOperationalWallet[P]>
      : GetScalarType<T[P], AggregateOperationalWallet[P]>
  }




  export type OperationalWalletGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OperationalWalletWhereInput
    orderBy?: OperationalWalletOrderByWithAggregationInput | OperationalWalletOrderByWithAggregationInput[]
    by: OperationalWalletScalarFieldEnum[] | OperationalWalletScalarFieldEnum
    having?: OperationalWalletScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OperationalWalletCountAggregateInputType | true
    _min?: OperationalWalletMinAggregateInputType
    _max?: OperationalWalletMaxAggregateInputType
  }

  export type OperationalWalletGroupByOutputType = {
    id: string
    tenantId: string
    businessEntityId: string
    currency: string
    createdAt: Date
    updatedAt: Date
    _count: OperationalWalletCountAggregateOutputType | null
    _min: OperationalWalletMinAggregateOutputType | null
    _max: OperationalWalletMaxAggregateOutputType | null
  }

  type GetOperationalWalletGroupByPayload<T extends OperationalWalletGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OperationalWalletGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OperationalWalletGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OperationalWalletGroupByOutputType[P]>
            : GetScalarType<T[P], OperationalWalletGroupByOutputType[P]>
        }
      >
    >


  export type OperationalWalletSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    businessEntityId?: boolean
    currency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    entries?: boolean | OperationalWallet$entriesArgs<ExtArgs>
    _count?: boolean | OperationalWalletCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operationalWallet"]>

  export type OperationalWalletSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    businessEntityId?: boolean
    currency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["operationalWallet"]>

  export type OperationalWalletSelectScalar = {
    id?: boolean
    tenantId?: boolean
    businessEntityId?: boolean
    currency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OperationalWalletInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    entries?: boolean | OperationalWallet$entriesArgs<ExtArgs>
    _count?: boolean | OperationalWalletCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OperationalWalletIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OperationalWalletPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OperationalWallet"
    objects: {
      entries: Prisma.$OperationalWalletEntryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      businessEntityId: string
      currency: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["operationalWallet"]>
    composites: {}
  }

  type OperationalWalletGetPayload<S extends boolean | null | undefined | OperationalWalletDefaultArgs> = $Result.GetResult<Prisma.$OperationalWalletPayload, S>

  type OperationalWalletCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OperationalWalletFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OperationalWalletCountAggregateInputType | true
    }

  export interface OperationalWalletDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OperationalWallet'], meta: { name: 'OperationalWallet' } }
    /**
     * Find zero or one OperationalWallet that matches the filter.
     * @param {OperationalWalletFindUniqueArgs} args - Arguments to find a OperationalWallet
     * @example
     * // Get one OperationalWallet
     * const operationalWallet = await prisma.operationalWallet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OperationalWalletFindUniqueArgs>(args: SelectSubset<T, OperationalWalletFindUniqueArgs<ExtArgs>>): Prisma__OperationalWalletClient<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OperationalWallet that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OperationalWalletFindUniqueOrThrowArgs} args - Arguments to find a OperationalWallet
     * @example
     * // Get one OperationalWallet
     * const operationalWallet = await prisma.operationalWallet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OperationalWalletFindUniqueOrThrowArgs>(args: SelectSubset<T, OperationalWalletFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OperationalWalletClient<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OperationalWallet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletFindFirstArgs} args - Arguments to find a OperationalWallet
     * @example
     * // Get one OperationalWallet
     * const operationalWallet = await prisma.operationalWallet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OperationalWalletFindFirstArgs>(args?: SelectSubset<T, OperationalWalletFindFirstArgs<ExtArgs>>): Prisma__OperationalWalletClient<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OperationalWallet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletFindFirstOrThrowArgs} args - Arguments to find a OperationalWallet
     * @example
     * // Get one OperationalWallet
     * const operationalWallet = await prisma.operationalWallet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OperationalWalletFindFirstOrThrowArgs>(args?: SelectSubset<T, OperationalWalletFindFirstOrThrowArgs<ExtArgs>>): Prisma__OperationalWalletClient<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OperationalWallets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OperationalWallets
     * const operationalWallets = await prisma.operationalWallet.findMany()
     * 
     * // Get first 10 OperationalWallets
     * const operationalWallets = await prisma.operationalWallet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const operationalWalletWithIdOnly = await prisma.operationalWallet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OperationalWalletFindManyArgs>(args?: SelectSubset<T, OperationalWalletFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OperationalWallet.
     * @param {OperationalWalletCreateArgs} args - Arguments to create a OperationalWallet.
     * @example
     * // Create one OperationalWallet
     * const OperationalWallet = await prisma.operationalWallet.create({
     *   data: {
     *     // ... data to create a OperationalWallet
     *   }
     * })
     * 
     */
    create<T extends OperationalWalletCreateArgs>(args: SelectSubset<T, OperationalWalletCreateArgs<ExtArgs>>): Prisma__OperationalWalletClient<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OperationalWallets.
     * @param {OperationalWalletCreateManyArgs} args - Arguments to create many OperationalWallets.
     * @example
     * // Create many OperationalWallets
     * const operationalWallet = await prisma.operationalWallet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OperationalWalletCreateManyArgs>(args?: SelectSubset<T, OperationalWalletCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OperationalWallets and returns the data saved in the database.
     * @param {OperationalWalletCreateManyAndReturnArgs} args - Arguments to create many OperationalWallets.
     * @example
     * // Create many OperationalWallets
     * const operationalWallet = await prisma.operationalWallet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OperationalWallets and only return the `id`
     * const operationalWalletWithIdOnly = await prisma.operationalWallet.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OperationalWalletCreateManyAndReturnArgs>(args?: SelectSubset<T, OperationalWalletCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OperationalWallet.
     * @param {OperationalWalletDeleteArgs} args - Arguments to delete one OperationalWallet.
     * @example
     * // Delete one OperationalWallet
     * const OperationalWallet = await prisma.operationalWallet.delete({
     *   where: {
     *     // ... filter to delete one OperationalWallet
     *   }
     * })
     * 
     */
    delete<T extends OperationalWalletDeleteArgs>(args: SelectSubset<T, OperationalWalletDeleteArgs<ExtArgs>>): Prisma__OperationalWalletClient<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OperationalWallet.
     * @param {OperationalWalletUpdateArgs} args - Arguments to update one OperationalWallet.
     * @example
     * // Update one OperationalWallet
     * const operationalWallet = await prisma.operationalWallet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OperationalWalletUpdateArgs>(args: SelectSubset<T, OperationalWalletUpdateArgs<ExtArgs>>): Prisma__OperationalWalletClient<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OperationalWallets.
     * @param {OperationalWalletDeleteManyArgs} args - Arguments to filter OperationalWallets to delete.
     * @example
     * // Delete a few OperationalWallets
     * const { count } = await prisma.operationalWallet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OperationalWalletDeleteManyArgs>(args?: SelectSubset<T, OperationalWalletDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OperationalWallets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OperationalWallets
     * const operationalWallet = await prisma.operationalWallet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OperationalWalletUpdateManyArgs>(args: SelectSubset<T, OperationalWalletUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OperationalWallet.
     * @param {OperationalWalletUpsertArgs} args - Arguments to update or create a OperationalWallet.
     * @example
     * // Update or create a OperationalWallet
     * const operationalWallet = await prisma.operationalWallet.upsert({
     *   create: {
     *     // ... data to create a OperationalWallet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OperationalWallet we want to update
     *   }
     * })
     */
    upsert<T extends OperationalWalletUpsertArgs>(args: SelectSubset<T, OperationalWalletUpsertArgs<ExtArgs>>): Prisma__OperationalWalletClient<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OperationalWallets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletCountArgs} args - Arguments to filter OperationalWallets to count.
     * @example
     * // Count the number of OperationalWallets
     * const count = await prisma.operationalWallet.count({
     *   where: {
     *     // ... the filter for the OperationalWallets we want to count
     *   }
     * })
    **/
    count<T extends OperationalWalletCountArgs>(
      args?: Subset<T, OperationalWalletCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OperationalWalletCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OperationalWallet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OperationalWalletAggregateArgs>(args: Subset<T, OperationalWalletAggregateArgs>): Prisma.PrismaPromise<GetOperationalWalletAggregateType<T>>

    /**
     * Group by OperationalWallet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletGroupByArgs} args - Group by arguments.
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
      T extends OperationalWalletGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OperationalWalletGroupByArgs['orderBy'] }
        : { orderBy?: OperationalWalletGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OperationalWalletGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOperationalWalletGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OperationalWallet model
   */
  readonly fields: OperationalWalletFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OperationalWallet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OperationalWalletClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    entries<T extends OperationalWallet$entriesArgs<ExtArgs> = {}>(args?: Subset<T, OperationalWallet$entriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the OperationalWallet model
   */ 
  interface OperationalWalletFieldRefs {
    readonly id: FieldRef<"OperationalWallet", 'String'>
    readonly tenantId: FieldRef<"OperationalWallet", 'String'>
    readonly businessEntityId: FieldRef<"OperationalWallet", 'String'>
    readonly currency: FieldRef<"OperationalWallet", 'String'>
    readonly createdAt: FieldRef<"OperationalWallet", 'DateTime'>
    readonly updatedAt: FieldRef<"OperationalWallet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OperationalWallet findUnique
   */
  export type OperationalWalletFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWallet to fetch.
     */
    where: OperationalWalletWhereUniqueInput
  }

  /**
   * OperationalWallet findUniqueOrThrow
   */
  export type OperationalWalletFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWallet to fetch.
     */
    where: OperationalWalletWhereUniqueInput
  }

  /**
   * OperationalWallet findFirst
   */
  export type OperationalWalletFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWallet to fetch.
     */
    where?: OperationalWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalWallets to fetch.
     */
    orderBy?: OperationalWalletOrderByWithRelationInput | OperationalWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OperationalWallets.
     */
    cursor?: OperationalWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalWallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OperationalWallets.
     */
    distinct?: OperationalWalletScalarFieldEnum | OperationalWalletScalarFieldEnum[]
  }

  /**
   * OperationalWallet findFirstOrThrow
   */
  export type OperationalWalletFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWallet to fetch.
     */
    where?: OperationalWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalWallets to fetch.
     */
    orderBy?: OperationalWalletOrderByWithRelationInput | OperationalWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OperationalWallets.
     */
    cursor?: OperationalWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalWallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OperationalWallets.
     */
    distinct?: OperationalWalletScalarFieldEnum | OperationalWalletScalarFieldEnum[]
  }

  /**
   * OperationalWallet findMany
   */
  export type OperationalWalletFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWallets to fetch.
     */
    where?: OperationalWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalWallets to fetch.
     */
    orderBy?: OperationalWalletOrderByWithRelationInput | OperationalWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OperationalWallets.
     */
    cursor?: OperationalWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalWallets.
     */
    skip?: number
    distinct?: OperationalWalletScalarFieldEnum | OperationalWalletScalarFieldEnum[]
  }

  /**
   * OperationalWallet create
   */
  export type OperationalWalletCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
    /**
     * The data needed to create a OperationalWallet.
     */
    data: XOR<OperationalWalletCreateInput, OperationalWalletUncheckedCreateInput>
  }

  /**
   * OperationalWallet createMany
   */
  export type OperationalWalletCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OperationalWallets.
     */
    data: OperationalWalletCreateManyInput | OperationalWalletCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OperationalWallet createManyAndReturn
   */
  export type OperationalWalletCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OperationalWallets.
     */
    data: OperationalWalletCreateManyInput | OperationalWalletCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OperationalWallet update
   */
  export type OperationalWalletUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
    /**
     * The data needed to update a OperationalWallet.
     */
    data: XOR<OperationalWalletUpdateInput, OperationalWalletUncheckedUpdateInput>
    /**
     * Choose, which OperationalWallet to update.
     */
    where: OperationalWalletWhereUniqueInput
  }

  /**
   * OperationalWallet updateMany
   */
  export type OperationalWalletUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OperationalWallets.
     */
    data: XOR<OperationalWalletUpdateManyMutationInput, OperationalWalletUncheckedUpdateManyInput>
    /**
     * Filter which OperationalWallets to update
     */
    where?: OperationalWalletWhereInput
  }

  /**
   * OperationalWallet upsert
   */
  export type OperationalWalletUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
    /**
     * The filter to search for the OperationalWallet to update in case it exists.
     */
    where: OperationalWalletWhereUniqueInput
    /**
     * In case the OperationalWallet found by the `where` argument doesn't exist, create a new OperationalWallet with this data.
     */
    create: XOR<OperationalWalletCreateInput, OperationalWalletUncheckedCreateInput>
    /**
     * In case the OperationalWallet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OperationalWalletUpdateInput, OperationalWalletUncheckedUpdateInput>
  }

  /**
   * OperationalWallet delete
   */
  export type OperationalWalletDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
    /**
     * Filter which OperationalWallet to delete.
     */
    where: OperationalWalletWhereUniqueInput
  }

  /**
   * OperationalWallet deleteMany
   */
  export type OperationalWalletDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OperationalWallets to delete
     */
    where?: OperationalWalletWhereInput
  }

  /**
   * OperationalWallet.entries
   */
  export type OperationalWallet$entriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    where?: OperationalWalletEntryWhereInput
    orderBy?: OperationalWalletEntryOrderByWithRelationInput | OperationalWalletEntryOrderByWithRelationInput[]
    cursor?: OperationalWalletEntryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OperationalWalletEntryScalarFieldEnum | OperationalWalletEntryScalarFieldEnum[]
  }

  /**
   * OperationalWallet without action
   */
  export type OperationalWalletDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWallet
     */
    select?: OperationalWalletSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletInclude<ExtArgs> | null
  }


  /**
   * Model OperationalWalletEntry
   */

  export type AggregateOperationalWalletEntry = {
    _count: OperationalWalletEntryCountAggregateOutputType | null
    _avg: OperationalWalletEntryAvgAggregateOutputType | null
    _sum: OperationalWalletEntrySumAggregateOutputType | null
    _min: OperationalWalletEntryMinAggregateOutputType | null
    _max: OperationalWalletEntryMaxAggregateOutputType | null
  }

  export type OperationalWalletEntryAvgAggregateOutputType = {
    amountMinorUnits: number | null
  }

  export type OperationalWalletEntrySumAggregateOutputType = {
    amountMinorUnits: number | null
  }

  export type OperationalWalletEntryMinAggregateOutputType = {
    id: string | null
    walletId: string | null
    type: string | null
    amountMinorUnits: number | null
    currency: string | null
    referenceId: string | null
    referenceType: string | null
    description: string | null
    createdAt: Date | null
  }

  export type OperationalWalletEntryMaxAggregateOutputType = {
    id: string | null
    walletId: string | null
    type: string | null
    amountMinorUnits: number | null
    currency: string | null
    referenceId: string | null
    referenceType: string | null
    description: string | null
    createdAt: Date | null
  }

  export type OperationalWalletEntryCountAggregateOutputType = {
    id: number
    walletId: number
    type: number
    amountMinorUnits: number
    currency: number
    referenceId: number
    referenceType: number
    description: number
    createdAt: number
    _all: number
  }


  export type OperationalWalletEntryAvgAggregateInputType = {
    amountMinorUnits?: true
  }

  export type OperationalWalletEntrySumAggregateInputType = {
    amountMinorUnits?: true
  }

  export type OperationalWalletEntryMinAggregateInputType = {
    id?: true
    walletId?: true
    type?: true
    amountMinorUnits?: true
    currency?: true
    referenceId?: true
    referenceType?: true
    description?: true
    createdAt?: true
  }

  export type OperationalWalletEntryMaxAggregateInputType = {
    id?: true
    walletId?: true
    type?: true
    amountMinorUnits?: true
    currency?: true
    referenceId?: true
    referenceType?: true
    description?: true
    createdAt?: true
  }

  export type OperationalWalletEntryCountAggregateInputType = {
    id?: true
    walletId?: true
    type?: true
    amountMinorUnits?: true
    currency?: true
    referenceId?: true
    referenceType?: true
    description?: true
    createdAt?: true
    _all?: true
  }

  export type OperationalWalletEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OperationalWalletEntry to aggregate.
     */
    where?: OperationalWalletEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalWalletEntries to fetch.
     */
    orderBy?: OperationalWalletEntryOrderByWithRelationInput | OperationalWalletEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OperationalWalletEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalWalletEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalWalletEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OperationalWalletEntries
    **/
    _count?: true | OperationalWalletEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OperationalWalletEntryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OperationalWalletEntrySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OperationalWalletEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OperationalWalletEntryMaxAggregateInputType
  }

  export type GetOperationalWalletEntryAggregateType<T extends OperationalWalletEntryAggregateArgs> = {
        [P in keyof T & keyof AggregateOperationalWalletEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOperationalWalletEntry[P]>
      : GetScalarType<T[P], AggregateOperationalWalletEntry[P]>
  }




  export type OperationalWalletEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OperationalWalletEntryWhereInput
    orderBy?: OperationalWalletEntryOrderByWithAggregationInput | OperationalWalletEntryOrderByWithAggregationInput[]
    by: OperationalWalletEntryScalarFieldEnum[] | OperationalWalletEntryScalarFieldEnum
    having?: OperationalWalletEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OperationalWalletEntryCountAggregateInputType | true
    _avg?: OperationalWalletEntryAvgAggregateInputType
    _sum?: OperationalWalletEntrySumAggregateInputType
    _min?: OperationalWalletEntryMinAggregateInputType
    _max?: OperationalWalletEntryMaxAggregateInputType
  }

  export type OperationalWalletEntryGroupByOutputType = {
    id: string
    walletId: string
    type: string
    amountMinorUnits: number
    currency: string
    referenceId: string | null
    referenceType: string | null
    description: string | null
    createdAt: Date
    _count: OperationalWalletEntryCountAggregateOutputType | null
    _avg: OperationalWalletEntryAvgAggregateOutputType | null
    _sum: OperationalWalletEntrySumAggregateOutputType | null
    _min: OperationalWalletEntryMinAggregateOutputType | null
    _max: OperationalWalletEntryMaxAggregateOutputType | null
  }

  type GetOperationalWalletEntryGroupByPayload<T extends OperationalWalletEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OperationalWalletEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OperationalWalletEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OperationalWalletEntryGroupByOutputType[P]>
            : GetScalarType<T[P], OperationalWalletEntryGroupByOutputType[P]>
        }
      >
    >


  export type OperationalWalletEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    walletId?: boolean
    type?: boolean
    amountMinorUnits?: boolean
    currency?: boolean
    referenceId?: boolean
    referenceType?: boolean
    description?: boolean
    createdAt?: boolean
    wallet?: boolean | OperationalWalletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operationalWalletEntry"]>

  export type OperationalWalletEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    walletId?: boolean
    type?: boolean
    amountMinorUnits?: boolean
    currency?: boolean
    referenceId?: boolean
    referenceType?: boolean
    description?: boolean
    createdAt?: boolean
    wallet?: boolean | OperationalWalletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operationalWalletEntry"]>

  export type OperationalWalletEntrySelectScalar = {
    id?: boolean
    walletId?: boolean
    type?: boolean
    amountMinorUnits?: boolean
    currency?: boolean
    referenceId?: boolean
    referenceType?: boolean
    description?: boolean
    createdAt?: boolean
  }

  export type OperationalWalletEntryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wallet?: boolean | OperationalWalletDefaultArgs<ExtArgs>
  }
  export type OperationalWalletEntryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wallet?: boolean | OperationalWalletDefaultArgs<ExtArgs>
  }

  export type $OperationalWalletEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OperationalWalletEntry"
    objects: {
      wallet: Prisma.$OperationalWalletPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      walletId: string
      type: string
      amountMinorUnits: number
      currency: string
      referenceId: string | null
      referenceType: string | null
      description: string | null
      createdAt: Date
    }, ExtArgs["result"]["operationalWalletEntry"]>
    composites: {}
  }

  type OperationalWalletEntryGetPayload<S extends boolean | null | undefined | OperationalWalletEntryDefaultArgs> = $Result.GetResult<Prisma.$OperationalWalletEntryPayload, S>

  type OperationalWalletEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OperationalWalletEntryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OperationalWalletEntryCountAggregateInputType | true
    }

  export interface OperationalWalletEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OperationalWalletEntry'], meta: { name: 'OperationalWalletEntry' } }
    /**
     * Find zero or one OperationalWalletEntry that matches the filter.
     * @param {OperationalWalletEntryFindUniqueArgs} args - Arguments to find a OperationalWalletEntry
     * @example
     * // Get one OperationalWalletEntry
     * const operationalWalletEntry = await prisma.operationalWalletEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OperationalWalletEntryFindUniqueArgs>(args: SelectSubset<T, OperationalWalletEntryFindUniqueArgs<ExtArgs>>): Prisma__OperationalWalletEntryClient<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OperationalWalletEntry that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OperationalWalletEntryFindUniqueOrThrowArgs} args - Arguments to find a OperationalWalletEntry
     * @example
     * // Get one OperationalWalletEntry
     * const operationalWalletEntry = await prisma.operationalWalletEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OperationalWalletEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, OperationalWalletEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OperationalWalletEntryClient<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OperationalWalletEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletEntryFindFirstArgs} args - Arguments to find a OperationalWalletEntry
     * @example
     * // Get one OperationalWalletEntry
     * const operationalWalletEntry = await prisma.operationalWalletEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OperationalWalletEntryFindFirstArgs>(args?: SelectSubset<T, OperationalWalletEntryFindFirstArgs<ExtArgs>>): Prisma__OperationalWalletEntryClient<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OperationalWalletEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletEntryFindFirstOrThrowArgs} args - Arguments to find a OperationalWalletEntry
     * @example
     * // Get one OperationalWalletEntry
     * const operationalWalletEntry = await prisma.operationalWalletEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OperationalWalletEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, OperationalWalletEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__OperationalWalletEntryClient<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OperationalWalletEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OperationalWalletEntries
     * const operationalWalletEntries = await prisma.operationalWalletEntry.findMany()
     * 
     * // Get first 10 OperationalWalletEntries
     * const operationalWalletEntries = await prisma.operationalWalletEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const operationalWalletEntryWithIdOnly = await prisma.operationalWalletEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OperationalWalletEntryFindManyArgs>(args?: SelectSubset<T, OperationalWalletEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OperationalWalletEntry.
     * @param {OperationalWalletEntryCreateArgs} args - Arguments to create a OperationalWalletEntry.
     * @example
     * // Create one OperationalWalletEntry
     * const OperationalWalletEntry = await prisma.operationalWalletEntry.create({
     *   data: {
     *     // ... data to create a OperationalWalletEntry
     *   }
     * })
     * 
     */
    create<T extends OperationalWalletEntryCreateArgs>(args: SelectSubset<T, OperationalWalletEntryCreateArgs<ExtArgs>>): Prisma__OperationalWalletEntryClient<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OperationalWalletEntries.
     * @param {OperationalWalletEntryCreateManyArgs} args - Arguments to create many OperationalWalletEntries.
     * @example
     * // Create many OperationalWalletEntries
     * const operationalWalletEntry = await prisma.operationalWalletEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OperationalWalletEntryCreateManyArgs>(args?: SelectSubset<T, OperationalWalletEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OperationalWalletEntries and returns the data saved in the database.
     * @param {OperationalWalletEntryCreateManyAndReturnArgs} args - Arguments to create many OperationalWalletEntries.
     * @example
     * // Create many OperationalWalletEntries
     * const operationalWalletEntry = await prisma.operationalWalletEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OperationalWalletEntries and only return the `id`
     * const operationalWalletEntryWithIdOnly = await prisma.operationalWalletEntry.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OperationalWalletEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, OperationalWalletEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OperationalWalletEntry.
     * @param {OperationalWalletEntryDeleteArgs} args - Arguments to delete one OperationalWalletEntry.
     * @example
     * // Delete one OperationalWalletEntry
     * const OperationalWalletEntry = await prisma.operationalWalletEntry.delete({
     *   where: {
     *     // ... filter to delete one OperationalWalletEntry
     *   }
     * })
     * 
     */
    delete<T extends OperationalWalletEntryDeleteArgs>(args: SelectSubset<T, OperationalWalletEntryDeleteArgs<ExtArgs>>): Prisma__OperationalWalletEntryClient<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OperationalWalletEntry.
     * @param {OperationalWalletEntryUpdateArgs} args - Arguments to update one OperationalWalletEntry.
     * @example
     * // Update one OperationalWalletEntry
     * const operationalWalletEntry = await prisma.operationalWalletEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OperationalWalletEntryUpdateArgs>(args: SelectSubset<T, OperationalWalletEntryUpdateArgs<ExtArgs>>): Prisma__OperationalWalletEntryClient<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OperationalWalletEntries.
     * @param {OperationalWalletEntryDeleteManyArgs} args - Arguments to filter OperationalWalletEntries to delete.
     * @example
     * // Delete a few OperationalWalletEntries
     * const { count } = await prisma.operationalWalletEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OperationalWalletEntryDeleteManyArgs>(args?: SelectSubset<T, OperationalWalletEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OperationalWalletEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OperationalWalletEntries
     * const operationalWalletEntry = await prisma.operationalWalletEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OperationalWalletEntryUpdateManyArgs>(args: SelectSubset<T, OperationalWalletEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OperationalWalletEntry.
     * @param {OperationalWalletEntryUpsertArgs} args - Arguments to update or create a OperationalWalletEntry.
     * @example
     * // Update or create a OperationalWalletEntry
     * const operationalWalletEntry = await prisma.operationalWalletEntry.upsert({
     *   create: {
     *     // ... data to create a OperationalWalletEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OperationalWalletEntry we want to update
     *   }
     * })
     */
    upsert<T extends OperationalWalletEntryUpsertArgs>(args: SelectSubset<T, OperationalWalletEntryUpsertArgs<ExtArgs>>): Prisma__OperationalWalletEntryClient<$Result.GetResult<Prisma.$OperationalWalletEntryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OperationalWalletEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletEntryCountArgs} args - Arguments to filter OperationalWalletEntries to count.
     * @example
     * // Count the number of OperationalWalletEntries
     * const count = await prisma.operationalWalletEntry.count({
     *   where: {
     *     // ... the filter for the OperationalWalletEntries we want to count
     *   }
     * })
    **/
    count<T extends OperationalWalletEntryCountArgs>(
      args?: Subset<T, OperationalWalletEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OperationalWalletEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OperationalWalletEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OperationalWalletEntryAggregateArgs>(args: Subset<T, OperationalWalletEntryAggregateArgs>): Prisma.PrismaPromise<GetOperationalWalletEntryAggregateType<T>>

    /**
     * Group by OperationalWalletEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalWalletEntryGroupByArgs} args - Group by arguments.
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
      T extends OperationalWalletEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OperationalWalletEntryGroupByArgs['orderBy'] }
        : { orderBy?: OperationalWalletEntryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OperationalWalletEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOperationalWalletEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OperationalWalletEntry model
   */
  readonly fields: OperationalWalletEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OperationalWalletEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OperationalWalletEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    wallet<T extends OperationalWalletDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OperationalWalletDefaultArgs<ExtArgs>>): Prisma__OperationalWalletClient<$Result.GetResult<Prisma.$OperationalWalletPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the OperationalWalletEntry model
   */ 
  interface OperationalWalletEntryFieldRefs {
    readonly id: FieldRef<"OperationalWalletEntry", 'String'>
    readonly walletId: FieldRef<"OperationalWalletEntry", 'String'>
    readonly type: FieldRef<"OperationalWalletEntry", 'String'>
    readonly amountMinorUnits: FieldRef<"OperationalWalletEntry", 'Int'>
    readonly currency: FieldRef<"OperationalWalletEntry", 'String'>
    readonly referenceId: FieldRef<"OperationalWalletEntry", 'String'>
    readonly referenceType: FieldRef<"OperationalWalletEntry", 'String'>
    readonly description: FieldRef<"OperationalWalletEntry", 'String'>
    readonly createdAt: FieldRef<"OperationalWalletEntry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OperationalWalletEntry findUnique
   */
  export type OperationalWalletEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWalletEntry to fetch.
     */
    where: OperationalWalletEntryWhereUniqueInput
  }

  /**
   * OperationalWalletEntry findUniqueOrThrow
   */
  export type OperationalWalletEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWalletEntry to fetch.
     */
    where: OperationalWalletEntryWhereUniqueInput
  }

  /**
   * OperationalWalletEntry findFirst
   */
  export type OperationalWalletEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWalletEntry to fetch.
     */
    where?: OperationalWalletEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalWalletEntries to fetch.
     */
    orderBy?: OperationalWalletEntryOrderByWithRelationInput | OperationalWalletEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OperationalWalletEntries.
     */
    cursor?: OperationalWalletEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalWalletEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalWalletEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OperationalWalletEntries.
     */
    distinct?: OperationalWalletEntryScalarFieldEnum | OperationalWalletEntryScalarFieldEnum[]
  }

  /**
   * OperationalWalletEntry findFirstOrThrow
   */
  export type OperationalWalletEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWalletEntry to fetch.
     */
    where?: OperationalWalletEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalWalletEntries to fetch.
     */
    orderBy?: OperationalWalletEntryOrderByWithRelationInput | OperationalWalletEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OperationalWalletEntries.
     */
    cursor?: OperationalWalletEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalWalletEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalWalletEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OperationalWalletEntries.
     */
    distinct?: OperationalWalletEntryScalarFieldEnum | OperationalWalletEntryScalarFieldEnum[]
  }

  /**
   * OperationalWalletEntry findMany
   */
  export type OperationalWalletEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    /**
     * Filter, which OperationalWalletEntries to fetch.
     */
    where?: OperationalWalletEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalWalletEntries to fetch.
     */
    orderBy?: OperationalWalletEntryOrderByWithRelationInput | OperationalWalletEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OperationalWalletEntries.
     */
    cursor?: OperationalWalletEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalWalletEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalWalletEntries.
     */
    skip?: number
    distinct?: OperationalWalletEntryScalarFieldEnum | OperationalWalletEntryScalarFieldEnum[]
  }

  /**
   * OperationalWalletEntry create
   */
  export type OperationalWalletEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    /**
     * The data needed to create a OperationalWalletEntry.
     */
    data: XOR<OperationalWalletEntryCreateInput, OperationalWalletEntryUncheckedCreateInput>
  }

  /**
   * OperationalWalletEntry createMany
   */
  export type OperationalWalletEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OperationalWalletEntries.
     */
    data: OperationalWalletEntryCreateManyInput | OperationalWalletEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OperationalWalletEntry createManyAndReturn
   */
  export type OperationalWalletEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OperationalWalletEntries.
     */
    data: OperationalWalletEntryCreateManyInput | OperationalWalletEntryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OperationalWalletEntry update
   */
  export type OperationalWalletEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    /**
     * The data needed to update a OperationalWalletEntry.
     */
    data: XOR<OperationalWalletEntryUpdateInput, OperationalWalletEntryUncheckedUpdateInput>
    /**
     * Choose, which OperationalWalletEntry to update.
     */
    where: OperationalWalletEntryWhereUniqueInput
  }

  /**
   * OperationalWalletEntry updateMany
   */
  export type OperationalWalletEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OperationalWalletEntries.
     */
    data: XOR<OperationalWalletEntryUpdateManyMutationInput, OperationalWalletEntryUncheckedUpdateManyInput>
    /**
     * Filter which OperationalWalletEntries to update
     */
    where?: OperationalWalletEntryWhereInput
  }

  /**
   * OperationalWalletEntry upsert
   */
  export type OperationalWalletEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    /**
     * The filter to search for the OperationalWalletEntry to update in case it exists.
     */
    where: OperationalWalletEntryWhereUniqueInput
    /**
     * In case the OperationalWalletEntry found by the `where` argument doesn't exist, create a new OperationalWalletEntry with this data.
     */
    create: XOR<OperationalWalletEntryCreateInput, OperationalWalletEntryUncheckedCreateInput>
    /**
     * In case the OperationalWalletEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OperationalWalletEntryUpdateInput, OperationalWalletEntryUncheckedUpdateInput>
  }

  /**
   * OperationalWalletEntry delete
   */
  export type OperationalWalletEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
    /**
     * Filter which OperationalWalletEntry to delete.
     */
    where: OperationalWalletEntryWhereUniqueInput
  }

  /**
   * OperationalWalletEntry deleteMany
   */
  export type OperationalWalletEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OperationalWalletEntries to delete
     */
    where?: OperationalWalletEntryWhereInput
  }

  /**
   * OperationalWalletEntry without action
   */
  export type OperationalWalletEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalWalletEntry
     */
    select?: OperationalWalletEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalWalletEntryInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    phone: string | null
    name: string | null
    role: string | null
    isActive: boolean | null
    isEmailVerified: boolean | null
    businessEntityId: string | null
    operatingUnitId: string | null
    passwordHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    phone: string | null
    name: string | null
    role: string | null
    isActive: boolean | null
    isEmailVerified: boolean | null
    businessEntityId: string | null
    operatingUnitId: string | null
    passwordHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    tenantId: number
    email: number
    phone: number
    name: number
    role: number
    isActive: number
    isEmailVerified: number
    businessEntityId: number
    operatingUnitId: number
    passwordHash: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    phone?: true
    name?: true
    role?: true
    isActive?: true
    isEmailVerified?: true
    businessEntityId?: true
    operatingUnitId?: true
    passwordHash?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    phone?: true
    name?: true
    role?: true
    isActive?: true
    isEmailVerified?: true
    businessEntityId?: true
    operatingUnitId?: true
    passwordHash?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    phone?: true
    name?: true
    role?: true
    isActive?: true
    isEmailVerified?: true
    businessEntityId?: true
    operatingUnitId?: true
    passwordHash?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    tenantId: string
    email: string
    phone: string | null
    name: string
    role: string
    isActive: boolean
    isEmailVerified: boolean
    businessEntityId: string | null
    operatingUnitId: string | null
    passwordHash: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    phone?: boolean
    name?: boolean
    role?: boolean
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: boolean
    operatingUnitId?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    authOtps?: boolean | User$authOtpsArgs<ExtArgs>
    passwordResetTokens?: boolean | User$passwordResetTokensArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    phone?: boolean
    name?: boolean
    role?: boolean
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: boolean
    operatingUnitId?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    tenantId?: boolean
    email?: boolean
    phone?: boolean
    name?: boolean
    role?: boolean
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: boolean
    operatingUnitId?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    authOtps?: boolean | User$authOtpsArgs<ExtArgs>
    passwordResetTokens?: boolean | User$passwordResetTokensArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      authOtps: Prisma.$AuthOtpPayload<ExtArgs>[]
      passwordResetTokens: Prisma.$PasswordResetTokenPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      email: string
      phone: string | null
      name: string
      role: string
      isActive: boolean
      isEmailVerified: boolean
      businessEntityId: string | null
      operatingUnitId: string | null
      passwordHash: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
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
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    authOtps<T extends User$authOtpsArgs<ExtArgs> = {}>(args?: Subset<T, User$authOtpsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "findMany"> | Null>
    passwordResetTokens<T extends User$passwordResetTokensArgs<ExtArgs> = {}>(args?: Subset<T, User$passwordResetTokensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly tenantId: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly isEmailVerified: FieldRef<"User", 'Boolean'>
    readonly businessEntityId: FieldRef<"User", 'String'>
    readonly operatingUnitId: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.authOtps
   */
  export type User$authOtpsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    where?: AuthOtpWhereInput
    orderBy?: AuthOtpOrderByWithRelationInput | AuthOtpOrderByWithRelationInput[]
    cursor?: AuthOtpWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuthOtpScalarFieldEnum | AuthOtpScalarFieldEnum[]
  }

  /**
   * User.passwordResetTokens
   */
  export type User$passwordResetTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    where?: PasswordResetTokenWhereInput
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    cursor?: PasswordResetTokenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PasswordResetTokenScalarFieldEnum | PasswordResetTokenScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model AuthOtp
   */

  export type AggregateAuthOtp = {
    _count: AuthOtpCountAggregateOutputType | null
    _min: AuthOtpMinAggregateOutputType | null
    _max: AuthOtpMaxAggregateOutputType | null
  }

  export type AuthOtpMinAggregateOutputType = {
    id: string | null
    userId: string | null
    identifier: string | null
    purpose: string | null
    codeHash: string | null
    expiresAt: Date | null
    consumedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AuthOtpMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    identifier: string | null
    purpose: string | null
    codeHash: string | null
    expiresAt: Date | null
    consumedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AuthOtpCountAggregateOutputType = {
    id: number
    userId: number
    identifier: number
    purpose: number
    codeHash: number
    expiresAt: number
    consumedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AuthOtpMinAggregateInputType = {
    id?: true
    userId?: true
    identifier?: true
    purpose?: true
    codeHash?: true
    expiresAt?: true
    consumedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AuthOtpMaxAggregateInputType = {
    id?: true
    userId?: true
    identifier?: true
    purpose?: true
    codeHash?: true
    expiresAt?: true
    consumedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AuthOtpCountAggregateInputType = {
    id?: true
    userId?: true
    identifier?: true
    purpose?: true
    codeHash?: true
    expiresAt?: true
    consumedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AuthOtpAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthOtp to aggregate.
     */
    where?: AuthOtpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthOtps to fetch.
     */
    orderBy?: AuthOtpOrderByWithRelationInput | AuthOtpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthOtpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthOtps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthOtps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuthOtps
    **/
    _count?: true | AuthOtpCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthOtpMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthOtpMaxAggregateInputType
  }

  export type GetAuthOtpAggregateType<T extends AuthOtpAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthOtp]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthOtp[P]>
      : GetScalarType<T[P], AggregateAuthOtp[P]>
  }




  export type AuthOtpGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthOtpWhereInput
    orderBy?: AuthOtpOrderByWithAggregationInput | AuthOtpOrderByWithAggregationInput[]
    by: AuthOtpScalarFieldEnum[] | AuthOtpScalarFieldEnum
    having?: AuthOtpScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthOtpCountAggregateInputType | true
    _min?: AuthOtpMinAggregateInputType
    _max?: AuthOtpMaxAggregateInputType
  }

  export type AuthOtpGroupByOutputType = {
    id: string
    userId: string
    identifier: string
    purpose: string
    codeHash: string
    expiresAt: Date
    consumedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: AuthOtpCountAggregateOutputType | null
    _min: AuthOtpMinAggregateOutputType | null
    _max: AuthOtpMaxAggregateOutputType | null
  }

  type GetAuthOtpGroupByPayload<T extends AuthOtpGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthOtpGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthOtpGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthOtpGroupByOutputType[P]>
            : GetScalarType<T[P], AuthOtpGroupByOutputType[P]>
        }
      >
    >


  export type AuthOtpSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    identifier?: boolean
    purpose?: boolean
    codeHash?: boolean
    expiresAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authOtp"]>

  export type AuthOtpSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    identifier?: boolean
    purpose?: boolean
    codeHash?: boolean
    expiresAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authOtp"]>

  export type AuthOtpSelectScalar = {
    id?: boolean
    userId?: boolean
    identifier?: boolean
    purpose?: boolean
    codeHash?: boolean
    expiresAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AuthOtpInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuthOtpIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AuthOtpPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuthOtp"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      identifier: string
      purpose: string
      codeHash: string
      expiresAt: Date
      consumedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["authOtp"]>
    composites: {}
  }

  type AuthOtpGetPayload<S extends boolean | null | undefined | AuthOtpDefaultArgs> = $Result.GetResult<Prisma.$AuthOtpPayload, S>

  type AuthOtpCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AuthOtpFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AuthOtpCountAggregateInputType | true
    }

  export interface AuthOtpDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuthOtp'], meta: { name: 'AuthOtp' } }
    /**
     * Find zero or one AuthOtp that matches the filter.
     * @param {AuthOtpFindUniqueArgs} args - Arguments to find a AuthOtp
     * @example
     * // Get one AuthOtp
     * const authOtp = await prisma.authOtp.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthOtpFindUniqueArgs>(args: SelectSubset<T, AuthOtpFindUniqueArgs<ExtArgs>>): Prisma__AuthOtpClient<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AuthOtp that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AuthOtpFindUniqueOrThrowArgs} args - Arguments to find a AuthOtp
     * @example
     * // Get one AuthOtp
     * const authOtp = await prisma.authOtp.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthOtpFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthOtpFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthOtpClient<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AuthOtp that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthOtpFindFirstArgs} args - Arguments to find a AuthOtp
     * @example
     * // Get one AuthOtp
     * const authOtp = await prisma.authOtp.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthOtpFindFirstArgs>(args?: SelectSubset<T, AuthOtpFindFirstArgs<ExtArgs>>): Prisma__AuthOtpClient<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AuthOtp that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthOtpFindFirstOrThrowArgs} args - Arguments to find a AuthOtp
     * @example
     * // Get one AuthOtp
     * const authOtp = await prisma.authOtp.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthOtpFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthOtpFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthOtpClient<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AuthOtps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthOtpFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuthOtps
     * const authOtps = await prisma.authOtp.findMany()
     * 
     * // Get first 10 AuthOtps
     * const authOtps = await prisma.authOtp.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authOtpWithIdOnly = await prisma.authOtp.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthOtpFindManyArgs>(args?: SelectSubset<T, AuthOtpFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AuthOtp.
     * @param {AuthOtpCreateArgs} args - Arguments to create a AuthOtp.
     * @example
     * // Create one AuthOtp
     * const AuthOtp = await prisma.authOtp.create({
     *   data: {
     *     // ... data to create a AuthOtp
     *   }
     * })
     * 
     */
    create<T extends AuthOtpCreateArgs>(args: SelectSubset<T, AuthOtpCreateArgs<ExtArgs>>): Prisma__AuthOtpClient<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AuthOtps.
     * @param {AuthOtpCreateManyArgs} args - Arguments to create many AuthOtps.
     * @example
     * // Create many AuthOtps
     * const authOtp = await prisma.authOtp.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthOtpCreateManyArgs>(args?: SelectSubset<T, AuthOtpCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuthOtps and returns the data saved in the database.
     * @param {AuthOtpCreateManyAndReturnArgs} args - Arguments to create many AuthOtps.
     * @example
     * // Create many AuthOtps
     * const authOtp = await prisma.authOtp.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuthOtps and only return the `id`
     * const authOtpWithIdOnly = await prisma.authOtp.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthOtpCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthOtpCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AuthOtp.
     * @param {AuthOtpDeleteArgs} args - Arguments to delete one AuthOtp.
     * @example
     * // Delete one AuthOtp
     * const AuthOtp = await prisma.authOtp.delete({
     *   where: {
     *     // ... filter to delete one AuthOtp
     *   }
     * })
     * 
     */
    delete<T extends AuthOtpDeleteArgs>(args: SelectSubset<T, AuthOtpDeleteArgs<ExtArgs>>): Prisma__AuthOtpClient<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AuthOtp.
     * @param {AuthOtpUpdateArgs} args - Arguments to update one AuthOtp.
     * @example
     * // Update one AuthOtp
     * const authOtp = await prisma.authOtp.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthOtpUpdateArgs>(args: SelectSubset<T, AuthOtpUpdateArgs<ExtArgs>>): Prisma__AuthOtpClient<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AuthOtps.
     * @param {AuthOtpDeleteManyArgs} args - Arguments to filter AuthOtps to delete.
     * @example
     * // Delete a few AuthOtps
     * const { count } = await prisma.authOtp.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthOtpDeleteManyArgs>(args?: SelectSubset<T, AuthOtpDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthOtps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthOtpUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuthOtps
     * const authOtp = await prisma.authOtp.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthOtpUpdateManyArgs>(args: SelectSubset<T, AuthOtpUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuthOtp.
     * @param {AuthOtpUpsertArgs} args - Arguments to update or create a AuthOtp.
     * @example
     * // Update or create a AuthOtp
     * const authOtp = await prisma.authOtp.upsert({
     *   create: {
     *     // ... data to create a AuthOtp
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuthOtp we want to update
     *   }
     * })
     */
    upsert<T extends AuthOtpUpsertArgs>(args: SelectSubset<T, AuthOtpUpsertArgs<ExtArgs>>): Prisma__AuthOtpClient<$Result.GetResult<Prisma.$AuthOtpPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AuthOtps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthOtpCountArgs} args - Arguments to filter AuthOtps to count.
     * @example
     * // Count the number of AuthOtps
     * const count = await prisma.authOtp.count({
     *   where: {
     *     // ... the filter for the AuthOtps we want to count
     *   }
     * })
    **/
    count<T extends AuthOtpCountArgs>(
      args?: Subset<T, AuthOtpCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthOtpCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuthOtp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthOtpAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AuthOtpAggregateArgs>(args: Subset<T, AuthOtpAggregateArgs>): Prisma.PrismaPromise<GetAuthOtpAggregateType<T>>

    /**
     * Group by AuthOtp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthOtpGroupByArgs} args - Group by arguments.
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
      T extends AuthOtpGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuthOtpGroupByArgs['orderBy'] }
        : { orderBy?: AuthOtpGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AuthOtpGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthOtpGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuthOtp model
   */
  readonly fields: AuthOtpFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuthOtp.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthOtpClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the AuthOtp model
   */ 
  interface AuthOtpFieldRefs {
    readonly id: FieldRef<"AuthOtp", 'String'>
    readonly userId: FieldRef<"AuthOtp", 'String'>
    readonly identifier: FieldRef<"AuthOtp", 'String'>
    readonly purpose: FieldRef<"AuthOtp", 'String'>
    readonly codeHash: FieldRef<"AuthOtp", 'String'>
    readonly expiresAt: FieldRef<"AuthOtp", 'DateTime'>
    readonly consumedAt: FieldRef<"AuthOtp", 'DateTime'>
    readonly createdAt: FieldRef<"AuthOtp", 'DateTime'>
    readonly updatedAt: FieldRef<"AuthOtp", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuthOtp findUnique
   */
  export type AuthOtpFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    /**
     * Filter, which AuthOtp to fetch.
     */
    where: AuthOtpWhereUniqueInput
  }

  /**
   * AuthOtp findUniqueOrThrow
   */
  export type AuthOtpFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    /**
     * Filter, which AuthOtp to fetch.
     */
    where: AuthOtpWhereUniqueInput
  }

  /**
   * AuthOtp findFirst
   */
  export type AuthOtpFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    /**
     * Filter, which AuthOtp to fetch.
     */
    where?: AuthOtpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthOtps to fetch.
     */
    orderBy?: AuthOtpOrderByWithRelationInput | AuthOtpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthOtps.
     */
    cursor?: AuthOtpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthOtps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthOtps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthOtps.
     */
    distinct?: AuthOtpScalarFieldEnum | AuthOtpScalarFieldEnum[]
  }

  /**
   * AuthOtp findFirstOrThrow
   */
  export type AuthOtpFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    /**
     * Filter, which AuthOtp to fetch.
     */
    where?: AuthOtpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthOtps to fetch.
     */
    orderBy?: AuthOtpOrderByWithRelationInput | AuthOtpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthOtps.
     */
    cursor?: AuthOtpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthOtps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthOtps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthOtps.
     */
    distinct?: AuthOtpScalarFieldEnum | AuthOtpScalarFieldEnum[]
  }

  /**
   * AuthOtp findMany
   */
  export type AuthOtpFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    /**
     * Filter, which AuthOtps to fetch.
     */
    where?: AuthOtpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthOtps to fetch.
     */
    orderBy?: AuthOtpOrderByWithRelationInput | AuthOtpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuthOtps.
     */
    cursor?: AuthOtpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthOtps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthOtps.
     */
    skip?: number
    distinct?: AuthOtpScalarFieldEnum | AuthOtpScalarFieldEnum[]
  }

  /**
   * AuthOtp create
   */
  export type AuthOtpCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    /**
     * The data needed to create a AuthOtp.
     */
    data: XOR<AuthOtpCreateInput, AuthOtpUncheckedCreateInput>
  }

  /**
   * AuthOtp createMany
   */
  export type AuthOtpCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuthOtps.
     */
    data: AuthOtpCreateManyInput | AuthOtpCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthOtp createManyAndReturn
   */
  export type AuthOtpCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AuthOtps.
     */
    data: AuthOtpCreateManyInput | AuthOtpCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuthOtp update
   */
  export type AuthOtpUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    /**
     * The data needed to update a AuthOtp.
     */
    data: XOR<AuthOtpUpdateInput, AuthOtpUncheckedUpdateInput>
    /**
     * Choose, which AuthOtp to update.
     */
    where: AuthOtpWhereUniqueInput
  }

  /**
   * AuthOtp updateMany
   */
  export type AuthOtpUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuthOtps.
     */
    data: XOR<AuthOtpUpdateManyMutationInput, AuthOtpUncheckedUpdateManyInput>
    /**
     * Filter which AuthOtps to update
     */
    where?: AuthOtpWhereInput
  }

  /**
   * AuthOtp upsert
   */
  export type AuthOtpUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    /**
     * The filter to search for the AuthOtp to update in case it exists.
     */
    where: AuthOtpWhereUniqueInput
    /**
     * In case the AuthOtp found by the `where` argument doesn't exist, create a new AuthOtp with this data.
     */
    create: XOR<AuthOtpCreateInput, AuthOtpUncheckedCreateInput>
    /**
     * In case the AuthOtp was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthOtpUpdateInput, AuthOtpUncheckedUpdateInput>
  }

  /**
   * AuthOtp delete
   */
  export type AuthOtpDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
    /**
     * Filter which AuthOtp to delete.
     */
    where: AuthOtpWhereUniqueInput
  }

  /**
   * AuthOtp deleteMany
   */
  export type AuthOtpDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthOtps to delete
     */
    where?: AuthOtpWhereInput
  }

  /**
   * AuthOtp without action
   */
  export type AuthOtpDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthOtp
     */
    select?: AuthOtpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthOtpInclude<ExtArgs> | null
  }


  /**
   * Model PasswordResetToken
   */

  export type AggregatePasswordResetToken = {
    _count: PasswordResetTokenCountAggregateOutputType | null
    _min: PasswordResetTokenMinAggregateOutputType | null
    _max: PasswordResetTokenMaxAggregateOutputType | null
  }

  export type PasswordResetTokenMinAggregateOutputType = {
    id: string | null
    userId: string | null
    tokenHash: string | null
    expiresAt: Date | null
    consumedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PasswordResetTokenMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    tokenHash: string | null
    expiresAt: Date | null
    consumedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PasswordResetTokenCountAggregateOutputType = {
    id: number
    userId: number
    tokenHash: number
    expiresAt: number
    consumedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PasswordResetTokenMinAggregateInputType = {
    id?: true
    userId?: true
    tokenHash?: true
    expiresAt?: true
    consumedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PasswordResetTokenMaxAggregateInputType = {
    id?: true
    userId?: true
    tokenHash?: true
    expiresAt?: true
    consumedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PasswordResetTokenCountAggregateInputType = {
    id?: true
    userId?: true
    tokenHash?: true
    expiresAt?: true
    consumedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PasswordResetTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PasswordResetToken to aggregate.
     */
    where?: PasswordResetTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResetTokens to fetch.
     */
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PasswordResetTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResetTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResetTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PasswordResetTokens
    **/
    _count?: true | PasswordResetTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PasswordResetTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PasswordResetTokenMaxAggregateInputType
  }

  export type GetPasswordResetTokenAggregateType<T extends PasswordResetTokenAggregateArgs> = {
        [P in keyof T & keyof AggregatePasswordResetToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePasswordResetToken[P]>
      : GetScalarType<T[P], AggregatePasswordResetToken[P]>
  }




  export type PasswordResetTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PasswordResetTokenWhereInput
    orderBy?: PasswordResetTokenOrderByWithAggregationInput | PasswordResetTokenOrderByWithAggregationInput[]
    by: PasswordResetTokenScalarFieldEnum[] | PasswordResetTokenScalarFieldEnum
    having?: PasswordResetTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PasswordResetTokenCountAggregateInputType | true
    _min?: PasswordResetTokenMinAggregateInputType
    _max?: PasswordResetTokenMaxAggregateInputType
  }

  export type PasswordResetTokenGroupByOutputType = {
    id: string
    userId: string
    tokenHash: string
    expiresAt: Date
    consumedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: PasswordResetTokenCountAggregateOutputType | null
    _min: PasswordResetTokenMinAggregateOutputType | null
    _max: PasswordResetTokenMaxAggregateOutputType | null
  }

  type GetPasswordResetTokenGroupByPayload<T extends PasswordResetTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PasswordResetTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PasswordResetTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PasswordResetTokenGroupByOutputType[P]>
            : GetScalarType<T[P], PasswordResetTokenGroupByOutputType[P]>
        }
      >
    >


  export type PasswordResetTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passwordResetToken"]>

  export type PasswordResetTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passwordResetToken"]>

  export type PasswordResetTokenSelectScalar = {
    id?: boolean
    userId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PasswordResetTokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PasswordResetTokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PasswordResetTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PasswordResetToken"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      tokenHash: string
      expiresAt: Date
      consumedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["passwordResetToken"]>
    composites: {}
  }

  type PasswordResetTokenGetPayload<S extends boolean | null | undefined | PasswordResetTokenDefaultArgs> = $Result.GetResult<Prisma.$PasswordResetTokenPayload, S>

  type PasswordResetTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PasswordResetTokenFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PasswordResetTokenCountAggregateInputType | true
    }

  export interface PasswordResetTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PasswordResetToken'], meta: { name: 'PasswordResetToken' } }
    /**
     * Find zero or one PasswordResetToken that matches the filter.
     * @param {PasswordResetTokenFindUniqueArgs} args - Arguments to find a PasswordResetToken
     * @example
     * // Get one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PasswordResetTokenFindUniqueArgs>(args: SelectSubset<T, PasswordResetTokenFindUniqueArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PasswordResetToken that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PasswordResetTokenFindUniqueOrThrowArgs} args - Arguments to find a PasswordResetToken
     * @example
     * // Get one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PasswordResetTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, PasswordResetTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PasswordResetToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenFindFirstArgs} args - Arguments to find a PasswordResetToken
     * @example
     * // Get one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PasswordResetTokenFindFirstArgs>(args?: SelectSubset<T, PasswordResetTokenFindFirstArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PasswordResetToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenFindFirstOrThrowArgs} args - Arguments to find a PasswordResetToken
     * @example
     * // Get one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PasswordResetTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, PasswordResetTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PasswordResetTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PasswordResetTokens
     * const passwordResetTokens = await prisma.passwordResetToken.findMany()
     * 
     * // Get first 10 PasswordResetTokens
     * const passwordResetTokens = await prisma.passwordResetToken.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const passwordResetTokenWithIdOnly = await prisma.passwordResetToken.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PasswordResetTokenFindManyArgs>(args?: SelectSubset<T, PasswordResetTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PasswordResetToken.
     * @param {PasswordResetTokenCreateArgs} args - Arguments to create a PasswordResetToken.
     * @example
     * // Create one PasswordResetToken
     * const PasswordResetToken = await prisma.passwordResetToken.create({
     *   data: {
     *     // ... data to create a PasswordResetToken
     *   }
     * })
     * 
     */
    create<T extends PasswordResetTokenCreateArgs>(args: SelectSubset<T, PasswordResetTokenCreateArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PasswordResetTokens.
     * @param {PasswordResetTokenCreateManyArgs} args - Arguments to create many PasswordResetTokens.
     * @example
     * // Create many PasswordResetTokens
     * const passwordResetToken = await prisma.passwordResetToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PasswordResetTokenCreateManyArgs>(args?: SelectSubset<T, PasswordResetTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PasswordResetTokens and returns the data saved in the database.
     * @param {PasswordResetTokenCreateManyAndReturnArgs} args - Arguments to create many PasswordResetTokens.
     * @example
     * // Create many PasswordResetTokens
     * const passwordResetToken = await prisma.passwordResetToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PasswordResetTokens and only return the `id`
     * const passwordResetTokenWithIdOnly = await prisma.passwordResetToken.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PasswordResetTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, PasswordResetTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PasswordResetToken.
     * @param {PasswordResetTokenDeleteArgs} args - Arguments to delete one PasswordResetToken.
     * @example
     * // Delete one PasswordResetToken
     * const PasswordResetToken = await prisma.passwordResetToken.delete({
     *   where: {
     *     // ... filter to delete one PasswordResetToken
     *   }
     * })
     * 
     */
    delete<T extends PasswordResetTokenDeleteArgs>(args: SelectSubset<T, PasswordResetTokenDeleteArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PasswordResetToken.
     * @param {PasswordResetTokenUpdateArgs} args - Arguments to update one PasswordResetToken.
     * @example
     * // Update one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PasswordResetTokenUpdateArgs>(args: SelectSubset<T, PasswordResetTokenUpdateArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PasswordResetTokens.
     * @param {PasswordResetTokenDeleteManyArgs} args - Arguments to filter PasswordResetTokens to delete.
     * @example
     * // Delete a few PasswordResetTokens
     * const { count } = await prisma.passwordResetToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PasswordResetTokenDeleteManyArgs>(args?: SelectSubset<T, PasswordResetTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PasswordResetTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PasswordResetTokens
     * const passwordResetToken = await prisma.passwordResetToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PasswordResetTokenUpdateManyArgs>(args: SelectSubset<T, PasswordResetTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PasswordResetToken.
     * @param {PasswordResetTokenUpsertArgs} args - Arguments to update or create a PasswordResetToken.
     * @example
     * // Update or create a PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.upsert({
     *   create: {
     *     // ... data to create a PasswordResetToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PasswordResetToken we want to update
     *   }
     * })
     */
    upsert<T extends PasswordResetTokenUpsertArgs>(args: SelectSubset<T, PasswordResetTokenUpsertArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PasswordResetTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenCountArgs} args - Arguments to filter PasswordResetTokens to count.
     * @example
     * // Count the number of PasswordResetTokens
     * const count = await prisma.passwordResetToken.count({
     *   where: {
     *     // ... the filter for the PasswordResetTokens we want to count
     *   }
     * })
    **/
    count<T extends PasswordResetTokenCountArgs>(
      args?: Subset<T, PasswordResetTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PasswordResetTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PasswordResetToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PasswordResetTokenAggregateArgs>(args: Subset<T, PasswordResetTokenAggregateArgs>): Prisma.PrismaPromise<GetPasswordResetTokenAggregateType<T>>

    /**
     * Group by PasswordResetToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenGroupByArgs} args - Group by arguments.
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
      T extends PasswordResetTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PasswordResetTokenGroupByArgs['orderBy'] }
        : { orderBy?: PasswordResetTokenGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PasswordResetTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPasswordResetTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PasswordResetToken model
   */
  readonly fields: PasswordResetTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PasswordResetToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PasswordResetTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the PasswordResetToken model
   */ 
  interface PasswordResetTokenFieldRefs {
    readonly id: FieldRef<"PasswordResetToken", 'String'>
    readonly userId: FieldRef<"PasswordResetToken", 'String'>
    readonly tokenHash: FieldRef<"PasswordResetToken", 'String'>
    readonly expiresAt: FieldRef<"PasswordResetToken", 'DateTime'>
    readonly consumedAt: FieldRef<"PasswordResetToken", 'DateTime'>
    readonly createdAt: FieldRef<"PasswordResetToken", 'DateTime'>
    readonly updatedAt: FieldRef<"PasswordResetToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PasswordResetToken findUnique
   */
  export type PasswordResetTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetToken to fetch.
     */
    where: PasswordResetTokenWhereUniqueInput
  }

  /**
   * PasswordResetToken findUniqueOrThrow
   */
  export type PasswordResetTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetToken to fetch.
     */
    where: PasswordResetTokenWhereUniqueInput
  }

  /**
   * PasswordResetToken findFirst
   */
  export type PasswordResetTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetToken to fetch.
     */
    where?: PasswordResetTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResetTokens to fetch.
     */
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PasswordResetTokens.
     */
    cursor?: PasswordResetTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResetTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResetTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PasswordResetTokens.
     */
    distinct?: PasswordResetTokenScalarFieldEnum | PasswordResetTokenScalarFieldEnum[]
  }

  /**
   * PasswordResetToken findFirstOrThrow
   */
  export type PasswordResetTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetToken to fetch.
     */
    where?: PasswordResetTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResetTokens to fetch.
     */
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PasswordResetTokens.
     */
    cursor?: PasswordResetTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResetTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResetTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PasswordResetTokens.
     */
    distinct?: PasswordResetTokenScalarFieldEnum | PasswordResetTokenScalarFieldEnum[]
  }

  /**
   * PasswordResetToken findMany
   */
  export type PasswordResetTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetTokens to fetch.
     */
    where?: PasswordResetTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResetTokens to fetch.
     */
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PasswordResetTokens.
     */
    cursor?: PasswordResetTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResetTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResetTokens.
     */
    skip?: number
    distinct?: PasswordResetTokenScalarFieldEnum | PasswordResetTokenScalarFieldEnum[]
  }

  /**
   * PasswordResetToken create
   */
  export type PasswordResetTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * The data needed to create a PasswordResetToken.
     */
    data: XOR<PasswordResetTokenCreateInput, PasswordResetTokenUncheckedCreateInput>
  }

  /**
   * PasswordResetToken createMany
   */
  export type PasswordResetTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PasswordResetTokens.
     */
    data: PasswordResetTokenCreateManyInput | PasswordResetTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PasswordResetToken createManyAndReturn
   */
  export type PasswordResetTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PasswordResetTokens.
     */
    data: PasswordResetTokenCreateManyInput | PasswordResetTokenCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PasswordResetToken update
   */
  export type PasswordResetTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * The data needed to update a PasswordResetToken.
     */
    data: XOR<PasswordResetTokenUpdateInput, PasswordResetTokenUncheckedUpdateInput>
    /**
     * Choose, which PasswordResetToken to update.
     */
    where: PasswordResetTokenWhereUniqueInput
  }

  /**
   * PasswordResetToken updateMany
   */
  export type PasswordResetTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PasswordResetTokens.
     */
    data: XOR<PasswordResetTokenUpdateManyMutationInput, PasswordResetTokenUncheckedUpdateManyInput>
    /**
     * Filter which PasswordResetTokens to update
     */
    where?: PasswordResetTokenWhereInput
  }

  /**
   * PasswordResetToken upsert
   */
  export type PasswordResetTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * The filter to search for the PasswordResetToken to update in case it exists.
     */
    where: PasswordResetTokenWhereUniqueInput
    /**
     * In case the PasswordResetToken found by the `where` argument doesn't exist, create a new PasswordResetToken with this data.
     */
    create: XOR<PasswordResetTokenCreateInput, PasswordResetTokenUncheckedCreateInput>
    /**
     * In case the PasswordResetToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PasswordResetTokenUpdateInput, PasswordResetTokenUncheckedUpdateInput>
  }

  /**
   * PasswordResetToken delete
   */
  export type PasswordResetTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter which PasswordResetToken to delete.
     */
    where: PasswordResetTokenWhereUniqueInput
  }

  /**
   * PasswordResetToken deleteMany
   */
  export type PasswordResetTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PasswordResetTokens to delete
     */
    where?: PasswordResetTokenWhereInput
  }

  /**
   * PasswordResetToken without action
   */
  export type PasswordResetTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
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


  export const TenantScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    name: 'name',
    country: 'country',
    status: 'status',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const BusinessEntityScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    country: 'country',
    businessModel: 'businessModel',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BusinessEntityScalarFieldEnum = (typeof BusinessEntityScalarFieldEnum)[keyof typeof BusinessEntityScalarFieldEnum]


  export const OperatingUnitScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    businessEntityId: 'businessEntityId',
    name: 'name',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OperatingUnitScalarFieldEnum = (typeof OperatingUnitScalarFieldEnum)[keyof typeof OperatingUnitScalarFieldEnum]


  export const FleetScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    operatingUnitId: 'operatingUnitId',
    name: 'name',
    businessModel: 'businessModel',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FleetScalarFieldEnum = (typeof FleetScalarFieldEnum)[keyof typeof FleetScalarFieldEnum]


  export const DriverScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    fleetId: 'fleetId',
    status: 'status',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: 'phone',
    email: 'email',
    dateOfBirth: 'dateOfBirth',
    nationality: 'nationality',
    personId: 'personId',
    businessEntityId: 'businessEntityId',
    operatingUnitId: 'operatingUnitId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DriverScalarFieldEnum = (typeof DriverScalarFieldEnum)[keyof typeof DriverScalarFieldEnum]


  export const VehicleScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    fleetId: 'fleetId',
    status: 'status',
    vehicleType: 'vehicleType',
    make: 'make',
    model: 'model',
    year: 'year',
    plate: 'plate',
    color: 'color',
    vin: 'vin',
    operatingUnitId: 'operatingUnitId',
    businessEntityId: 'businessEntityId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VehicleScalarFieldEnum = (typeof VehicleScalarFieldEnum)[keyof typeof VehicleScalarFieldEnum]


  export const AssignmentScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    fleetId: 'fleetId',
    driverId: 'driverId',
    vehicleId: 'vehicleId',
    status: 'status',
    startedAt: 'startedAt',
    endedAt: 'endedAt',
    notes: 'notes',
    operatingUnitId: 'operatingUnitId',
    businessEntityId: 'businessEntityId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AssignmentScalarFieldEnum = (typeof AssignmentScalarFieldEnum)[keyof typeof AssignmentScalarFieldEnum]


  export const RemittanceScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    assignmentId: 'assignmentId',
    driverId: 'driverId',
    vehicleId: 'vehicleId',
    status: 'status',
    amountMinorUnits: 'amountMinorUnits',
    currency: 'currency',
    dueDate: 'dueDate',
    paidDate: 'paidDate',
    notes: 'notes',
    fleetId: 'fleetId',
    operatingUnitId: 'operatingUnitId',
    businessEntityId: 'businessEntityId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RemittanceScalarFieldEnum = (typeof RemittanceScalarFieldEnum)[keyof typeof RemittanceScalarFieldEnum]


  export const OperationalWalletScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    businessEntityId: 'businessEntityId',
    currency: 'currency',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OperationalWalletScalarFieldEnum = (typeof OperationalWalletScalarFieldEnum)[keyof typeof OperationalWalletScalarFieldEnum]


  export const OperationalWalletEntryScalarFieldEnum: {
    id: 'id',
    walletId: 'walletId',
    type: 'type',
    amountMinorUnits: 'amountMinorUnits',
    currency: 'currency',
    referenceId: 'referenceId',
    referenceType: 'referenceType',
    description: 'description',
    createdAt: 'createdAt'
  };

  export type OperationalWalletEntryScalarFieldEnum = (typeof OperationalWalletEntryScalarFieldEnum)[keyof typeof OperationalWalletEntryScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    email: 'email',
    phone: 'phone',
    name: 'name',
    role: 'role',
    isActive: 'isActive',
    isEmailVerified: 'isEmailVerified',
    businessEntityId: 'businessEntityId',
    operatingUnitId: 'operatingUnitId',
    passwordHash: 'passwordHash',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AuthOtpScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    identifier: 'identifier',
    purpose: 'purpose',
    codeHash: 'codeHash',
    expiresAt: 'expiresAt',
    consumedAt: 'consumedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AuthOtpScalarFieldEnum = (typeof AuthOtpScalarFieldEnum)[keyof typeof AuthOtpScalarFieldEnum]


  export const PasswordResetTokenScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    tokenHash: 'tokenHash',
    expiresAt: 'expiresAt',
    consumedAt: 'consumedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PasswordResetTokenScalarFieldEnum = (typeof PasswordResetTokenScalarFieldEnum)[keyof typeof PasswordResetTokenScalarFieldEnum]


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


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


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
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


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
   * Deep Input Types
   */


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: StringFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    name?: StringFilter<"Tenant"> | string
    country?: StringFilter<"Tenant"> | string
    status?: StringFilter<"Tenant"> | string
    metadata?: JsonNullableFilter<"Tenant">
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    businessEntities?: BusinessEntityListRelationFilter
    users?: UserListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    country?: SortOrder
    status?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    businessEntities?: BusinessEntityOrderByRelationAggregateInput
    users?: UserOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    name?: StringFilter<"Tenant"> | string
    country?: StringFilter<"Tenant"> | string
    status?: StringFilter<"Tenant"> | string
    metadata?: JsonNullableFilter<"Tenant">
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    businessEntities?: BusinessEntityListRelationFilter
    users?: UserListRelationFilter
  }, "id" | "slug">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    country?: SortOrder
    status?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    name?: StringWithAggregatesFilter<"Tenant"> | string
    country?: StringWithAggregatesFilter<"Tenant"> | string
    status?: StringWithAggregatesFilter<"Tenant"> | string
    metadata?: JsonNullableWithAggregatesFilter<"Tenant">
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type BusinessEntityWhereInput = {
    AND?: BusinessEntityWhereInput | BusinessEntityWhereInput[]
    OR?: BusinessEntityWhereInput[]
    NOT?: BusinessEntityWhereInput | BusinessEntityWhereInput[]
    id?: StringFilter<"BusinessEntity"> | string
    tenantId?: StringFilter<"BusinessEntity"> | string
    name?: StringFilter<"BusinessEntity"> | string
    country?: StringFilter<"BusinessEntity"> | string
    businessModel?: StringFilter<"BusinessEntity"> | string
    status?: StringFilter<"BusinessEntity"> | string
    createdAt?: DateTimeFilter<"BusinessEntity"> | Date | string
    updatedAt?: DateTimeFilter<"BusinessEntity"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    operatingUnits?: OperatingUnitListRelationFilter
  }

  export type BusinessEntityOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    country?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    operatingUnits?: OperatingUnitOrderByRelationAggregateInput
  }

  export type BusinessEntityWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BusinessEntityWhereInput | BusinessEntityWhereInput[]
    OR?: BusinessEntityWhereInput[]
    NOT?: BusinessEntityWhereInput | BusinessEntityWhereInput[]
    tenantId?: StringFilter<"BusinessEntity"> | string
    name?: StringFilter<"BusinessEntity"> | string
    country?: StringFilter<"BusinessEntity"> | string
    businessModel?: StringFilter<"BusinessEntity"> | string
    status?: StringFilter<"BusinessEntity"> | string
    createdAt?: DateTimeFilter<"BusinessEntity"> | Date | string
    updatedAt?: DateTimeFilter<"BusinessEntity"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    operatingUnits?: OperatingUnitListRelationFilter
  }, "id">

  export type BusinessEntityOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    country?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BusinessEntityCountOrderByAggregateInput
    _max?: BusinessEntityMaxOrderByAggregateInput
    _min?: BusinessEntityMinOrderByAggregateInput
  }

  export type BusinessEntityScalarWhereWithAggregatesInput = {
    AND?: BusinessEntityScalarWhereWithAggregatesInput | BusinessEntityScalarWhereWithAggregatesInput[]
    OR?: BusinessEntityScalarWhereWithAggregatesInput[]
    NOT?: BusinessEntityScalarWhereWithAggregatesInput | BusinessEntityScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BusinessEntity"> | string
    tenantId?: StringWithAggregatesFilter<"BusinessEntity"> | string
    name?: StringWithAggregatesFilter<"BusinessEntity"> | string
    country?: StringWithAggregatesFilter<"BusinessEntity"> | string
    businessModel?: StringWithAggregatesFilter<"BusinessEntity"> | string
    status?: StringWithAggregatesFilter<"BusinessEntity"> | string
    createdAt?: DateTimeWithAggregatesFilter<"BusinessEntity"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BusinessEntity"> | Date | string
  }

  export type OperatingUnitWhereInput = {
    AND?: OperatingUnitWhereInput | OperatingUnitWhereInput[]
    OR?: OperatingUnitWhereInput[]
    NOT?: OperatingUnitWhereInput | OperatingUnitWhereInput[]
    id?: StringFilter<"OperatingUnit"> | string
    tenantId?: StringFilter<"OperatingUnit"> | string
    businessEntityId?: StringFilter<"OperatingUnit"> | string
    name?: StringFilter<"OperatingUnit"> | string
    status?: StringFilter<"OperatingUnit"> | string
    createdAt?: DateTimeFilter<"OperatingUnit"> | Date | string
    updatedAt?: DateTimeFilter<"OperatingUnit"> | Date | string
    businessEntity?: XOR<BusinessEntityRelationFilter, BusinessEntityWhereInput>
    fleets?: FleetListRelationFilter
  }

  export type OperatingUnitOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    businessEntity?: BusinessEntityOrderByWithRelationInput
    fleets?: FleetOrderByRelationAggregateInput
  }

  export type OperatingUnitWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OperatingUnitWhereInput | OperatingUnitWhereInput[]
    OR?: OperatingUnitWhereInput[]
    NOT?: OperatingUnitWhereInput | OperatingUnitWhereInput[]
    tenantId?: StringFilter<"OperatingUnit"> | string
    businessEntityId?: StringFilter<"OperatingUnit"> | string
    name?: StringFilter<"OperatingUnit"> | string
    status?: StringFilter<"OperatingUnit"> | string
    createdAt?: DateTimeFilter<"OperatingUnit"> | Date | string
    updatedAt?: DateTimeFilter<"OperatingUnit"> | Date | string
    businessEntity?: XOR<BusinessEntityRelationFilter, BusinessEntityWhereInput>
    fleets?: FleetListRelationFilter
  }, "id">

  export type OperatingUnitOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OperatingUnitCountOrderByAggregateInput
    _max?: OperatingUnitMaxOrderByAggregateInput
    _min?: OperatingUnitMinOrderByAggregateInput
  }

  export type OperatingUnitScalarWhereWithAggregatesInput = {
    AND?: OperatingUnitScalarWhereWithAggregatesInput | OperatingUnitScalarWhereWithAggregatesInput[]
    OR?: OperatingUnitScalarWhereWithAggregatesInput[]
    NOT?: OperatingUnitScalarWhereWithAggregatesInput | OperatingUnitScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OperatingUnit"> | string
    tenantId?: StringWithAggregatesFilter<"OperatingUnit"> | string
    businessEntityId?: StringWithAggregatesFilter<"OperatingUnit"> | string
    name?: StringWithAggregatesFilter<"OperatingUnit"> | string
    status?: StringWithAggregatesFilter<"OperatingUnit"> | string
    createdAt?: DateTimeWithAggregatesFilter<"OperatingUnit"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OperatingUnit"> | Date | string
  }

  export type FleetWhereInput = {
    AND?: FleetWhereInput | FleetWhereInput[]
    OR?: FleetWhereInput[]
    NOT?: FleetWhereInput | FleetWhereInput[]
    id?: StringFilter<"Fleet"> | string
    tenantId?: StringFilter<"Fleet"> | string
    operatingUnitId?: StringFilter<"Fleet"> | string
    name?: StringFilter<"Fleet"> | string
    businessModel?: StringFilter<"Fleet"> | string
    status?: StringFilter<"Fleet"> | string
    createdAt?: DateTimeFilter<"Fleet"> | Date | string
    updatedAt?: DateTimeFilter<"Fleet"> | Date | string
    operatingUnit?: XOR<OperatingUnitRelationFilter, OperatingUnitWhereInput>
    drivers?: DriverListRelationFilter
    vehicles?: VehicleListRelationFilter
  }

  export type FleetOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    operatingUnitId?: SortOrder
    name?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    operatingUnit?: OperatingUnitOrderByWithRelationInput
    drivers?: DriverOrderByRelationAggregateInput
    vehicles?: VehicleOrderByRelationAggregateInput
  }

  export type FleetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FleetWhereInput | FleetWhereInput[]
    OR?: FleetWhereInput[]
    NOT?: FleetWhereInput | FleetWhereInput[]
    tenantId?: StringFilter<"Fleet"> | string
    operatingUnitId?: StringFilter<"Fleet"> | string
    name?: StringFilter<"Fleet"> | string
    businessModel?: StringFilter<"Fleet"> | string
    status?: StringFilter<"Fleet"> | string
    createdAt?: DateTimeFilter<"Fleet"> | Date | string
    updatedAt?: DateTimeFilter<"Fleet"> | Date | string
    operatingUnit?: XOR<OperatingUnitRelationFilter, OperatingUnitWhereInput>
    drivers?: DriverListRelationFilter
    vehicles?: VehicleListRelationFilter
  }, "id">

  export type FleetOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    operatingUnitId?: SortOrder
    name?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FleetCountOrderByAggregateInput
    _max?: FleetMaxOrderByAggregateInput
    _min?: FleetMinOrderByAggregateInput
  }

  export type FleetScalarWhereWithAggregatesInput = {
    AND?: FleetScalarWhereWithAggregatesInput | FleetScalarWhereWithAggregatesInput[]
    OR?: FleetScalarWhereWithAggregatesInput[]
    NOT?: FleetScalarWhereWithAggregatesInput | FleetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Fleet"> | string
    tenantId?: StringWithAggregatesFilter<"Fleet"> | string
    operatingUnitId?: StringWithAggregatesFilter<"Fleet"> | string
    name?: StringWithAggregatesFilter<"Fleet"> | string
    businessModel?: StringWithAggregatesFilter<"Fleet"> | string
    status?: StringWithAggregatesFilter<"Fleet"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Fleet"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Fleet"> | Date | string
  }

  export type DriverWhereInput = {
    AND?: DriverWhereInput | DriverWhereInput[]
    OR?: DriverWhereInput[]
    NOT?: DriverWhereInput | DriverWhereInput[]
    id?: StringFilter<"Driver"> | string
    tenantId?: StringFilter<"Driver"> | string
    fleetId?: StringFilter<"Driver"> | string
    status?: StringFilter<"Driver"> | string
    firstName?: StringFilter<"Driver"> | string
    lastName?: StringFilter<"Driver"> | string
    phone?: StringFilter<"Driver"> | string
    email?: StringNullableFilter<"Driver"> | string | null
    dateOfBirth?: StringNullableFilter<"Driver"> | string | null
    nationality?: StringNullableFilter<"Driver"> | string | null
    personId?: StringNullableFilter<"Driver"> | string | null
    businessEntityId?: StringFilter<"Driver"> | string
    operatingUnitId?: StringFilter<"Driver"> | string
    createdAt?: DateTimeFilter<"Driver"> | Date | string
    updatedAt?: DateTimeFilter<"Driver"> | Date | string
    fleet?: XOR<FleetRelationFilter, FleetWhereInput>
  }

  export type DriverOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    email?: SortOrderInput | SortOrder
    dateOfBirth?: SortOrderInput | SortOrder
    nationality?: SortOrderInput | SortOrder
    personId?: SortOrderInput | SortOrder
    businessEntityId?: SortOrder
    operatingUnitId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fleet?: FleetOrderByWithRelationInput
  }

  export type DriverWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_phone?: DriverTenantIdPhoneCompoundUniqueInput
    AND?: DriverWhereInput | DriverWhereInput[]
    OR?: DriverWhereInput[]
    NOT?: DriverWhereInput | DriverWhereInput[]
    tenantId?: StringFilter<"Driver"> | string
    fleetId?: StringFilter<"Driver"> | string
    status?: StringFilter<"Driver"> | string
    firstName?: StringFilter<"Driver"> | string
    lastName?: StringFilter<"Driver"> | string
    phone?: StringFilter<"Driver"> | string
    email?: StringNullableFilter<"Driver"> | string | null
    dateOfBirth?: StringNullableFilter<"Driver"> | string | null
    nationality?: StringNullableFilter<"Driver"> | string | null
    personId?: StringNullableFilter<"Driver"> | string | null
    businessEntityId?: StringFilter<"Driver"> | string
    operatingUnitId?: StringFilter<"Driver"> | string
    createdAt?: DateTimeFilter<"Driver"> | Date | string
    updatedAt?: DateTimeFilter<"Driver"> | Date | string
    fleet?: XOR<FleetRelationFilter, FleetWhereInput>
  }, "id" | "tenantId_phone">

  export type DriverOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    email?: SortOrderInput | SortOrder
    dateOfBirth?: SortOrderInput | SortOrder
    nationality?: SortOrderInput | SortOrder
    personId?: SortOrderInput | SortOrder
    businessEntityId?: SortOrder
    operatingUnitId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DriverCountOrderByAggregateInput
    _max?: DriverMaxOrderByAggregateInput
    _min?: DriverMinOrderByAggregateInput
  }

  export type DriverScalarWhereWithAggregatesInput = {
    AND?: DriverScalarWhereWithAggregatesInput | DriverScalarWhereWithAggregatesInput[]
    OR?: DriverScalarWhereWithAggregatesInput[]
    NOT?: DriverScalarWhereWithAggregatesInput | DriverScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Driver"> | string
    tenantId?: StringWithAggregatesFilter<"Driver"> | string
    fleetId?: StringWithAggregatesFilter<"Driver"> | string
    status?: StringWithAggregatesFilter<"Driver"> | string
    firstName?: StringWithAggregatesFilter<"Driver"> | string
    lastName?: StringWithAggregatesFilter<"Driver"> | string
    phone?: StringWithAggregatesFilter<"Driver"> | string
    email?: StringNullableWithAggregatesFilter<"Driver"> | string | null
    dateOfBirth?: StringNullableWithAggregatesFilter<"Driver"> | string | null
    nationality?: StringNullableWithAggregatesFilter<"Driver"> | string | null
    personId?: StringNullableWithAggregatesFilter<"Driver"> | string | null
    businessEntityId?: StringWithAggregatesFilter<"Driver"> | string
    operatingUnitId?: StringWithAggregatesFilter<"Driver"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Driver"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Driver"> | Date | string
  }

  export type VehicleWhereInput = {
    AND?: VehicleWhereInput | VehicleWhereInput[]
    OR?: VehicleWhereInput[]
    NOT?: VehicleWhereInput | VehicleWhereInput[]
    id?: StringFilter<"Vehicle"> | string
    tenantId?: StringFilter<"Vehicle"> | string
    fleetId?: StringFilter<"Vehicle"> | string
    status?: StringFilter<"Vehicle"> | string
    vehicleType?: StringFilter<"Vehicle"> | string
    make?: StringFilter<"Vehicle"> | string
    model?: StringFilter<"Vehicle"> | string
    year?: IntFilter<"Vehicle"> | number
    plate?: StringFilter<"Vehicle"> | string
    color?: StringNullableFilter<"Vehicle"> | string | null
    vin?: StringNullableFilter<"Vehicle"> | string | null
    operatingUnitId?: StringFilter<"Vehicle"> | string
    businessEntityId?: StringFilter<"Vehicle"> | string
    createdAt?: DateTimeFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeFilter<"Vehicle"> | Date | string
    fleet?: XOR<FleetRelationFilter, FleetWhereInput>
  }

  export type VehicleOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    vehicleType?: SortOrder
    make?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plate?: SortOrder
    color?: SortOrderInput | SortOrder
    vin?: SortOrderInput | SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fleet?: FleetOrderByWithRelationInput
  }

  export type VehicleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_plate?: VehicleTenantIdPlateCompoundUniqueInput
    AND?: VehicleWhereInput | VehicleWhereInput[]
    OR?: VehicleWhereInput[]
    NOT?: VehicleWhereInput | VehicleWhereInput[]
    tenantId?: StringFilter<"Vehicle"> | string
    fleetId?: StringFilter<"Vehicle"> | string
    status?: StringFilter<"Vehicle"> | string
    vehicleType?: StringFilter<"Vehicle"> | string
    make?: StringFilter<"Vehicle"> | string
    model?: StringFilter<"Vehicle"> | string
    year?: IntFilter<"Vehicle"> | number
    plate?: StringFilter<"Vehicle"> | string
    color?: StringNullableFilter<"Vehicle"> | string | null
    vin?: StringNullableFilter<"Vehicle"> | string | null
    operatingUnitId?: StringFilter<"Vehicle"> | string
    businessEntityId?: StringFilter<"Vehicle"> | string
    createdAt?: DateTimeFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeFilter<"Vehicle"> | Date | string
    fleet?: XOR<FleetRelationFilter, FleetWhereInput>
  }, "id" | "tenantId_plate">

  export type VehicleOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    vehicleType?: SortOrder
    make?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plate?: SortOrder
    color?: SortOrderInput | SortOrder
    vin?: SortOrderInput | SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VehicleCountOrderByAggregateInput
    _avg?: VehicleAvgOrderByAggregateInput
    _max?: VehicleMaxOrderByAggregateInput
    _min?: VehicleMinOrderByAggregateInput
    _sum?: VehicleSumOrderByAggregateInput
  }

  export type VehicleScalarWhereWithAggregatesInput = {
    AND?: VehicleScalarWhereWithAggregatesInput | VehicleScalarWhereWithAggregatesInput[]
    OR?: VehicleScalarWhereWithAggregatesInput[]
    NOT?: VehicleScalarWhereWithAggregatesInput | VehicleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Vehicle"> | string
    tenantId?: StringWithAggregatesFilter<"Vehicle"> | string
    fleetId?: StringWithAggregatesFilter<"Vehicle"> | string
    status?: StringWithAggregatesFilter<"Vehicle"> | string
    vehicleType?: StringWithAggregatesFilter<"Vehicle"> | string
    make?: StringWithAggregatesFilter<"Vehicle"> | string
    model?: StringWithAggregatesFilter<"Vehicle"> | string
    year?: IntWithAggregatesFilter<"Vehicle"> | number
    plate?: StringWithAggregatesFilter<"Vehicle"> | string
    color?: StringNullableWithAggregatesFilter<"Vehicle"> | string | null
    vin?: StringNullableWithAggregatesFilter<"Vehicle"> | string | null
    operatingUnitId?: StringWithAggregatesFilter<"Vehicle"> | string
    businessEntityId?: StringWithAggregatesFilter<"Vehicle"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Vehicle"> | Date | string
  }

  export type AssignmentWhereInput = {
    AND?: AssignmentWhereInput | AssignmentWhereInput[]
    OR?: AssignmentWhereInput[]
    NOT?: AssignmentWhereInput | AssignmentWhereInput[]
    id?: StringFilter<"Assignment"> | string
    tenantId?: StringFilter<"Assignment"> | string
    fleetId?: StringFilter<"Assignment"> | string
    driverId?: StringFilter<"Assignment"> | string
    vehicleId?: StringFilter<"Assignment"> | string
    status?: StringFilter<"Assignment"> | string
    startedAt?: DateTimeFilter<"Assignment"> | Date | string
    endedAt?: DateTimeNullableFilter<"Assignment"> | Date | string | null
    notes?: StringNullableFilter<"Assignment"> | string | null
    operatingUnitId?: StringFilter<"Assignment"> | string
    businessEntityId?: StringFilter<"Assignment"> | string
    createdAt?: DateTimeFilter<"Assignment"> | Date | string
    updatedAt?: DateTimeFilter<"Assignment"> | Date | string
  }

  export type AssignmentOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssignmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AssignmentWhereInput | AssignmentWhereInput[]
    OR?: AssignmentWhereInput[]
    NOT?: AssignmentWhereInput | AssignmentWhereInput[]
    tenantId?: StringFilter<"Assignment"> | string
    fleetId?: StringFilter<"Assignment"> | string
    driverId?: StringFilter<"Assignment"> | string
    vehicleId?: StringFilter<"Assignment"> | string
    status?: StringFilter<"Assignment"> | string
    startedAt?: DateTimeFilter<"Assignment"> | Date | string
    endedAt?: DateTimeNullableFilter<"Assignment"> | Date | string | null
    notes?: StringNullableFilter<"Assignment"> | string | null
    operatingUnitId?: StringFilter<"Assignment"> | string
    businessEntityId?: StringFilter<"Assignment"> | string
    createdAt?: DateTimeFilter<"Assignment"> | Date | string
    updatedAt?: DateTimeFilter<"Assignment"> | Date | string
  }, "id">

  export type AssignmentOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AssignmentCountOrderByAggregateInput
    _max?: AssignmentMaxOrderByAggregateInput
    _min?: AssignmentMinOrderByAggregateInput
  }

  export type AssignmentScalarWhereWithAggregatesInput = {
    AND?: AssignmentScalarWhereWithAggregatesInput | AssignmentScalarWhereWithAggregatesInput[]
    OR?: AssignmentScalarWhereWithAggregatesInput[]
    NOT?: AssignmentScalarWhereWithAggregatesInput | AssignmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Assignment"> | string
    tenantId?: StringWithAggregatesFilter<"Assignment"> | string
    fleetId?: StringWithAggregatesFilter<"Assignment"> | string
    driverId?: StringWithAggregatesFilter<"Assignment"> | string
    vehicleId?: StringWithAggregatesFilter<"Assignment"> | string
    status?: StringWithAggregatesFilter<"Assignment"> | string
    startedAt?: DateTimeWithAggregatesFilter<"Assignment"> | Date | string
    endedAt?: DateTimeNullableWithAggregatesFilter<"Assignment"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"Assignment"> | string | null
    operatingUnitId?: StringWithAggregatesFilter<"Assignment"> | string
    businessEntityId?: StringWithAggregatesFilter<"Assignment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Assignment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Assignment"> | Date | string
  }

  export type RemittanceWhereInput = {
    AND?: RemittanceWhereInput | RemittanceWhereInput[]
    OR?: RemittanceWhereInput[]
    NOT?: RemittanceWhereInput | RemittanceWhereInput[]
    id?: StringFilter<"Remittance"> | string
    tenantId?: StringFilter<"Remittance"> | string
    assignmentId?: StringFilter<"Remittance"> | string
    driverId?: StringFilter<"Remittance"> | string
    vehicleId?: StringFilter<"Remittance"> | string
    status?: StringFilter<"Remittance"> | string
    amountMinorUnits?: IntFilter<"Remittance"> | number
    currency?: StringFilter<"Remittance"> | string
    dueDate?: StringFilter<"Remittance"> | string
    paidDate?: StringNullableFilter<"Remittance"> | string | null
    notes?: StringNullableFilter<"Remittance"> | string | null
    fleetId?: StringFilter<"Remittance"> | string
    operatingUnitId?: StringFilter<"Remittance"> | string
    businessEntityId?: StringFilter<"Remittance"> | string
    createdAt?: DateTimeFilter<"Remittance"> | Date | string
    updatedAt?: DateTimeFilter<"Remittance"> | Date | string
  }

  export type RemittanceOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assignmentId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    dueDate?: SortOrder
    paidDate?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    fleetId?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RemittanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RemittanceWhereInput | RemittanceWhereInput[]
    OR?: RemittanceWhereInput[]
    NOT?: RemittanceWhereInput | RemittanceWhereInput[]
    tenantId?: StringFilter<"Remittance"> | string
    assignmentId?: StringFilter<"Remittance"> | string
    driverId?: StringFilter<"Remittance"> | string
    vehicleId?: StringFilter<"Remittance"> | string
    status?: StringFilter<"Remittance"> | string
    amountMinorUnits?: IntFilter<"Remittance"> | number
    currency?: StringFilter<"Remittance"> | string
    dueDate?: StringFilter<"Remittance"> | string
    paidDate?: StringNullableFilter<"Remittance"> | string | null
    notes?: StringNullableFilter<"Remittance"> | string | null
    fleetId?: StringFilter<"Remittance"> | string
    operatingUnitId?: StringFilter<"Remittance"> | string
    businessEntityId?: StringFilter<"Remittance"> | string
    createdAt?: DateTimeFilter<"Remittance"> | Date | string
    updatedAt?: DateTimeFilter<"Remittance"> | Date | string
  }, "id">

  export type RemittanceOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assignmentId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    dueDate?: SortOrder
    paidDate?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    fleetId?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RemittanceCountOrderByAggregateInput
    _avg?: RemittanceAvgOrderByAggregateInput
    _max?: RemittanceMaxOrderByAggregateInput
    _min?: RemittanceMinOrderByAggregateInput
    _sum?: RemittanceSumOrderByAggregateInput
  }

  export type RemittanceScalarWhereWithAggregatesInput = {
    AND?: RemittanceScalarWhereWithAggregatesInput | RemittanceScalarWhereWithAggregatesInput[]
    OR?: RemittanceScalarWhereWithAggregatesInput[]
    NOT?: RemittanceScalarWhereWithAggregatesInput | RemittanceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Remittance"> | string
    tenantId?: StringWithAggregatesFilter<"Remittance"> | string
    assignmentId?: StringWithAggregatesFilter<"Remittance"> | string
    driverId?: StringWithAggregatesFilter<"Remittance"> | string
    vehicleId?: StringWithAggregatesFilter<"Remittance"> | string
    status?: StringWithAggregatesFilter<"Remittance"> | string
    amountMinorUnits?: IntWithAggregatesFilter<"Remittance"> | number
    currency?: StringWithAggregatesFilter<"Remittance"> | string
    dueDate?: StringWithAggregatesFilter<"Remittance"> | string
    paidDate?: StringNullableWithAggregatesFilter<"Remittance"> | string | null
    notes?: StringNullableWithAggregatesFilter<"Remittance"> | string | null
    fleetId?: StringWithAggregatesFilter<"Remittance"> | string
    operatingUnitId?: StringWithAggregatesFilter<"Remittance"> | string
    businessEntityId?: StringWithAggregatesFilter<"Remittance"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Remittance"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Remittance"> | Date | string
  }

  export type OperationalWalletWhereInput = {
    AND?: OperationalWalletWhereInput | OperationalWalletWhereInput[]
    OR?: OperationalWalletWhereInput[]
    NOT?: OperationalWalletWhereInput | OperationalWalletWhereInput[]
    id?: StringFilter<"OperationalWallet"> | string
    tenantId?: StringFilter<"OperationalWallet"> | string
    businessEntityId?: StringFilter<"OperationalWallet"> | string
    currency?: StringFilter<"OperationalWallet"> | string
    createdAt?: DateTimeFilter<"OperationalWallet"> | Date | string
    updatedAt?: DateTimeFilter<"OperationalWallet"> | Date | string
    entries?: OperationalWalletEntryListRelationFilter
  }

  export type OperationalWalletOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    entries?: OperationalWalletEntryOrderByRelationAggregateInput
  }

  export type OperationalWalletWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    businessEntityId?: string
    AND?: OperationalWalletWhereInput | OperationalWalletWhereInput[]
    OR?: OperationalWalletWhereInput[]
    NOT?: OperationalWalletWhereInput | OperationalWalletWhereInput[]
    tenantId?: StringFilter<"OperationalWallet"> | string
    currency?: StringFilter<"OperationalWallet"> | string
    createdAt?: DateTimeFilter<"OperationalWallet"> | Date | string
    updatedAt?: DateTimeFilter<"OperationalWallet"> | Date | string
    entries?: OperationalWalletEntryListRelationFilter
  }, "id" | "businessEntityId">

  export type OperationalWalletOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OperationalWalletCountOrderByAggregateInput
    _max?: OperationalWalletMaxOrderByAggregateInput
    _min?: OperationalWalletMinOrderByAggregateInput
  }

  export type OperationalWalletScalarWhereWithAggregatesInput = {
    AND?: OperationalWalletScalarWhereWithAggregatesInput | OperationalWalletScalarWhereWithAggregatesInput[]
    OR?: OperationalWalletScalarWhereWithAggregatesInput[]
    NOT?: OperationalWalletScalarWhereWithAggregatesInput | OperationalWalletScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OperationalWallet"> | string
    tenantId?: StringWithAggregatesFilter<"OperationalWallet"> | string
    businessEntityId?: StringWithAggregatesFilter<"OperationalWallet"> | string
    currency?: StringWithAggregatesFilter<"OperationalWallet"> | string
    createdAt?: DateTimeWithAggregatesFilter<"OperationalWallet"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OperationalWallet"> | Date | string
  }

  export type OperationalWalletEntryWhereInput = {
    AND?: OperationalWalletEntryWhereInput | OperationalWalletEntryWhereInput[]
    OR?: OperationalWalletEntryWhereInput[]
    NOT?: OperationalWalletEntryWhereInput | OperationalWalletEntryWhereInput[]
    id?: StringFilter<"OperationalWalletEntry"> | string
    walletId?: StringFilter<"OperationalWalletEntry"> | string
    type?: StringFilter<"OperationalWalletEntry"> | string
    amountMinorUnits?: IntFilter<"OperationalWalletEntry"> | number
    currency?: StringFilter<"OperationalWalletEntry"> | string
    referenceId?: StringNullableFilter<"OperationalWalletEntry"> | string | null
    referenceType?: StringNullableFilter<"OperationalWalletEntry"> | string | null
    description?: StringNullableFilter<"OperationalWalletEntry"> | string | null
    createdAt?: DateTimeFilter<"OperationalWalletEntry"> | Date | string
    wallet?: XOR<OperationalWalletRelationFilter, OperationalWalletWhereInput>
  }

  export type OperationalWalletEntryOrderByWithRelationInput = {
    id?: SortOrder
    walletId?: SortOrder
    type?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    referenceId?: SortOrderInput | SortOrder
    referenceType?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    wallet?: OperationalWalletOrderByWithRelationInput
  }

  export type OperationalWalletEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OperationalWalletEntryWhereInput | OperationalWalletEntryWhereInput[]
    OR?: OperationalWalletEntryWhereInput[]
    NOT?: OperationalWalletEntryWhereInput | OperationalWalletEntryWhereInput[]
    walletId?: StringFilter<"OperationalWalletEntry"> | string
    type?: StringFilter<"OperationalWalletEntry"> | string
    amountMinorUnits?: IntFilter<"OperationalWalletEntry"> | number
    currency?: StringFilter<"OperationalWalletEntry"> | string
    referenceId?: StringNullableFilter<"OperationalWalletEntry"> | string | null
    referenceType?: StringNullableFilter<"OperationalWalletEntry"> | string | null
    description?: StringNullableFilter<"OperationalWalletEntry"> | string | null
    createdAt?: DateTimeFilter<"OperationalWalletEntry"> | Date | string
    wallet?: XOR<OperationalWalletRelationFilter, OperationalWalletWhereInput>
  }, "id">

  export type OperationalWalletEntryOrderByWithAggregationInput = {
    id?: SortOrder
    walletId?: SortOrder
    type?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    referenceId?: SortOrderInput | SortOrder
    referenceType?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: OperationalWalletEntryCountOrderByAggregateInput
    _avg?: OperationalWalletEntryAvgOrderByAggregateInput
    _max?: OperationalWalletEntryMaxOrderByAggregateInput
    _min?: OperationalWalletEntryMinOrderByAggregateInput
    _sum?: OperationalWalletEntrySumOrderByAggregateInput
  }

  export type OperationalWalletEntryScalarWhereWithAggregatesInput = {
    AND?: OperationalWalletEntryScalarWhereWithAggregatesInput | OperationalWalletEntryScalarWhereWithAggregatesInput[]
    OR?: OperationalWalletEntryScalarWhereWithAggregatesInput[]
    NOT?: OperationalWalletEntryScalarWhereWithAggregatesInput | OperationalWalletEntryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OperationalWalletEntry"> | string
    walletId?: StringWithAggregatesFilter<"OperationalWalletEntry"> | string
    type?: StringWithAggregatesFilter<"OperationalWalletEntry"> | string
    amountMinorUnits?: IntWithAggregatesFilter<"OperationalWalletEntry"> | number
    currency?: StringWithAggregatesFilter<"OperationalWalletEntry"> | string
    referenceId?: StringNullableWithAggregatesFilter<"OperationalWalletEntry"> | string | null
    referenceType?: StringNullableWithAggregatesFilter<"OperationalWalletEntry"> | string | null
    description?: StringNullableWithAggregatesFilter<"OperationalWalletEntry"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OperationalWalletEntry"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    tenantId?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    name?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    isEmailVerified?: BoolFilter<"User"> | boolean
    businessEntityId?: StringNullableFilter<"User"> | string | null
    operatingUnitId?: StringNullableFilter<"User"> | string | null
    passwordHash?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    authOtps?: AuthOtpListRelationFilter
    passwordResetTokens?: PasswordResetTokenListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    name?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    isEmailVerified?: SortOrder
    businessEntityId?: SortOrderInput | SortOrder
    operatingUnitId?: SortOrderInput | SortOrder
    passwordHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    authOtps?: AuthOtpOrderByRelationAggregateInput
    passwordResetTokens?: PasswordResetTokenOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_email?: UserTenantIdEmailCompoundUniqueInput
    tenantId_phone?: UserTenantIdPhoneCompoundUniqueInput
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    tenantId?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    name?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    isEmailVerified?: BoolFilter<"User"> | boolean
    businessEntityId?: StringNullableFilter<"User"> | string | null
    operatingUnitId?: StringNullableFilter<"User"> | string | null
    passwordHash?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    authOtps?: AuthOtpListRelationFilter
    passwordResetTokens?: PasswordResetTokenListRelationFilter
  }, "id" | "tenantId_email" | "tenantId_phone">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    name?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    isEmailVerified?: SortOrder
    businessEntityId?: SortOrderInput | SortOrder
    operatingUnitId?: SortOrderInput | SortOrder
    passwordHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    tenantId?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    name?: StringWithAggregatesFilter<"User"> | string
    role?: StringWithAggregatesFilter<"User"> | string
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    isEmailVerified?: BoolWithAggregatesFilter<"User"> | boolean
    businessEntityId?: StringNullableWithAggregatesFilter<"User"> | string | null
    operatingUnitId?: StringNullableWithAggregatesFilter<"User"> | string | null
    passwordHash?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type AuthOtpWhereInput = {
    AND?: AuthOtpWhereInput | AuthOtpWhereInput[]
    OR?: AuthOtpWhereInput[]
    NOT?: AuthOtpWhereInput | AuthOtpWhereInput[]
    id?: StringFilter<"AuthOtp"> | string
    userId?: StringFilter<"AuthOtp"> | string
    identifier?: StringFilter<"AuthOtp"> | string
    purpose?: StringFilter<"AuthOtp"> | string
    codeHash?: StringFilter<"AuthOtp"> | string
    expiresAt?: DateTimeFilter<"AuthOtp"> | Date | string
    consumedAt?: DateTimeNullableFilter<"AuthOtp"> | Date | string | null
    createdAt?: DateTimeFilter<"AuthOtp"> | Date | string
    updatedAt?: DateTimeFilter<"AuthOtp"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type AuthOtpOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    identifier?: SortOrder
    purpose?: SortOrder
    codeHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AuthOtpWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuthOtpWhereInput | AuthOtpWhereInput[]
    OR?: AuthOtpWhereInput[]
    NOT?: AuthOtpWhereInput | AuthOtpWhereInput[]
    userId?: StringFilter<"AuthOtp"> | string
    identifier?: StringFilter<"AuthOtp"> | string
    purpose?: StringFilter<"AuthOtp"> | string
    codeHash?: StringFilter<"AuthOtp"> | string
    expiresAt?: DateTimeFilter<"AuthOtp"> | Date | string
    consumedAt?: DateTimeNullableFilter<"AuthOtp"> | Date | string | null
    createdAt?: DateTimeFilter<"AuthOtp"> | Date | string
    updatedAt?: DateTimeFilter<"AuthOtp"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id">

  export type AuthOtpOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    identifier?: SortOrder
    purpose?: SortOrder
    codeHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AuthOtpCountOrderByAggregateInput
    _max?: AuthOtpMaxOrderByAggregateInput
    _min?: AuthOtpMinOrderByAggregateInput
  }

  export type AuthOtpScalarWhereWithAggregatesInput = {
    AND?: AuthOtpScalarWhereWithAggregatesInput | AuthOtpScalarWhereWithAggregatesInput[]
    OR?: AuthOtpScalarWhereWithAggregatesInput[]
    NOT?: AuthOtpScalarWhereWithAggregatesInput | AuthOtpScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuthOtp"> | string
    userId?: StringWithAggregatesFilter<"AuthOtp"> | string
    identifier?: StringWithAggregatesFilter<"AuthOtp"> | string
    purpose?: StringWithAggregatesFilter<"AuthOtp"> | string
    codeHash?: StringWithAggregatesFilter<"AuthOtp"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"AuthOtp"> | Date | string
    consumedAt?: DateTimeNullableWithAggregatesFilter<"AuthOtp"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AuthOtp"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AuthOtp"> | Date | string
  }

  export type PasswordResetTokenWhereInput = {
    AND?: PasswordResetTokenWhereInput | PasswordResetTokenWhereInput[]
    OR?: PasswordResetTokenWhereInput[]
    NOT?: PasswordResetTokenWhereInput | PasswordResetTokenWhereInput[]
    id?: StringFilter<"PasswordResetToken"> | string
    userId?: StringFilter<"PasswordResetToken"> | string
    tokenHash?: StringFilter<"PasswordResetToken"> | string
    expiresAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    consumedAt?: DateTimeNullableFilter<"PasswordResetToken"> | Date | string | null
    createdAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    updatedAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type PasswordResetTokenOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type PasswordResetTokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tokenHash?: string
    AND?: PasswordResetTokenWhereInput | PasswordResetTokenWhereInput[]
    OR?: PasswordResetTokenWhereInput[]
    NOT?: PasswordResetTokenWhereInput | PasswordResetTokenWhereInput[]
    userId?: StringFilter<"PasswordResetToken"> | string
    expiresAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    consumedAt?: DateTimeNullableFilter<"PasswordResetToken"> | Date | string | null
    createdAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    updatedAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "tokenHash">

  export type PasswordResetTokenOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PasswordResetTokenCountOrderByAggregateInput
    _max?: PasswordResetTokenMaxOrderByAggregateInput
    _min?: PasswordResetTokenMinOrderByAggregateInput
  }

  export type PasswordResetTokenScalarWhereWithAggregatesInput = {
    AND?: PasswordResetTokenScalarWhereWithAggregatesInput | PasswordResetTokenScalarWhereWithAggregatesInput[]
    OR?: PasswordResetTokenScalarWhereWithAggregatesInput[]
    NOT?: PasswordResetTokenScalarWhereWithAggregatesInput | PasswordResetTokenScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PasswordResetToken"> | string
    userId?: StringWithAggregatesFilter<"PasswordResetToken"> | string
    tokenHash?: StringWithAggregatesFilter<"PasswordResetToken"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"PasswordResetToken"> | Date | string
    consumedAt?: DateTimeNullableWithAggregatesFilter<"PasswordResetToken"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PasswordResetToken"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PasswordResetToken"> | Date | string
  }

  export type TenantCreateInput = {
    id?: string
    slug: string
    name: string
    country: string
    status?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    businessEntities?: BusinessEntityCreateNestedManyWithoutTenantInput
    users?: UserCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    slug: string
    name: string
    country: string
    status?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    businessEntities?: BusinessEntityUncheckedCreateNestedManyWithoutTenantInput
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    businessEntities?: BusinessEntityUpdateManyWithoutTenantNestedInput
    users?: UserUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    businessEntities?: BusinessEntityUncheckedUpdateManyWithoutTenantNestedInput
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id?: string
    slug: string
    name: string
    country: string
    status?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BusinessEntityCreateInput = {
    id?: string
    name: string
    country: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutBusinessEntitiesInput
    operatingUnits?: OperatingUnitCreateNestedManyWithoutBusinessEntityInput
  }

  export type BusinessEntityUncheckedCreateInput = {
    id?: string
    tenantId: string
    name: string
    country: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    operatingUnits?: OperatingUnitUncheckedCreateNestedManyWithoutBusinessEntityInput
  }

  export type BusinessEntityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutBusinessEntitiesNestedInput
    operatingUnits?: OperatingUnitUpdateManyWithoutBusinessEntityNestedInput
  }

  export type BusinessEntityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    operatingUnits?: OperatingUnitUncheckedUpdateManyWithoutBusinessEntityNestedInput
  }

  export type BusinessEntityCreateManyInput = {
    id?: string
    tenantId: string
    name: string
    country: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BusinessEntityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BusinessEntityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperatingUnitCreateInput = {
    id?: string
    tenantId: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    businessEntity: BusinessEntityCreateNestedOneWithoutOperatingUnitsInput
    fleets?: FleetCreateNestedManyWithoutOperatingUnitInput
  }

  export type OperatingUnitUncheckedCreateInput = {
    id?: string
    tenantId: string
    businessEntityId: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    fleets?: FleetUncheckedCreateNestedManyWithoutOperatingUnitInput
  }

  export type OperatingUnitUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    businessEntity?: BusinessEntityUpdateOneRequiredWithoutOperatingUnitsNestedInput
    fleets?: FleetUpdateManyWithoutOperatingUnitNestedInput
  }

  export type OperatingUnitUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fleets?: FleetUncheckedUpdateManyWithoutOperatingUnitNestedInput
  }

  export type OperatingUnitCreateManyInput = {
    id?: string
    tenantId: string
    businessEntityId: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OperatingUnitUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperatingUnitUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FleetCreateInput = {
    id?: string
    tenantId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    operatingUnit: OperatingUnitCreateNestedOneWithoutFleetsInput
    drivers?: DriverCreateNestedManyWithoutFleetInput
    vehicles?: VehicleCreateNestedManyWithoutFleetInput
  }

  export type FleetUncheckedCreateInput = {
    id?: string
    tenantId: string
    operatingUnitId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    drivers?: DriverUncheckedCreateNestedManyWithoutFleetInput
    vehicles?: VehicleUncheckedCreateNestedManyWithoutFleetInput
  }

  export type FleetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    operatingUnit?: OperatingUnitUpdateOneRequiredWithoutFleetsNestedInput
    drivers?: DriverUpdateManyWithoutFleetNestedInput
    vehicles?: VehicleUpdateManyWithoutFleetNestedInput
  }

  export type FleetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    drivers?: DriverUncheckedUpdateManyWithoutFleetNestedInput
    vehicles?: VehicleUncheckedUpdateManyWithoutFleetNestedInput
  }

  export type FleetCreateManyInput = {
    id?: string
    tenantId: string
    operatingUnitId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FleetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FleetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverCreateInput = {
    id?: string
    tenantId: string
    status?: string
    firstName: string
    lastName: string
    phone: string
    email?: string | null
    dateOfBirth?: string | null
    nationality?: string | null
    personId?: string | null
    businessEntityId: string
    operatingUnitId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    fleet: FleetCreateNestedOneWithoutDriversInput
  }

  export type DriverUncheckedCreateInput = {
    id?: string
    tenantId: string
    fleetId: string
    status?: string
    firstName: string
    lastName: string
    phone: string
    email?: string | null
    dateOfBirth?: string | null
    nationality?: string | null
    personId?: string | null
    businessEntityId: string
    operatingUnitId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DriverUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    nationality?: NullableStringFieldUpdateOperationsInput | string | null
    personId?: NullableStringFieldUpdateOperationsInput | string | null
    businessEntityId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fleet?: FleetUpdateOneRequiredWithoutDriversNestedInput
  }

  export type DriverUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fleetId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    nationality?: NullableStringFieldUpdateOperationsInput | string | null
    personId?: NullableStringFieldUpdateOperationsInput | string | null
    businessEntityId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverCreateManyInput = {
    id?: string
    tenantId: string
    fleetId: string
    status?: string
    firstName: string
    lastName: string
    phone: string
    email?: string | null
    dateOfBirth?: string | null
    nationality?: string | null
    personId?: string | null
    businessEntityId: string
    operatingUnitId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DriverUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    nationality?: NullableStringFieldUpdateOperationsInput | string | null
    personId?: NullableStringFieldUpdateOperationsInput | string | null
    businessEntityId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fleetId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    nationality?: NullableStringFieldUpdateOperationsInput | string | null
    personId?: NullableStringFieldUpdateOperationsInput | string | null
    businessEntityId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleCreateInput = {
    id?: string
    tenantId: string
    status?: string
    vehicleType: string
    make: string
    model: string
    year: number
    plate: string
    color?: string | null
    vin?: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    fleet: FleetCreateNestedOneWithoutVehiclesInput
  }

  export type VehicleUncheckedCreateInput = {
    id?: string
    tenantId: string
    fleetId: string
    status?: string
    vehicleType: string
    make: string
    model: string
    year: number
    plate: string
    color?: string | null
    vin?: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VehicleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plate?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    vin?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fleet?: FleetUpdateOneRequiredWithoutVehiclesNestedInput
  }

  export type VehicleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fleetId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plate?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    vin?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleCreateManyInput = {
    id?: string
    tenantId: string
    fleetId: string
    status?: string
    vehicleType: string
    make: string
    model: string
    year: number
    plate: string
    color?: string | null
    vin?: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VehicleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plate?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    vin?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fleetId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plate?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    vin?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssignmentCreateInput = {
    id?: string
    tenantId: string
    fleetId: string
    driverId: string
    vehicleId: string
    status?: string
    startedAt?: Date | string
    endedAt?: Date | string | null
    notes?: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssignmentUncheckedCreateInput = {
    id?: string
    tenantId: string
    fleetId: string
    driverId: string
    vehicleId: string
    status?: string
    startedAt?: Date | string
    endedAt?: Date | string | null
    notes?: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssignmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fleetId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssignmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fleetId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssignmentCreateManyInput = {
    id?: string
    tenantId: string
    fleetId: string
    driverId: string
    vehicleId: string
    status?: string
    startedAt?: Date | string
    endedAt?: Date | string | null
    notes?: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssignmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fleetId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssignmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fleetId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RemittanceCreateInput = {
    id?: string
    tenantId: string
    assignmentId: string
    driverId: string
    vehicleId: string
    status?: string
    amountMinorUnits: number
    currency: string
    dueDate: string
    paidDate?: string | null
    notes?: string | null
    fleetId: string
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RemittanceUncheckedCreateInput = {
    id?: string
    tenantId: string
    assignmentId: string
    driverId: string
    vehicleId: string
    status?: string
    amountMinorUnits: number
    currency: string
    dueDate: string
    paidDate?: string | null
    notes?: string | null
    fleetId: string
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RemittanceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assignmentId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    dueDate?: StringFieldUpdateOperationsInput | string
    paidDate?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    fleetId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RemittanceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assignmentId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    dueDate?: StringFieldUpdateOperationsInput | string
    paidDate?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    fleetId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RemittanceCreateManyInput = {
    id?: string
    tenantId: string
    assignmentId: string
    driverId: string
    vehicleId: string
    status?: string
    amountMinorUnits: number
    currency: string
    dueDate: string
    paidDate?: string | null
    notes?: string | null
    fleetId: string
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RemittanceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assignmentId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    dueDate?: StringFieldUpdateOperationsInput | string
    paidDate?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    fleetId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RemittanceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assignmentId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    dueDate?: StringFieldUpdateOperationsInput | string
    paidDate?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    fleetId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalWalletCreateInput = {
    id?: string
    tenantId: string
    businessEntityId: string
    currency: string
    createdAt?: Date | string
    updatedAt?: Date | string
    entries?: OperationalWalletEntryCreateNestedManyWithoutWalletInput
  }

  export type OperationalWalletUncheckedCreateInput = {
    id?: string
    tenantId: string
    businessEntityId: string
    currency: string
    createdAt?: Date | string
    updatedAt?: Date | string
    entries?: OperationalWalletEntryUncheckedCreateNestedManyWithoutWalletInput
  }

  export type OperationalWalletUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entries?: OperationalWalletEntryUpdateManyWithoutWalletNestedInput
  }

  export type OperationalWalletUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entries?: OperationalWalletEntryUncheckedUpdateManyWithoutWalletNestedInput
  }

  export type OperationalWalletCreateManyInput = {
    id?: string
    tenantId: string
    businessEntityId: string
    currency: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OperationalWalletUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalWalletUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalWalletEntryCreateInput = {
    id?: string
    type: string
    amountMinorUnits: number
    currency: string
    referenceId?: string | null
    referenceType?: string | null
    description?: string | null
    createdAt?: Date | string
    wallet: OperationalWalletCreateNestedOneWithoutEntriesInput
  }

  export type OperationalWalletEntryUncheckedCreateInput = {
    id?: string
    walletId: string
    type: string
    amountMinorUnits: number
    currency: string
    referenceId?: string | null
    referenceType?: string | null
    description?: string | null
    createdAt?: Date | string
  }

  export type OperationalWalletEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wallet?: OperationalWalletUpdateOneRequiredWithoutEntriesNestedInput
  }

  export type OperationalWalletEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    walletId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalWalletEntryCreateManyInput = {
    id?: string
    walletId: string
    type: string
    amountMinorUnits: number
    currency: string
    referenceId?: string | null
    referenceType?: string | null
    description?: string | null
    createdAt?: Date | string
  }

  export type OperationalWalletEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalWalletEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    walletId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutUsersInput
    authOtps?: AuthOtpCreateNestedManyWithoutUserInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    tenantId: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    authOtps?: AuthOtpUncheckedCreateNestedManyWithoutUserInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsersNestedInput
    authOtps?: AuthOtpUpdateManyWithoutUserNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authOtps?: AuthOtpUncheckedUpdateManyWithoutUserNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    tenantId: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthOtpCreateInput = {
    id?: string
    identifier: string
    purpose: string
    codeHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutAuthOtpsInput
  }

  export type AuthOtpUncheckedCreateInput = {
    id?: string
    userId: string
    identifier: string
    purpose: string
    codeHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthOtpUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    codeHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAuthOtpsNestedInput
  }

  export type AuthOtpUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    codeHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthOtpCreateManyInput = {
    id?: string
    userId: string
    identifier: string
    purpose: string
    codeHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthOtpUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    codeHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthOtpUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    codeHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenCreateInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPasswordResetTokensInput
  }

  export type PasswordResetTokenUncheckedCreateInput = {
    id?: string
    userId: string
    tokenHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasswordResetTokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPasswordResetTokensNestedInput
  }

  export type PasswordResetTokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenCreateManyInput = {
    id?: string
    userId: string
    tokenHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasswordResetTokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type BusinessEntityListRelationFilter = {
    every?: BusinessEntityWhereInput
    some?: BusinessEntityWhereInput
    none?: BusinessEntityWhereInput
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BusinessEntityOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    country?: SortOrder
    status?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    country?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    country?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type TenantRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type OperatingUnitListRelationFilter = {
    every?: OperatingUnitWhereInput
    some?: OperatingUnitWhereInput
    none?: OperatingUnitWhereInput
  }

  export type OperatingUnitOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BusinessEntityCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    country?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BusinessEntityMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    country?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BusinessEntityMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    country?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BusinessEntityRelationFilter = {
    is?: BusinessEntityWhereInput
    isNot?: BusinessEntityWhereInput
  }

  export type FleetListRelationFilter = {
    every?: FleetWhereInput
    some?: FleetWhereInput
    none?: FleetWhereInput
  }

  export type FleetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OperatingUnitCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OperatingUnitMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OperatingUnitMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OperatingUnitRelationFilter = {
    is?: OperatingUnitWhereInput
    isNot?: OperatingUnitWhereInput
  }

  export type DriverListRelationFilter = {
    every?: DriverWhereInput
    some?: DriverWhereInput
    none?: DriverWhereInput
  }

  export type VehicleListRelationFilter = {
    every?: VehicleWhereInput
    some?: VehicleWhereInput
    none?: VehicleWhereInput
  }

  export type DriverOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VehicleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FleetCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    operatingUnitId?: SortOrder
    name?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FleetMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    operatingUnitId?: SortOrder
    name?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FleetMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    operatingUnitId?: SortOrder
    name?: SortOrder
    businessModel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type FleetRelationFilter = {
    is?: FleetWhereInput
    isNot?: FleetWhereInput
  }

  export type DriverTenantIdPhoneCompoundUniqueInput = {
    tenantId: string
    phone: string
  }

  export type DriverCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    dateOfBirth?: SortOrder
    nationality?: SortOrder
    personId?: SortOrder
    businessEntityId?: SortOrder
    operatingUnitId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DriverMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    dateOfBirth?: SortOrder
    nationality?: SortOrder
    personId?: SortOrder
    businessEntityId?: SortOrder
    operatingUnitId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DriverMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    dateOfBirth?: SortOrder
    nationality?: SortOrder
    personId?: SortOrder
    businessEntityId?: SortOrder
    operatingUnitId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type VehicleTenantIdPlateCompoundUniqueInput = {
    tenantId: string
    plate: string
  }

  export type VehicleCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    vehicleType?: SortOrder
    make?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plate?: SortOrder
    color?: SortOrder
    vin?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VehicleAvgOrderByAggregateInput = {
    year?: SortOrder
  }

  export type VehicleMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    vehicleType?: SortOrder
    make?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plate?: SortOrder
    color?: SortOrder
    vin?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VehicleMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    status?: SortOrder
    vehicleType?: SortOrder
    make?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plate?: SortOrder
    color?: SortOrder
    vin?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VehicleSumOrderByAggregateInput = {
    year?: SortOrder
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

  export type AssignmentCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    notes?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssignmentMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    notes?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssignmentMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fleetId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    notes?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type RemittanceCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assignmentId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    dueDate?: SortOrder
    paidDate?: SortOrder
    notes?: SortOrder
    fleetId?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RemittanceAvgOrderByAggregateInput = {
    amountMinorUnits?: SortOrder
  }

  export type RemittanceMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assignmentId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    dueDate?: SortOrder
    paidDate?: SortOrder
    notes?: SortOrder
    fleetId?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RemittanceMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assignmentId?: SortOrder
    driverId?: SortOrder
    vehicleId?: SortOrder
    status?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    dueDate?: SortOrder
    paidDate?: SortOrder
    notes?: SortOrder
    fleetId?: SortOrder
    operatingUnitId?: SortOrder
    businessEntityId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RemittanceSumOrderByAggregateInput = {
    amountMinorUnits?: SortOrder
  }

  export type OperationalWalletEntryListRelationFilter = {
    every?: OperationalWalletEntryWhereInput
    some?: OperationalWalletEntryWhereInput
    none?: OperationalWalletEntryWhereInput
  }

  export type OperationalWalletEntryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OperationalWalletCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OperationalWalletMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OperationalWalletMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    businessEntityId?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OperationalWalletRelationFilter = {
    is?: OperationalWalletWhereInput
    isNot?: OperationalWalletWhereInput
  }

  export type OperationalWalletEntryCountOrderByAggregateInput = {
    id?: SortOrder
    walletId?: SortOrder
    type?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    referenceId?: SortOrder
    referenceType?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type OperationalWalletEntryAvgOrderByAggregateInput = {
    amountMinorUnits?: SortOrder
  }

  export type OperationalWalletEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    walletId?: SortOrder
    type?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    referenceId?: SortOrder
    referenceType?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type OperationalWalletEntryMinOrderByAggregateInput = {
    id?: SortOrder
    walletId?: SortOrder
    type?: SortOrder
    amountMinorUnits?: SortOrder
    currency?: SortOrder
    referenceId?: SortOrder
    referenceType?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type OperationalWalletEntrySumOrderByAggregateInput = {
    amountMinorUnits?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type AuthOtpListRelationFilter = {
    every?: AuthOtpWhereInput
    some?: AuthOtpWhereInput
    none?: AuthOtpWhereInput
  }

  export type PasswordResetTokenListRelationFilter = {
    every?: PasswordResetTokenWhereInput
    some?: PasswordResetTokenWhereInput
    none?: PasswordResetTokenWhereInput
  }

  export type AuthOtpOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PasswordResetTokenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserTenantIdEmailCompoundUniqueInput = {
    tenantId: string
    email: string
  }

  export type UserTenantIdPhoneCompoundUniqueInput = {
    tenantId: string
    phone: string
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    isEmailVerified?: SortOrder
    businessEntityId?: SortOrder
    operatingUnitId?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    isEmailVerified?: SortOrder
    businessEntityId?: SortOrder
    operatingUnitId?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    isEmailVerified?: SortOrder
    businessEntityId?: SortOrder
    operatingUnitId?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type AuthOtpCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    identifier?: SortOrder
    purpose?: SortOrder
    codeHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AuthOtpMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    identifier?: SortOrder
    purpose?: SortOrder
    codeHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AuthOtpMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    identifier?: SortOrder
    purpose?: SortOrder
    codeHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PasswordResetTokenCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PasswordResetTokenMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PasswordResetTokenMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BusinessEntityCreateNestedManyWithoutTenantInput = {
    create?: XOR<BusinessEntityCreateWithoutTenantInput, BusinessEntityUncheckedCreateWithoutTenantInput> | BusinessEntityCreateWithoutTenantInput[] | BusinessEntityUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: BusinessEntityCreateOrConnectWithoutTenantInput | BusinessEntityCreateOrConnectWithoutTenantInput[]
    createMany?: BusinessEntityCreateManyTenantInputEnvelope
    connect?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
  }

  export type UserCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type BusinessEntityUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<BusinessEntityCreateWithoutTenantInput, BusinessEntityUncheckedCreateWithoutTenantInput> | BusinessEntityCreateWithoutTenantInput[] | BusinessEntityUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: BusinessEntityCreateOrConnectWithoutTenantInput | BusinessEntityCreateOrConnectWithoutTenantInput[]
    createMany?: BusinessEntityCreateManyTenantInputEnvelope
    connect?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BusinessEntityUpdateManyWithoutTenantNestedInput = {
    create?: XOR<BusinessEntityCreateWithoutTenantInput, BusinessEntityUncheckedCreateWithoutTenantInput> | BusinessEntityCreateWithoutTenantInput[] | BusinessEntityUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: BusinessEntityCreateOrConnectWithoutTenantInput | BusinessEntityCreateOrConnectWithoutTenantInput[]
    upsert?: BusinessEntityUpsertWithWhereUniqueWithoutTenantInput | BusinessEntityUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: BusinessEntityCreateManyTenantInputEnvelope
    set?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
    disconnect?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
    delete?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
    connect?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
    update?: BusinessEntityUpdateWithWhereUniqueWithoutTenantInput | BusinessEntityUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: BusinessEntityUpdateManyWithWhereWithoutTenantInput | BusinessEntityUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: BusinessEntityScalarWhereInput | BusinessEntityScalarWhereInput[]
  }

  export type UserUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type BusinessEntityUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<BusinessEntityCreateWithoutTenantInput, BusinessEntityUncheckedCreateWithoutTenantInput> | BusinessEntityCreateWithoutTenantInput[] | BusinessEntityUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: BusinessEntityCreateOrConnectWithoutTenantInput | BusinessEntityCreateOrConnectWithoutTenantInput[]
    upsert?: BusinessEntityUpsertWithWhereUniqueWithoutTenantInput | BusinessEntityUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: BusinessEntityCreateManyTenantInputEnvelope
    set?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
    disconnect?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
    delete?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
    connect?: BusinessEntityWhereUniqueInput | BusinessEntityWhereUniqueInput[]
    update?: BusinessEntityUpdateWithWhereUniqueWithoutTenantInput | BusinessEntityUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: BusinessEntityUpdateManyWithWhereWithoutTenantInput | BusinessEntityUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: BusinessEntityScalarWhereInput | BusinessEntityScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutBusinessEntitiesInput = {
    create?: XOR<TenantCreateWithoutBusinessEntitiesInput, TenantUncheckedCreateWithoutBusinessEntitiesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutBusinessEntitiesInput
    connect?: TenantWhereUniqueInput
  }

  export type OperatingUnitCreateNestedManyWithoutBusinessEntityInput = {
    create?: XOR<OperatingUnitCreateWithoutBusinessEntityInput, OperatingUnitUncheckedCreateWithoutBusinessEntityInput> | OperatingUnitCreateWithoutBusinessEntityInput[] | OperatingUnitUncheckedCreateWithoutBusinessEntityInput[]
    connectOrCreate?: OperatingUnitCreateOrConnectWithoutBusinessEntityInput | OperatingUnitCreateOrConnectWithoutBusinessEntityInput[]
    createMany?: OperatingUnitCreateManyBusinessEntityInputEnvelope
    connect?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
  }

  export type OperatingUnitUncheckedCreateNestedManyWithoutBusinessEntityInput = {
    create?: XOR<OperatingUnitCreateWithoutBusinessEntityInput, OperatingUnitUncheckedCreateWithoutBusinessEntityInput> | OperatingUnitCreateWithoutBusinessEntityInput[] | OperatingUnitUncheckedCreateWithoutBusinessEntityInput[]
    connectOrCreate?: OperatingUnitCreateOrConnectWithoutBusinessEntityInput | OperatingUnitCreateOrConnectWithoutBusinessEntityInput[]
    createMany?: OperatingUnitCreateManyBusinessEntityInputEnvelope
    connect?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
  }

  export type TenantUpdateOneRequiredWithoutBusinessEntitiesNestedInput = {
    create?: XOR<TenantCreateWithoutBusinessEntitiesInput, TenantUncheckedCreateWithoutBusinessEntitiesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutBusinessEntitiesInput
    upsert?: TenantUpsertWithoutBusinessEntitiesInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutBusinessEntitiesInput, TenantUpdateWithoutBusinessEntitiesInput>, TenantUncheckedUpdateWithoutBusinessEntitiesInput>
  }

  export type OperatingUnitUpdateManyWithoutBusinessEntityNestedInput = {
    create?: XOR<OperatingUnitCreateWithoutBusinessEntityInput, OperatingUnitUncheckedCreateWithoutBusinessEntityInput> | OperatingUnitCreateWithoutBusinessEntityInput[] | OperatingUnitUncheckedCreateWithoutBusinessEntityInput[]
    connectOrCreate?: OperatingUnitCreateOrConnectWithoutBusinessEntityInput | OperatingUnitCreateOrConnectWithoutBusinessEntityInput[]
    upsert?: OperatingUnitUpsertWithWhereUniqueWithoutBusinessEntityInput | OperatingUnitUpsertWithWhereUniqueWithoutBusinessEntityInput[]
    createMany?: OperatingUnitCreateManyBusinessEntityInputEnvelope
    set?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
    disconnect?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
    delete?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
    connect?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
    update?: OperatingUnitUpdateWithWhereUniqueWithoutBusinessEntityInput | OperatingUnitUpdateWithWhereUniqueWithoutBusinessEntityInput[]
    updateMany?: OperatingUnitUpdateManyWithWhereWithoutBusinessEntityInput | OperatingUnitUpdateManyWithWhereWithoutBusinessEntityInput[]
    deleteMany?: OperatingUnitScalarWhereInput | OperatingUnitScalarWhereInput[]
  }

  export type OperatingUnitUncheckedUpdateManyWithoutBusinessEntityNestedInput = {
    create?: XOR<OperatingUnitCreateWithoutBusinessEntityInput, OperatingUnitUncheckedCreateWithoutBusinessEntityInput> | OperatingUnitCreateWithoutBusinessEntityInput[] | OperatingUnitUncheckedCreateWithoutBusinessEntityInput[]
    connectOrCreate?: OperatingUnitCreateOrConnectWithoutBusinessEntityInput | OperatingUnitCreateOrConnectWithoutBusinessEntityInput[]
    upsert?: OperatingUnitUpsertWithWhereUniqueWithoutBusinessEntityInput | OperatingUnitUpsertWithWhereUniqueWithoutBusinessEntityInput[]
    createMany?: OperatingUnitCreateManyBusinessEntityInputEnvelope
    set?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
    disconnect?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
    delete?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
    connect?: OperatingUnitWhereUniqueInput | OperatingUnitWhereUniqueInput[]
    update?: OperatingUnitUpdateWithWhereUniqueWithoutBusinessEntityInput | OperatingUnitUpdateWithWhereUniqueWithoutBusinessEntityInput[]
    updateMany?: OperatingUnitUpdateManyWithWhereWithoutBusinessEntityInput | OperatingUnitUpdateManyWithWhereWithoutBusinessEntityInput[]
    deleteMany?: OperatingUnitScalarWhereInput | OperatingUnitScalarWhereInput[]
  }

  export type BusinessEntityCreateNestedOneWithoutOperatingUnitsInput = {
    create?: XOR<BusinessEntityCreateWithoutOperatingUnitsInput, BusinessEntityUncheckedCreateWithoutOperatingUnitsInput>
    connectOrCreate?: BusinessEntityCreateOrConnectWithoutOperatingUnitsInput
    connect?: BusinessEntityWhereUniqueInput
  }

  export type FleetCreateNestedManyWithoutOperatingUnitInput = {
    create?: XOR<FleetCreateWithoutOperatingUnitInput, FleetUncheckedCreateWithoutOperatingUnitInput> | FleetCreateWithoutOperatingUnitInput[] | FleetUncheckedCreateWithoutOperatingUnitInput[]
    connectOrCreate?: FleetCreateOrConnectWithoutOperatingUnitInput | FleetCreateOrConnectWithoutOperatingUnitInput[]
    createMany?: FleetCreateManyOperatingUnitInputEnvelope
    connect?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
  }

  export type FleetUncheckedCreateNestedManyWithoutOperatingUnitInput = {
    create?: XOR<FleetCreateWithoutOperatingUnitInput, FleetUncheckedCreateWithoutOperatingUnitInput> | FleetCreateWithoutOperatingUnitInput[] | FleetUncheckedCreateWithoutOperatingUnitInput[]
    connectOrCreate?: FleetCreateOrConnectWithoutOperatingUnitInput | FleetCreateOrConnectWithoutOperatingUnitInput[]
    createMany?: FleetCreateManyOperatingUnitInputEnvelope
    connect?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
  }

  export type BusinessEntityUpdateOneRequiredWithoutOperatingUnitsNestedInput = {
    create?: XOR<BusinessEntityCreateWithoutOperatingUnitsInput, BusinessEntityUncheckedCreateWithoutOperatingUnitsInput>
    connectOrCreate?: BusinessEntityCreateOrConnectWithoutOperatingUnitsInput
    upsert?: BusinessEntityUpsertWithoutOperatingUnitsInput
    connect?: BusinessEntityWhereUniqueInput
    update?: XOR<XOR<BusinessEntityUpdateToOneWithWhereWithoutOperatingUnitsInput, BusinessEntityUpdateWithoutOperatingUnitsInput>, BusinessEntityUncheckedUpdateWithoutOperatingUnitsInput>
  }

  export type FleetUpdateManyWithoutOperatingUnitNestedInput = {
    create?: XOR<FleetCreateWithoutOperatingUnitInput, FleetUncheckedCreateWithoutOperatingUnitInput> | FleetCreateWithoutOperatingUnitInput[] | FleetUncheckedCreateWithoutOperatingUnitInput[]
    connectOrCreate?: FleetCreateOrConnectWithoutOperatingUnitInput | FleetCreateOrConnectWithoutOperatingUnitInput[]
    upsert?: FleetUpsertWithWhereUniqueWithoutOperatingUnitInput | FleetUpsertWithWhereUniqueWithoutOperatingUnitInput[]
    createMany?: FleetCreateManyOperatingUnitInputEnvelope
    set?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
    disconnect?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
    delete?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
    connect?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
    update?: FleetUpdateWithWhereUniqueWithoutOperatingUnitInput | FleetUpdateWithWhereUniqueWithoutOperatingUnitInput[]
    updateMany?: FleetUpdateManyWithWhereWithoutOperatingUnitInput | FleetUpdateManyWithWhereWithoutOperatingUnitInput[]
    deleteMany?: FleetScalarWhereInput | FleetScalarWhereInput[]
  }

  export type FleetUncheckedUpdateManyWithoutOperatingUnitNestedInput = {
    create?: XOR<FleetCreateWithoutOperatingUnitInput, FleetUncheckedCreateWithoutOperatingUnitInput> | FleetCreateWithoutOperatingUnitInput[] | FleetUncheckedCreateWithoutOperatingUnitInput[]
    connectOrCreate?: FleetCreateOrConnectWithoutOperatingUnitInput | FleetCreateOrConnectWithoutOperatingUnitInput[]
    upsert?: FleetUpsertWithWhereUniqueWithoutOperatingUnitInput | FleetUpsertWithWhereUniqueWithoutOperatingUnitInput[]
    createMany?: FleetCreateManyOperatingUnitInputEnvelope
    set?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
    disconnect?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
    delete?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
    connect?: FleetWhereUniqueInput | FleetWhereUniqueInput[]
    update?: FleetUpdateWithWhereUniqueWithoutOperatingUnitInput | FleetUpdateWithWhereUniqueWithoutOperatingUnitInput[]
    updateMany?: FleetUpdateManyWithWhereWithoutOperatingUnitInput | FleetUpdateManyWithWhereWithoutOperatingUnitInput[]
    deleteMany?: FleetScalarWhereInput | FleetScalarWhereInput[]
  }

  export type OperatingUnitCreateNestedOneWithoutFleetsInput = {
    create?: XOR<OperatingUnitCreateWithoutFleetsInput, OperatingUnitUncheckedCreateWithoutFleetsInput>
    connectOrCreate?: OperatingUnitCreateOrConnectWithoutFleetsInput
    connect?: OperatingUnitWhereUniqueInput
  }

  export type DriverCreateNestedManyWithoutFleetInput = {
    create?: XOR<DriverCreateWithoutFleetInput, DriverUncheckedCreateWithoutFleetInput> | DriverCreateWithoutFleetInput[] | DriverUncheckedCreateWithoutFleetInput[]
    connectOrCreate?: DriverCreateOrConnectWithoutFleetInput | DriverCreateOrConnectWithoutFleetInput[]
    createMany?: DriverCreateManyFleetInputEnvelope
    connect?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
  }

  export type VehicleCreateNestedManyWithoutFleetInput = {
    create?: XOR<VehicleCreateWithoutFleetInput, VehicleUncheckedCreateWithoutFleetInput> | VehicleCreateWithoutFleetInput[] | VehicleUncheckedCreateWithoutFleetInput[]
    connectOrCreate?: VehicleCreateOrConnectWithoutFleetInput | VehicleCreateOrConnectWithoutFleetInput[]
    createMany?: VehicleCreateManyFleetInputEnvelope
    connect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
  }

  export type DriverUncheckedCreateNestedManyWithoutFleetInput = {
    create?: XOR<DriverCreateWithoutFleetInput, DriverUncheckedCreateWithoutFleetInput> | DriverCreateWithoutFleetInput[] | DriverUncheckedCreateWithoutFleetInput[]
    connectOrCreate?: DriverCreateOrConnectWithoutFleetInput | DriverCreateOrConnectWithoutFleetInput[]
    createMany?: DriverCreateManyFleetInputEnvelope
    connect?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
  }

  export type VehicleUncheckedCreateNestedManyWithoutFleetInput = {
    create?: XOR<VehicleCreateWithoutFleetInput, VehicleUncheckedCreateWithoutFleetInput> | VehicleCreateWithoutFleetInput[] | VehicleUncheckedCreateWithoutFleetInput[]
    connectOrCreate?: VehicleCreateOrConnectWithoutFleetInput | VehicleCreateOrConnectWithoutFleetInput[]
    createMany?: VehicleCreateManyFleetInputEnvelope
    connect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
  }

  export type OperatingUnitUpdateOneRequiredWithoutFleetsNestedInput = {
    create?: XOR<OperatingUnitCreateWithoutFleetsInput, OperatingUnitUncheckedCreateWithoutFleetsInput>
    connectOrCreate?: OperatingUnitCreateOrConnectWithoutFleetsInput
    upsert?: OperatingUnitUpsertWithoutFleetsInput
    connect?: OperatingUnitWhereUniqueInput
    update?: XOR<XOR<OperatingUnitUpdateToOneWithWhereWithoutFleetsInput, OperatingUnitUpdateWithoutFleetsInput>, OperatingUnitUncheckedUpdateWithoutFleetsInput>
  }

  export type DriverUpdateManyWithoutFleetNestedInput = {
    create?: XOR<DriverCreateWithoutFleetInput, DriverUncheckedCreateWithoutFleetInput> | DriverCreateWithoutFleetInput[] | DriverUncheckedCreateWithoutFleetInput[]
    connectOrCreate?: DriverCreateOrConnectWithoutFleetInput | DriverCreateOrConnectWithoutFleetInput[]
    upsert?: DriverUpsertWithWhereUniqueWithoutFleetInput | DriverUpsertWithWhereUniqueWithoutFleetInput[]
    createMany?: DriverCreateManyFleetInputEnvelope
    set?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
    disconnect?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
    delete?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
    connect?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
    update?: DriverUpdateWithWhereUniqueWithoutFleetInput | DriverUpdateWithWhereUniqueWithoutFleetInput[]
    updateMany?: DriverUpdateManyWithWhereWithoutFleetInput | DriverUpdateManyWithWhereWithoutFleetInput[]
    deleteMany?: DriverScalarWhereInput | DriverScalarWhereInput[]
  }

  export type VehicleUpdateManyWithoutFleetNestedInput = {
    create?: XOR<VehicleCreateWithoutFleetInput, VehicleUncheckedCreateWithoutFleetInput> | VehicleCreateWithoutFleetInput[] | VehicleUncheckedCreateWithoutFleetInput[]
    connectOrCreate?: VehicleCreateOrConnectWithoutFleetInput | VehicleCreateOrConnectWithoutFleetInput[]
    upsert?: VehicleUpsertWithWhereUniqueWithoutFleetInput | VehicleUpsertWithWhereUniqueWithoutFleetInput[]
    createMany?: VehicleCreateManyFleetInputEnvelope
    set?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    disconnect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    delete?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    connect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    update?: VehicleUpdateWithWhereUniqueWithoutFleetInput | VehicleUpdateWithWhereUniqueWithoutFleetInput[]
    updateMany?: VehicleUpdateManyWithWhereWithoutFleetInput | VehicleUpdateManyWithWhereWithoutFleetInput[]
    deleteMany?: VehicleScalarWhereInput | VehicleScalarWhereInput[]
  }

  export type DriverUncheckedUpdateManyWithoutFleetNestedInput = {
    create?: XOR<DriverCreateWithoutFleetInput, DriverUncheckedCreateWithoutFleetInput> | DriverCreateWithoutFleetInput[] | DriverUncheckedCreateWithoutFleetInput[]
    connectOrCreate?: DriverCreateOrConnectWithoutFleetInput | DriverCreateOrConnectWithoutFleetInput[]
    upsert?: DriverUpsertWithWhereUniqueWithoutFleetInput | DriverUpsertWithWhereUniqueWithoutFleetInput[]
    createMany?: DriverCreateManyFleetInputEnvelope
    set?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
    disconnect?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
    delete?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
    connect?: DriverWhereUniqueInput | DriverWhereUniqueInput[]
    update?: DriverUpdateWithWhereUniqueWithoutFleetInput | DriverUpdateWithWhereUniqueWithoutFleetInput[]
    updateMany?: DriverUpdateManyWithWhereWithoutFleetInput | DriverUpdateManyWithWhereWithoutFleetInput[]
    deleteMany?: DriverScalarWhereInput | DriverScalarWhereInput[]
  }

  export type VehicleUncheckedUpdateManyWithoutFleetNestedInput = {
    create?: XOR<VehicleCreateWithoutFleetInput, VehicleUncheckedCreateWithoutFleetInput> | VehicleCreateWithoutFleetInput[] | VehicleUncheckedCreateWithoutFleetInput[]
    connectOrCreate?: VehicleCreateOrConnectWithoutFleetInput | VehicleCreateOrConnectWithoutFleetInput[]
    upsert?: VehicleUpsertWithWhereUniqueWithoutFleetInput | VehicleUpsertWithWhereUniqueWithoutFleetInput[]
    createMany?: VehicleCreateManyFleetInputEnvelope
    set?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    disconnect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    delete?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    connect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    update?: VehicleUpdateWithWhereUniqueWithoutFleetInput | VehicleUpdateWithWhereUniqueWithoutFleetInput[]
    updateMany?: VehicleUpdateManyWithWhereWithoutFleetInput | VehicleUpdateManyWithWhereWithoutFleetInput[]
    deleteMany?: VehicleScalarWhereInput | VehicleScalarWhereInput[]
  }

  export type FleetCreateNestedOneWithoutDriversInput = {
    create?: XOR<FleetCreateWithoutDriversInput, FleetUncheckedCreateWithoutDriversInput>
    connectOrCreate?: FleetCreateOrConnectWithoutDriversInput
    connect?: FleetWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type FleetUpdateOneRequiredWithoutDriversNestedInput = {
    create?: XOR<FleetCreateWithoutDriversInput, FleetUncheckedCreateWithoutDriversInput>
    connectOrCreate?: FleetCreateOrConnectWithoutDriversInput
    upsert?: FleetUpsertWithoutDriversInput
    connect?: FleetWhereUniqueInput
    update?: XOR<XOR<FleetUpdateToOneWithWhereWithoutDriversInput, FleetUpdateWithoutDriversInput>, FleetUncheckedUpdateWithoutDriversInput>
  }

  export type FleetCreateNestedOneWithoutVehiclesInput = {
    create?: XOR<FleetCreateWithoutVehiclesInput, FleetUncheckedCreateWithoutVehiclesInput>
    connectOrCreate?: FleetCreateOrConnectWithoutVehiclesInput
    connect?: FleetWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FleetUpdateOneRequiredWithoutVehiclesNestedInput = {
    create?: XOR<FleetCreateWithoutVehiclesInput, FleetUncheckedCreateWithoutVehiclesInput>
    connectOrCreate?: FleetCreateOrConnectWithoutVehiclesInput
    upsert?: FleetUpsertWithoutVehiclesInput
    connect?: FleetWhereUniqueInput
    update?: XOR<XOR<FleetUpdateToOneWithWhereWithoutVehiclesInput, FleetUpdateWithoutVehiclesInput>, FleetUncheckedUpdateWithoutVehiclesInput>
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type OperationalWalletEntryCreateNestedManyWithoutWalletInput = {
    create?: XOR<OperationalWalletEntryCreateWithoutWalletInput, OperationalWalletEntryUncheckedCreateWithoutWalletInput> | OperationalWalletEntryCreateWithoutWalletInput[] | OperationalWalletEntryUncheckedCreateWithoutWalletInput[]
    connectOrCreate?: OperationalWalletEntryCreateOrConnectWithoutWalletInput | OperationalWalletEntryCreateOrConnectWithoutWalletInput[]
    createMany?: OperationalWalletEntryCreateManyWalletInputEnvelope
    connect?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
  }

  export type OperationalWalletEntryUncheckedCreateNestedManyWithoutWalletInput = {
    create?: XOR<OperationalWalletEntryCreateWithoutWalletInput, OperationalWalletEntryUncheckedCreateWithoutWalletInput> | OperationalWalletEntryCreateWithoutWalletInput[] | OperationalWalletEntryUncheckedCreateWithoutWalletInput[]
    connectOrCreate?: OperationalWalletEntryCreateOrConnectWithoutWalletInput | OperationalWalletEntryCreateOrConnectWithoutWalletInput[]
    createMany?: OperationalWalletEntryCreateManyWalletInputEnvelope
    connect?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
  }

  export type OperationalWalletEntryUpdateManyWithoutWalletNestedInput = {
    create?: XOR<OperationalWalletEntryCreateWithoutWalletInput, OperationalWalletEntryUncheckedCreateWithoutWalletInput> | OperationalWalletEntryCreateWithoutWalletInput[] | OperationalWalletEntryUncheckedCreateWithoutWalletInput[]
    connectOrCreate?: OperationalWalletEntryCreateOrConnectWithoutWalletInput | OperationalWalletEntryCreateOrConnectWithoutWalletInput[]
    upsert?: OperationalWalletEntryUpsertWithWhereUniqueWithoutWalletInput | OperationalWalletEntryUpsertWithWhereUniqueWithoutWalletInput[]
    createMany?: OperationalWalletEntryCreateManyWalletInputEnvelope
    set?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
    disconnect?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
    delete?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
    connect?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
    update?: OperationalWalletEntryUpdateWithWhereUniqueWithoutWalletInput | OperationalWalletEntryUpdateWithWhereUniqueWithoutWalletInput[]
    updateMany?: OperationalWalletEntryUpdateManyWithWhereWithoutWalletInput | OperationalWalletEntryUpdateManyWithWhereWithoutWalletInput[]
    deleteMany?: OperationalWalletEntryScalarWhereInput | OperationalWalletEntryScalarWhereInput[]
  }

  export type OperationalWalletEntryUncheckedUpdateManyWithoutWalletNestedInput = {
    create?: XOR<OperationalWalletEntryCreateWithoutWalletInput, OperationalWalletEntryUncheckedCreateWithoutWalletInput> | OperationalWalletEntryCreateWithoutWalletInput[] | OperationalWalletEntryUncheckedCreateWithoutWalletInput[]
    connectOrCreate?: OperationalWalletEntryCreateOrConnectWithoutWalletInput | OperationalWalletEntryCreateOrConnectWithoutWalletInput[]
    upsert?: OperationalWalletEntryUpsertWithWhereUniqueWithoutWalletInput | OperationalWalletEntryUpsertWithWhereUniqueWithoutWalletInput[]
    createMany?: OperationalWalletEntryCreateManyWalletInputEnvelope
    set?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
    disconnect?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
    delete?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
    connect?: OperationalWalletEntryWhereUniqueInput | OperationalWalletEntryWhereUniqueInput[]
    update?: OperationalWalletEntryUpdateWithWhereUniqueWithoutWalletInput | OperationalWalletEntryUpdateWithWhereUniqueWithoutWalletInput[]
    updateMany?: OperationalWalletEntryUpdateManyWithWhereWithoutWalletInput | OperationalWalletEntryUpdateManyWithWhereWithoutWalletInput[]
    deleteMany?: OperationalWalletEntryScalarWhereInput | OperationalWalletEntryScalarWhereInput[]
  }

  export type OperationalWalletCreateNestedOneWithoutEntriesInput = {
    create?: XOR<OperationalWalletCreateWithoutEntriesInput, OperationalWalletUncheckedCreateWithoutEntriesInput>
    connectOrCreate?: OperationalWalletCreateOrConnectWithoutEntriesInput
    connect?: OperationalWalletWhereUniqueInput
  }

  export type OperationalWalletUpdateOneRequiredWithoutEntriesNestedInput = {
    create?: XOR<OperationalWalletCreateWithoutEntriesInput, OperationalWalletUncheckedCreateWithoutEntriesInput>
    connectOrCreate?: OperationalWalletCreateOrConnectWithoutEntriesInput
    upsert?: OperationalWalletUpsertWithoutEntriesInput
    connect?: OperationalWalletWhereUniqueInput
    update?: XOR<XOR<OperationalWalletUpdateToOneWithWhereWithoutEntriesInput, OperationalWalletUpdateWithoutEntriesInput>, OperationalWalletUncheckedUpdateWithoutEntriesInput>
  }

  export type TenantCreateNestedOneWithoutUsersInput = {
    create?: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsersInput
    connect?: TenantWhereUniqueInput
  }

  export type AuthOtpCreateNestedManyWithoutUserInput = {
    create?: XOR<AuthOtpCreateWithoutUserInput, AuthOtpUncheckedCreateWithoutUserInput> | AuthOtpCreateWithoutUserInput[] | AuthOtpUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthOtpCreateOrConnectWithoutUserInput | AuthOtpCreateOrConnectWithoutUserInput[]
    createMany?: AuthOtpCreateManyUserInputEnvelope
    connect?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
  }

  export type PasswordResetTokenCreateNestedManyWithoutUserInput = {
    create?: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput> | PasswordResetTokenCreateWithoutUserInput[] | PasswordResetTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetTokenCreateOrConnectWithoutUserInput | PasswordResetTokenCreateOrConnectWithoutUserInput[]
    createMany?: PasswordResetTokenCreateManyUserInputEnvelope
    connect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
  }

  export type AuthOtpUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AuthOtpCreateWithoutUserInput, AuthOtpUncheckedCreateWithoutUserInput> | AuthOtpCreateWithoutUserInput[] | AuthOtpUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthOtpCreateOrConnectWithoutUserInput | AuthOtpCreateOrConnectWithoutUserInput[]
    createMany?: AuthOtpCreateManyUserInputEnvelope
    connect?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
  }

  export type PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput> | PasswordResetTokenCreateWithoutUserInput[] | PasswordResetTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetTokenCreateOrConnectWithoutUserInput | PasswordResetTokenCreateOrConnectWithoutUserInput[]
    createMany?: PasswordResetTokenCreateManyUserInputEnvelope
    connect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type TenantUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsersInput
    upsert?: TenantUpsertWithoutUsersInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutUsersInput, TenantUpdateWithoutUsersInput>, TenantUncheckedUpdateWithoutUsersInput>
  }

  export type AuthOtpUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuthOtpCreateWithoutUserInput, AuthOtpUncheckedCreateWithoutUserInput> | AuthOtpCreateWithoutUserInput[] | AuthOtpUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthOtpCreateOrConnectWithoutUserInput | AuthOtpCreateOrConnectWithoutUserInput[]
    upsert?: AuthOtpUpsertWithWhereUniqueWithoutUserInput | AuthOtpUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuthOtpCreateManyUserInputEnvelope
    set?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
    disconnect?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
    delete?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
    connect?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
    update?: AuthOtpUpdateWithWhereUniqueWithoutUserInput | AuthOtpUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuthOtpUpdateManyWithWhereWithoutUserInput | AuthOtpUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuthOtpScalarWhereInput | AuthOtpScalarWhereInput[]
  }

  export type PasswordResetTokenUpdateManyWithoutUserNestedInput = {
    create?: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput> | PasswordResetTokenCreateWithoutUserInput[] | PasswordResetTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetTokenCreateOrConnectWithoutUserInput | PasswordResetTokenCreateOrConnectWithoutUserInput[]
    upsert?: PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput | PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PasswordResetTokenCreateManyUserInputEnvelope
    set?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    disconnect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    delete?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    connect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    update?: PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput | PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PasswordResetTokenUpdateManyWithWhereWithoutUserInput | PasswordResetTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PasswordResetTokenScalarWhereInput | PasswordResetTokenScalarWhereInput[]
  }

  export type AuthOtpUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuthOtpCreateWithoutUserInput, AuthOtpUncheckedCreateWithoutUserInput> | AuthOtpCreateWithoutUserInput[] | AuthOtpUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthOtpCreateOrConnectWithoutUserInput | AuthOtpCreateOrConnectWithoutUserInput[]
    upsert?: AuthOtpUpsertWithWhereUniqueWithoutUserInput | AuthOtpUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuthOtpCreateManyUserInputEnvelope
    set?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
    disconnect?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
    delete?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
    connect?: AuthOtpWhereUniqueInput | AuthOtpWhereUniqueInput[]
    update?: AuthOtpUpdateWithWhereUniqueWithoutUserInput | AuthOtpUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuthOtpUpdateManyWithWhereWithoutUserInput | AuthOtpUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuthOtpScalarWhereInput | AuthOtpScalarWhereInput[]
  }

  export type PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput> | PasswordResetTokenCreateWithoutUserInput[] | PasswordResetTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetTokenCreateOrConnectWithoutUserInput | PasswordResetTokenCreateOrConnectWithoutUserInput[]
    upsert?: PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput | PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PasswordResetTokenCreateManyUserInputEnvelope
    set?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    disconnect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    delete?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    connect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    update?: PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput | PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PasswordResetTokenUpdateManyWithWhereWithoutUserInput | PasswordResetTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PasswordResetTokenScalarWhereInput | PasswordResetTokenScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutAuthOtpsInput = {
    create?: XOR<UserCreateWithoutAuthOtpsInput, UserUncheckedCreateWithoutAuthOtpsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuthOtpsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAuthOtpsNestedInput = {
    create?: XOR<UserCreateWithoutAuthOtpsInput, UserUncheckedCreateWithoutAuthOtpsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuthOtpsInput
    upsert?: UserUpsertWithoutAuthOtpsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAuthOtpsInput, UserUpdateWithoutAuthOtpsInput>, UserUncheckedUpdateWithoutAuthOtpsInput>
  }

  export type UserCreateNestedOneWithoutPasswordResetTokensInput = {
    create?: XOR<UserCreateWithoutPasswordResetTokensInput, UserUncheckedCreateWithoutPasswordResetTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutPasswordResetTokensInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutPasswordResetTokensNestedInput = {
    create?: XOR<UserCreateWithoutPasswordResetTokensInput, UserUncheckedCreateWithoutPasswordResetTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutPasswordResetTokensInput
    upsert?: UserUpsertWithoutPasswordResetTokensInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPasswordResetTokensInput, UserUpdateWithoutPasswordResetTokensInput>, UserUncheckedUpdateWithoutPasswordResetTokensInput>
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type BusinessEntityCreateWithoutTenantInput = {
    id?: string
    name: string
    country: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    operatingUnits?: OperatingUnitCreateNestedManyWithoutBusinessEntityInput
  }

  export type BusinessEntityUncheckedCreateWithoutTenantInput = {
    id?: string
    name: string
    country: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    operatingUnits?: OperatingUnitUncheckedCreateNestedManyWithoutBusinessEntityInput
  }

  export type BusinessEntityCreateOrConnectWithoutTenantInput = {
    where: BusinessEntityWhereUniqueInput
    create: XOR<BusinessEntityCreateWithoutTenantInput, BusinessEntityUncheckedCreateWithoutTenantInput>
  }

  export type BusinessEntityCreateManyTenantInputEnvelope = {
    data: BusinessEntityCreateManyTenantInput | BusinessEntityCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutTenantInput = {
    id?: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    authOtps?: AuthOtpCreateNestedManyWithoutUserInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTenantInput = {
    id?: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    authOtps?: AuthOtpUncheckedCreateNestedManyWithoutUserInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTenantInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
  }

  export type UserCreateManyTenantInputEnvelope = {
    data: UserCreateManyTenantInput | UserCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type BusinessEntityUpsertWithWhereUniqueWithoutTenantInput = {
    where: BusinessEntityWhereUniqueInput
    update: XOR<BusinessEntityUpdateWithoutTenantInput, BusinessEntityUncheckedUpdateWithoutTenantInput>
    create: XOR<BusinessEntityCreateWithoutTenantInput, BusinessEntityUncheckedCreateWithoutTenantInput>
  }

  export type BusinessEntityUpdateWithWhereUniqueWithoutTenantInput = {
    where: BusinessEntityWhereUniqueInput
    data: XOR<BusinessEntityUpdateWithoutTenantInput, BusinessEntityUncheckedUpdateWithoutTenantInput>
  }

  export type BusinessEntityUpdateManyWithWhereWithoutTenantInput = {
    where: BusinessEntityScalarWhereInput
    data: XOR<BusinessEntityUpdateManyMutationInput, BusinessEntityUncheckedUpdateManyWithoutTenantInput>
  }

  export type BusinessEntityScalarWhereInput = {
    AND?: BusinessEntityScalarWhereInput | BusinessEntityScalarWhereInput[]
    OR?: BusinessEntityScalarWhereInput[]
    NOT?: BusinessEntityScalarWhereInput | BusinessEntityScalarWhereInput[]
    id?: StringFilter<"BusinessEntity"> | string
    tenantId?: StringFilter<"BusinessEntity"> | string
    name?: StringFilter<"BusinessEntity"> | string
    country?: StringFilter<"BusinessEntity"> | string
    businessModel?: StringFilter<"BusinessEntity"> | string
    status?: StringFilter<"BusinessEntity"> | string
    createdAt?: DateTimeFilter<"BusinessEntity"> | Date | string
    updatedAt?: DateTimeFilter<"BusinessEntity"> | Date | string
  }

  export type UserUpsertWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
  }

  export type UserUpdateWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>
  }

  export type UserUpdateManyWithWhereWithoutTenantInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutTenantInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    tenantId?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    name?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    isEmailVerified?: BoolFilter<"User"> | boolean
    businessEntityId?: StringNullableFilter<"User"> | string | null
    operatingUnitId?: StringNullableFilter<"User"> | string | null
    passwordHash?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type TenantCreateWithoutBusinessEntitiesInput = {
    id?: string
    slug: string
    name: string
    country: string
    status?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutBusinessEntitiesInput = {
    id?: string
    slug: string
    name: string
    country: string
    status?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutBusinessEntitiesInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutBusinessEntitiesInput, TenantUncheckedCreateWithoutBusinessEntitiesInput>
  }

  export type OperatingUnitCreateWithoutBusinessEntityInput = {
    id?: string
    tenantId: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    fleets?: FleetCreateNestedManyWithoutOperatingUnitInput
  }

  export type OperatingUnitUncheckedCreateWithoutBusinessEntityInput = {
    id?: string
    tenantId: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    fleets?: FleetUncheckedCreateNestedManyWithoutOperatingUnitInput
  }

  export type OperatingUnitCreateOrConnectWithoutBusinessEntityInput = {
    where: OperatingUnitWhereUniqueInput
    create: XOR<OperatingUnitCreateWithoutBusinessEntityInput, OperatingUnitUncheckedCreateWithoutBusinessEntityInput>
  }

  export type OperatingUnitCreateManyBusinessEntityInputEnvelope = {
    data: OperatingUnitCreateManyBusinessEntityInput | OperatingUnitCreateManyBusinessEntityInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutBusinessEntitiesInput = {
    update: XOR<TenantUpdateWithoutBusinessEntitiesInput, TenantUncheckedUpdateWithoutBusinessEntitiesInput>
    create: XOR<TenantCreateWithoutBusinessEntitiesInput, TenantUncheckedCreateWithoutBusinessEntitiesInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutBusinessEntitiesInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutBusinessEntitiesInput, TenantUncheckedUpdateWithoutBusinessEntitiesInput>
  }

  export type TenantUpdateWithoutBusinessEntitiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutBusinessEntitiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type OperatingUnitUpsertWithWhereUniqueWithoutBusinessEntityInput = {
    where: OperatingUnitWhereUniqueInput
    update: XOR<OperatingUnitUpdateWithoutBusinessEntityInput, OperatingUnitUncheckedUpdateWithoutBusinessEntityInput>
    create: XOR<OperatingUnitCreateWithoutBusinessEntityInput, OperatingUnitUncheckedCreateWithoutBusinessEntityInput>
  }

  export type OperatingUnitUpdateWithWhereUniqueWithoutBusinessEntityInput = {
    where: OperatingUnitWhereUniqueInput
    data: XOR<OperatingUnitUpdateWithoutBusinessEntityInput, OperatingUnitUncheckedUpdateWithoutBusinessEntityInput>
  }

  export type OperatingUnitUpdateManyWithWhereWithoutBusinessEntityInput = {
    where: OperatingUnitScalarWhereInput
    data: XOR<OperatingUnitUpdateManyMutationInput, OperatingUnitUncheckedUpdateManyWithoutBusinessEntityInput>
  }

  export type OperatingUnitScalarWhereInput = {
    AND?: OperatingUnitScalarWhereInput | OperatingUnitScalarWhereInput[]
    OR?: OperatingUnitScalarWhereInput[]
    NOT?: OperatingUnitScalarWhereInput | OperatingUnitScalarWhereInput[]
    id?: StringFilter<"OperatingUnit"> | string
    tenantId?: StringFilter<"OperatingUnit"> | string
    businessEntityId?: StringFilter<"OperatingUnit"> | string
    name?: StringFilter<"OperatingUnit"> | string
    status?: StringFilter<"OperatingUnit"> | string
    createdAt?: DateTimeFilter<"OperatingUnit"> | Date | string
    updatedAt?: DateTimeFilter<"OperatingUnit"> | Date | string
  }

  export type BusinessEntityCreateWithoutOperatingUnitsInput = {
    id?: string
    name: string
    country: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutBusinessEntitiesInput
  }

  export type BusinessEntityUncheckedCreateWithoutOperatingUnitsInput = {
    id?: string
    tenantId: string
    name: string
    country: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BusinessEntityCreateOrConnectWithoutOperatingUnitsInput = {
    where: BusinessEntityWhereUniqueInput
    create: XOR<BusinessEntityCreateWithoutOperatingUnitsInput, BusinessEntityUncheckedCreateWithoutOperatingUnitsInput>
  }

  export type FleetCreateWithoutOperatingUnitInput = {
    id?: string
    tenantId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    drivers?: DriverCreateNestedManyWithoutFleetInput
    vehicles?: VehicleCreateNestedManyWithoutFleetInput
  }

  export type FleetUncheckedCreateWithoutOperatingUnitInput = {
    id?: string
    tenantId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    drivers?: DriverUncheckedCreateNestedManyWithoutFleetInput
    vehicles?: VehicleUncheckedCreateNestedManyWithoutFleetInput
  }

  export type FleetCreateOrConnectWithoutOperatingUnitInput = {
    where: FleetWhereUniqueInput
    create: XOR<FleetCreateWithoutOperatingUnitInput, FleetUncheckedCreateWithoutOperatingUnitInput>
  }

  export type FleetCreateManyOperatingUnitInputEnvelope = {
    data: FleetCreateManyOperatingUnitInput | FleetCreateManyOperatingUnitInput[]
    skipDuplicates?: boolean
  }

  export type BusinessEntityUpsertWithoutOperatingUnitsInput = {
    update: XOR<BusinessEntityUpdateWithoutOperatingUnitsInput, BusinessEntityUncheckedUpdateWithoutOperatingUnitsInput>
    create: XOR<BusinessEntityCreateWithoutOperatingUnitsInput, BusinessEntityUncheckedCreateWithoutOperatingUnitsInput>
    where?: BusinessEntityWhereInput
  }

  export type BusinessEntityUpdateToOneWithWhereWithoutOperatingUnitsInput = {
    where?: BusinessEntityWhereInput
    data: XOR<BusinessEntityUpdateWithoutOperatingUnitsInput, BusinessEntityUncheckedUpdateWithoutOperatingUnitsInput>
  }

  export type BusinessEntityUpdateWithoutOperatingUnitsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutBusinessEntitiesNestedInput
  }

  export type BusinessEntityUncheckedUpdateWithoutOperatingUnitsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FleetUpsertWithWhereUniqueWithoutOperatingUnitInput = {
    where: FleetWhereUniqueInput
    update: XOR<FleetUpdateWithoutOperatingUnitInput, FleetUncheckedUpdateWithoutOperatingUnitInput>
    create: XOR<FleetCreateWithoutOperatingUnitInput, FleetUncheckedCreateWithoutOperatingUnitInput>
  }

  export type FleetUpdateWithWhereUniqueWithoutOperatingUnitInput = {
    where: FleetWhereUniqueInput
    data: XOR<FleetUpdateWithoutOperatingUnitInput, FleetUncheckedUpdateWithoutOperatingUnitInput>
  }

  export type FleetUpdateManyWithWhereWithoutOperatingUnitInput = {
    where: FleetScalarWhereInput
    data: XOR<FleetUpdateManyMutationInput, FleetUncheckedUpdateManyWithoutOperatingUnitInput>
  }

  export type FleetScalarWhereInput = {
    AND?: FleetScalarWhereInput | FleetScalarWhereInput[]
    OR?: FleetScalarWhereInput[]
    NOT?: FleetScalarWhereInput | FleetScalarWhereInput[]
    id?: StringFilter<"Fleet"> | string
    tenantId?: StringFilter<"Fleet"> | string
    operatingUnitId?: StringFilter<"Fleet"> | string
    name?: StringFilter<"Fleet"> | string
    businessModel?: StringFilter<"Fleet"> | string
    status?: StringFilter<"Fleet"> | string
    createdAt?: DateTimeFilter<"Fleet"> | Date | string
    updatedAt?: DateTimeFilter<"Fleet"> | Date | string
  }

  export type OperatingUnitCreateWithoutFleetsInput = {
    id?: string
    tenantId: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    businessEntity: BusinessEntityCreateNestedOneWithoutOperatingUnitsInput
  }

  export type OperatingUnitUncheckedCreateWithoutFleetsInput = {
    id?: string
    tenantId: string
    businessEntityId: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OperatingUnitCreateOrConnectWithoutFleetsInput = {
    where: OperatingUnitWhereUniqueInput
    create: XOR<OperatingUnitCreateWithoutFleetsInput, OperatingUnitUncheckedCreateWithoutFleetsInput>
  }

  export type DriverCreateWithoutFleetInput = {
    id?: string
    tenantId: string
    status?: string
    firstName: string
    lastName: string
    phone: string
    email?: string | null
    dateOfBirth?: string | null
    nationality?: string | null
    personId?: string | null
    businessEntityId: string
    operatingUnitId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DriverUncheckedCreateWithoutFleetInput = {
    id?: string
    tenantId: string
    status?: string
    firstName: string
    lastName: string
    phone: string
    email?: string | null
    dateOfBirth?: string | null
    nationality?: string | null
    personId?: string | null
    businessEntityId: string
    operatingUnitId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DriverCreateOrConnectWithoutFleetInput = {
    where: DriverWhereUniqueInput
    create: XOR<DriverCreateWithoutFleetInput, DriverUncheckedCreateWithoutFleetInput>
  }

  export type DriverCreateManyFleetInputEnvelope = {
    data: DriverCreateManyFleetInput | DriverCreateManyFleetInput[]
    skipDuplicates?: boolean
  }

  export type VehicleCreateWithoutFleetInput = {
    id?: string
    tenantId: string
    status?: string
    vehicleType: string
    make: string
    model: string
    year: number
    plate: string
    color?: string | null
    vin?: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VehicleUncheckedCreateWithoutFleetInput = {
    id?: string
    tenantId: string
    status?: string
    vehicleType: string
    make: string
    model: string
    year: number
    plate: string
    color?: string | null
    vin?: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VehicleCreateOrConnectWithoutFleetInput = {
    where: VehicleWhereUniqueInput
    create: XOR<VehicleCreateWithoutFleetInput, VehicleUncheckedCreateWithoutFleetInput>
  }

  export type VehicleCreateManyFleetInputEnvelope = {
    data: VehicleCreateManyFleetInput | VehicleCreateManyFleetInput[]
    skipDuplicates?: boolean
  }

  export type OperatingUnitUpsertWithoutFleetsInput = {
    update: XOR<OperatingUnitUpdateWithoutFleetsInput, OperatingUnitUncheckedUpdateWithoutFleetsInput>
    create: XOR<OperatingUnitCreateWithoutFleetsInput, OperatingUnitUncheckedCreateWithoutFleetsInput>
    where?: OperatingUnitWhereInput
  }

  export type OperatingUnitUpdateToOneWithWhereWithoutFleetsInput = {
    where?: OperatingUnitWhereInput
    data: XOR<OperatingUnitUpdateWithoutFleetsInput, OperatingUnitUncheckedUpdateWithoutFleetsInput>
  }

  export type OperatingUnitUpdateWithoutFleetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    businessEntity?: BusinessEntityUpdateOneRequiredWithoutOperatingUnitsNestedInput
  }

  export type OperatingUnitUncheckedUpdateWithoutFleetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverUpsertWithWhereUniqueWithoutFleetInput = {
    where: DriverWhereUniqueInput
    update: XOR<DriverUpdateWithoutFleetInput, DriverUncheckedUpdateWithoutFleetInput>
    create: XOR<DriverCreateWithoutFleetInput, DriverUncheckedCreateWithoutFleetInput>
  }

  export type DriverUpdateWithWhereUniqueWithoutFleetInput = {
    where: DriverWhereUniqueInput
    data: XOR<DriverUpdateWithoutFleetInput, DriverUncheckedUpdateWithoutFleetInput>
  }

  export type DriverUpdateManyWithWhereWithoutFleetInput = {
    where: DriverScalarWhereInput
    data: XOR<DriverUpdateManyMutationInput, DriverUncheckedUpdateManyWithoutFleetInput>
  }

  export type DriverScalarWhereInput = {
    AND?: DriverScalarWhereInput | DriverScalarWhereInput[]
    OR?: DriverScalarWhereInput[]
    NOT?: DriverScalarWhereInput | DriverScalarWhereInput[]
    id?: StringFilter<"Driver"> | string
    tenantId?: StringFilter<"Driver"> | string
    fleetId?: StringFilter<"Driver"> | string
    status?: StringFilter<"Driver"> | string
    firstName?: StringFilter<"Driver"> | string
    lastName?: StringFilter<"Driver"> | string
    phone?: StringFilter<"Driver"> | string
    email?: StringNullableFilter<"Driver"> | string | null
    dateOfBirth?: StringNullableFilter<"Driver"> | string | null
    nationality?: StringNullableFilter<"Driver"> | string | null
    personId?: StringNullableFilter<"Driver"> | string | null
    businessEntityId?: StringFilter<"Driver"> | string
    operatingUnitId?: StringFilter<"Driver"> | string
    createdAt?: DateTimeFilter<"Driver"> | Date | string
    updatedAt?: DateTimeFilter<"Driver"> | Date | string
  }

  export type VehicleUpsertWithWhereUniqueWithoutFleetInput = {
    where: VehicleWhereUniqueInput
    update: XOR<VehicleUpdateWithoutFleetInput, VehicleUncheckedUpdateWithoutFleetInput>
    create: XOR<VehicleCreateWithoutFleetInput, VehicleUncheckedCreateWithoutFleetInput>
  }

  export type VehicleUpdateWithWhereUniqueWithoutFleetInput = {
    where: VehicleWhereUniqueInput
    data: XOR<VehicleUpdateWithoutFleetInput, VehicleUncheckedUpdateWithoutFleetInput>
  }

  export type VehicleUpdateManyWithWhereWithoutFleetInput = {
    where: VehicleScalarWhereInput
    data: XOR<VehicleUpdateManyMutationInput, VehicleUncheckedUpdateManyWithoutFleetInput>
  }

  export type VehicleScalarWhereInput = {
    AND?: VehicleScalarWhereInput | VehicleScalarWhereInput[]
    OR?: VehicleScalarWhereInput[]
    NOT?: VehicleScalarWhereInput | VehicleScalarWhereInput[]
    id?: StringFilter<"Vehicle"> | string
    tenantId?: StringFilter<"Vehicle"> | string
    fleetId?: StringFilter<"Vehicle"> | string
    status?: StringFilter<"Vehicle"> | string
    vehicleType?: StringFilter<"Vehicle"> | string
    make?: StringFilter<"Vehicle"> | string
    model?: StringFilter<"Vehicle"> | string
    year?: IntFilter<"Vehicle"> | number
    plate?: StringFilter<"Vehicle"> | string
    color?: StringNullableFilter<"Vehicle"> | string | null
    vin?: StringNullableFilter<"Vehicle"> | string | null
    operatingUnitId?: StringFilter<"Vehicle"> | string
    businessEntityId?: StringFilter<"Vehicle"> | string
    createdAt?: DateTimeFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeFilter<"Vehicle"> | Date | string
  }

  export type FleetCreateWithoutDriversInput = {
    id?: string
    tenantId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    operatingUnit: OperatingUnitCreateNestedOneWithoutFleetsInput
    vehicles?: VehicleCreateNestedManyWithoutFleetInput
  }

  export type FleetUncheckedCreateWithoutDriversInput = {
    id?: string
    tenantId: string
    operatingUnitId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    vehicles?: VehicleUncheckedCreateNestedManyWithoutFleetInput
  }

  export type FleetCreateOrConnectWithoutDriversInput = {
    where: FleetWhereUniqueInput
    create: XOR<FleetCreateWithoutDriversInput, FleetUncheckedCreateWithoutDriversInput>
  }

  export type FleetUpsertWithoutDriversInput = {
    update: XOR<FleetUpdateWithoutDriversInput, FleetUncheckedUpdateWithoutDriversInput>
    create: XOR<FleetCreateWithoutDriversInput, FleetUncheckedCreateWithoutDriversInput>
    where?: FleetWhereInput
  }

  export type FleetUpdateToOneWithWhereWithoutDriversInput = {
    where?: FleetWhereInput
    data: XOR<FleetUpdateWithoutDriversInput, FleetUncheckedUpdateWithoutDriversInput>
  }

  export type FleetUpdateWithoutDriversInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    operatingUnit?: OperatingUnitUpdateOneRequiredWithoutFleetsNestedInput
    vehicles?: VehicleUpdateManyWithoutFleetNestedInput
  }

  export type FleetUncheckedUpdateWithoutDriversInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vehicles?: VehicleUncheckedUpdateManyWithoutFleetNestedInput
  }

  export type FleetCreateWithoutVehiclesInput = {
    id?: string
    tenantId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    operatingUnit: OperatingUnitCreateNestedOneWithoutFleetsInput
    drivers?: DriverCreateNestedManyWithoutFleetInput
  }

  export type FleetUncheckedCreateWithoutVehiclesInput = {
    id?: string
    tenantId: string
    operatingUnitId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    drivers?: DriverUncheckedCreateNestedManyWithoutFleetInput
  }

  export type FleetCreateOrConnectWithoutVehiclesInput = {
    where: FleetWhereUniqueInput
    create: XOR<FleetCreateWithoutVehiclesInput, FleetUncheckedCreateWithoutVehiclesInput>
  }

  export type FleetUpsertWithoutVehiclesInput = {
    update: XOR<FleetUpdateWithoutVehiclesInput, FleetUncheckedUpdateWithoutVehiclesInput>
    create: XOR<FleetCreateWithoutVehiclesInput, FleetUncheckedCreateWithoutVehiclesInput>
    where?: FleetWhereInput
  }

  export type FleetUpdateToOneWithWhereWithoutVehiclesInput = {
    where?: FleetWhereInput
    data: XOR<FleetUpdateWithoutVehiclesInput, FleetUncheckedUpdateWithoutVehiclesInput>
  }

  export type FleetUpdateWithoutVehiclesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    operatingUnit?: OperatingUnitUpdateOneRequiredWithoutFleetsNestedInput
    drivers?: DriverUpdateManyWithoutFleetNestedInput
  }

  export type FleetUncheckedUpdateWithoutVehiclesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    drivers?: DriverUncheckedUpdateManyWithoutFleetNestedInput
  }

  export type OperationalWalletEntryCreateWithoutWalletInput = {
    id?: string
    type: string
    amountMinorUnits: number
    currency: string
    referenceId?: string | null
    referenceType?: string | null
    description?: string | null
    createdAt?: Date | string
  }

  export type OperationalWalletEntryUncheckedCreateWithoutWalletInput = {
    id?: string
    type: string
    amountMinorUnits: number
    currency: string
    referenceId?: string | null
    referenceType?: string | null
    description?: string | null
    createdAt?: Date | string
  }

  export type OperationalWalletEntryCreateOrConnectWithoutWalletInput = {
    where: OperationalWalletEntryWhereUniqueInput
    create: XOR<OperationalWalletEntryCreateWithoutWalletInput, OperationalWalletEntryUncheckedCreateWithoutWalletInput>
  }

  export type OperationalWalletEntryCreateManyWalletInputEnvelope = {
    data: OperationalWalletEntryCreateManyWalletInput | OperationalWalletEntryCreateManyWalletInput[]
    skipDuplicates?: boolean
  }

  export type OperationalWalletEntryUpsertWithWhereUniqueWithoutWalletInput = {
    where: OperationalWalletEntryWhereUniqueInput
    update: XOR<OperationalWalletEntryUpdateWithoutWalletInput, OperationalWalletEntryUncheckedUpdateWithoutWalletInput>
    create: XOR<OperationalWalletEntryCreateWithoutWalletInput, OperationalWalletEntryUncheckedCreateWithoutWalletInput>
  }

  export type OperationalWalletEntryUpdateWithWhereUniqueWithoutWalletInput = {
    where: OperationalWalletEntryWhereUniqueInput
    data: XOR<OperationalWalletEntryUpdateWithoutWalletInput, OperationalWalletEntryUncheckedUpdateWithoutWalletInput>
  }

  export type OperationalWalletEntryUpdateManyWithWhereWithoutWalletInput = {
    where: OperationalWalletEntryScalarWhereInput
    data: XOR<OperationalWalletEntryUpdateManyMutationInput, OperationalWalletEntryUncheckedUpdateManyWithoutWalletInput>
  }

  export type OperationalWalletEntryScalarWhereInput = {
    AND?: OperationalWalletEntryScalarWhereInput | OperationalWalletEntryScalarWhereInput[]
    OR?: OperationalWalletEntryScalarWhereInput[]
    NOT?: OperationalWalletEntryScalarWhereInput | OperationalWalletEntryScalarWhereInput[]
    id?: StringFilter<"OperationalWalletEntry"> | string
    walletId?: StringFilter<"OperationalWalletEntry"> | string
    type?: StringFilter<"OperationalWalletEntry"> | string
    amountMinorUnits?: IntFilter<"OperationalWalletEntry"> | number
    currency?: StringFilter<"OperationalWalletEntry"> | string
    referenceId?: StringNullableFilter<"OperationalWalletEntry"> | string | null
    referenceType?: StringNullableFilter<"OperationalWalletEntry"> | string | null
    description?: StringNullableFilter<"OperationalWalletEntry"> | string | null
    createdAt?: DateTimeFilter<"OperationalWalletEntry"> | Date | string
  }

  export type OperationalWalletCreateWithoutEntriesInput = {
    id?: string
    tenantId: string
    businessEntityId: string
    currency: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OperationalWalletUncheckedCreateWithoutEntriesInput = {
    id?: string
    tenantId: string
    businessEntityId: string
    currency: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OperationalWalletCreateOrConnectWithoutEntriesInput = {
    where: OperationalWalletWhereUniqueInput
    create: XOR<OperationalWalletCreateWithoutEntriesInput, OperationalWalletUncheckedCreateWithoutEntriesInput>
  }

  export type OperationalWalletUpsertWithoutEntriesInput = {
    update: XOR<OperationalWalletUpdateWithoutEntriesInput, OperationalWalletUncheckedUpdateWithoutEntriesInput>
    create: XOR<OperationalWalletCreateWithoutEntriesInput, OperationalWalletUncheckedCreateWithoutEntriesInput>
    where?: OperationalWalletWhereInput
  }

  export type OperationalWalletUpdateToOneWithWhereWithoutEntriesInput = {
    where?: OperationalWalletWhereInput
    data: XOR<OperationalWalletUpdateWithoutEntriesInput, OperationalWalletUncheckedUpdateWithoutEntriesInput>
  }

  export type OperationalWalletUpdateWithoutEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalWalletUncheckedUpdateWithoutEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateWithoutUsersInput = {
    id?: string
    slug: string
    name: string
    country: string
    status?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    businessEntities?: BusinessEntityCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutUsersInput = {
    id?: string
    slug: string
    name: string
    country: string
    status?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    businessEntities?: BusinessEntityUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutUsersInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
  }

  export type AuthOtpCreateWithoutUserInput = {
    id?: string
    identifier: string
    purpose: string
    codeHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthOtpUncheckedCreateWithoutUserInput = {
    id?: string
    identifier: string
    purpose: string
    codeHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthOtpCreateOrConnectWithoutUserInput = {
    where: AuthOtpWhereUniqueInput
    create: XOR<AuthOtpCreateWithoutUserInput, AuthOtpUncheckedCreateWithoutUserInput>
  }

  export type AuthOtpCreateManyUserInputEnvelope = {
    data: AuthOtpCreateManyUserInput | AuthOtpCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PasswordResetTokenCreateWithoutUserInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasswordResetTokenUncheckedCreateWithoutUserInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasswordResetTokenCreateOrConnectWithoutUserInput = {
    where: PasswordResetTokenWhereUniqueInput
    create: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput>
  }

  export type PasswordResetTokenCreateManyUserInputEnvelope = {
    data: PasswordResetTokenCreateManyUserInput | PasswordResetTokenCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutUsersInput = {
    update: XOR<TenantUpdateWithoutUsersInput, TenantUncheckedUpdateWithoutUsersInput>
    create: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutUsersInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutUsersInput, TenantUncheckedUpdateWithoutUsersInput>
  }

  export type TenantUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    businessEntities?: BusinessEntityUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    businessEntities?: BusinessEntityUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type AuthOtpUpsertWithWhereUniqueWithoutUserInput = {
    where: AuthOtpWhereUniqueInput
    update: XOR<AuthOtpUpdateWithoutUserInput, AuthOtpUncheckedUpdateWithoutUserInput>
    create: XOR<AuthOtpCreateWithoutUserInput, AuthOtpUncheckedCreateWithoutUserInput>
  }

  export type AuthOtpUpdateWithWhereUniqueWithoutUserInput = {
    where: AuthOtpWhereUniqueInput
    data: XOR<AuthOtpUpdateWithoutUserInput, AuthOtpUncheckedUpdateWithoutUserInput>
  }

  export type AuthOtpUpdateManyWithWhereWithoutUserInput = {
    where: AuthOtpScalarWhereInput
    data: XOR<AuthOtpUpdateManyMutationInput, AuthOtpUncheckedUpdateManyWithoutUserInput>
  }

  export type AuthOtpScalarWhereInput = {
    AND?: AuthOtpScalarWhereInput | AuthOtpScalarWhereInput[]
    OR?: AuthOtpScalarWhereInput[]
    NOT?: AuthOtpScalarWhereInput | AuthOtpScalarWhereInput[]
    id?: StringFilter<"AuthOtp"> | string
    userId?: StringFilter<"AuthOtp"> | string
    identifier?: StringFilter<"AuthOtp"> | string
    purpose?: StringFilter<"AuthOtp"> | string
    codeHash?: StringFilter<"AuthOtp"> | string
    expiresAt?: DateTimeFilter<"AuthOtp"> | Date | string
    consumedAt?: DateTimeNullableFilter<"AuthOtp"> | Date | string | null
    createdAt?: DateTimeFilter<"AuthOtp"> | Date | string
    updatedAt?: DateTimeFilter<"AuthOtp"> | Date | string
  }

  export type PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput = {
    where: PasswordResetTokenWhereUniqueInput
    update: XOR<PasswordResetTokenUpdateWithoutUserInput, PasswordResetTokenUncheckedUpdateWithoutUserInput>
    create: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput>
  }

  export type PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput = {
    where: PasswordResetTokenWhereUniqueInput
    data: XOR<PasswordResetTokenUpdateWithoutUserInput, PasswordResetTokenUncheckedUpdateWithoutUserInput>
  }

  export type PasswordResetTokenUpdateManyWithWhereWithoutUserInput = {
    where: PasswordResetTokenScalarWhereInput
    data: XOR<PasswordResetTokenUpdateManyMutationInput, PasswordResetTokenUncheckedUpdateManyWithoutUserInput>
  }

  export type PasswordResetTokenScalarWhereInput = {
    AND?: PasswordResetTokenScalarWhereInput | PasswordResetTokenScalarWhereInput[]
    OR?: PasswordResetTokenScalarWhereInput[]
    NOT?: PasswordResetTokenScalarWhereInput | PasswordResetTokenScalarWhereInput[]
    id?: StringFilter<"PasswordResetToken"> | string
    userId?: StringFilter<"PasswordResetToken"> | string
    tokenHash?: StringFilter<"PasswordResetToken"> | string
    expiresAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    consumedAt?: DateTimeNullableFilter<"PasswordResetToken"> | Date | string | null
    createdAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    updatedAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
  }

  export type UserCreateWithoutAuthOtpsInput = {
    id?: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutUsersInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAuthOtpsInput = {
    id?: string
    tenantId: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAuthOtpsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAuthOtpsInput, UserUncheckedCreateWithoutAuthOtpsInput>
  }

  export type UserUpsertWithoutAuthOtpsInput = {
    update: XOR<UserUpdateWithoutAuthOtpsInput, UserUncheckedUpdateWithoutAuthOtpsInput>
    create: XOR<UserCreateWithoutAuthOtpsInput, UserUncheckedCreateWithoutAuthOtpsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAuthOtpsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAuthOtpsInput, UserUncheckedUpdateWithoutAuthOtpsInput>
  }

  export type UserUpdateWithoutAuthOtpsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsersNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAuthOtpsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutPasswordResetTokensInput = {
    id?: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutUsersInput
    authOtps?: AuthOtpCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPasswordResetTokensInput = {
    id?: string
    tenantId: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    authOtps?: AuthOtpUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPasswordResetTokensInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPasswordResetTokensInput, UserUncheckedCreateWithoutPasswordResetTokensInput>
  }

  export type UserUpsertWithoutPasswordResetTokensInput = {
    update: XOR<UserUpdateWithoutPasswordResetTokensInput, UserUncheckedUpdateWithoutPasswordResetTokensInput>
    create: XOR<UserCreateWithoutPasswordResetTokensInput, UserUncheckedCreateWithoutPasswordResetTokensInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPasswordResetTokensInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPasswordResetTokensInput, UserUncheckedUpdateWithoutPasswordResetTokensInput>
  }

  export type UserUpdateWithoutPasswordResetTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsersNestedInput
    authOtps?: AuthOtpUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPasswordResetTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authOtps?: AuthOtpUncheckedUpdateManyWithoutUserNestedInput
  }

  export type BusinessEntityCreateManyTenantInput = {
    id?: string
    name: string
    country: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateManyTenantInput = {
    id?: string
    email: string
    phone?: string | null
    name: string
    role: string
    isActive?: boolean
    isEmailVerified?: boolean
    businessEntityId?: string | null
    operatingUnitId?: string | null
    passwordHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BusinessEntityUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    operatingUnits?: OperatingUnitUpdateManyWithoutBusinessEntityNestedInput
  }

  export type BusinessEntityUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    operatingUnits?: OperatingUnitUncheckedUpdateManyWithoutBusinessEntityNestedInput
  }

  export type BusinessEntityUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authOtps?: AuthOtpUpdateManyWithoutUserNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authOtps?: AuthOtpUncheckedUpdateManyWithoutUserNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    businessEntityId?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperatingUnitCreateManyBusinessEntityInput = {
    id?: string
    tenantId: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OperatingUnitUpdateWithoutBusinessEntityInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fleets?: FleetUpdateManyWithoutOperatingUnitNestedInput
  }

  export type OperatingUnitUncheckedUpdateWithoutBusinessEntityInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fleets?: FleetUncheckedUpdateManyWithoutOperatingUnitNestedInput
  }

  export type OperatingUnitUncheckedUpdateManyWithoutBusinessEntityInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FleetCreateManyOperatingUnitInput = {
    id?: string
    tenantId: string
    name: string
    businessModel: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FleetUpdateWithoutOperatingUnitInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    drivers?: DriverUpdateManyWithoutFleetNestedInput
    vehicles?: VehicleUpdateManyWithoutFleetNestedInput
  }

  export type FleetUncheckedUpdateWithoutOperatingUnitInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    drivers?: DriverUncheckedUpdateManyWithoutFleetNestedInput
    vehicles?: VehicleUncheckedUpdateManyWithoutFleetNestedInput
  }

  export type FleetUncheckedUpdateManyWithoutOperatingUnitInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    businessModel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverCreateManyFleetInput = {
    id?: string
    tenantId: string
    status?: string
    firstName: string
    lastName: string
    phone: string
    email?: string | null
    dateOfBirth?: string | null
    nationality?: string | null
    personId?: string | null
    businessEntityId: string
    operatingUnitId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VehicleCreateManyFleetInput = {
    id?: string
    tenantId: string
    status?: string
    vehicleType: string
    make: string
    model: string
    year: number
    plate: string
    color?: string | null
    vin?: string | null
    operatingUnitId: string
    businessEntityId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DriverUpdateWithoutFleetInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    nationality?: NullableStringFieldUpdateOperationsInput | string | null
    personId?: NullableStringFieldUpdateOperationsInput | string | null
    businessEntityId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverUncheckedUpdateWithoutFleetInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    nationality?: NullableStringFieldUpdateOperationsInput | string | null
    personId?: NullableStringFieldUpdateOperationsInput | string | null
    businessEntityId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverUncheckedUpdateManyWithoutFleetInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    dateOfBirth?: NullableStringFieldUpdateOperationsInput | string | null
    nationality?: NullableStringFieldUpdateOperationsInput | string | null
    personId?: NullableStringFieldUpdateOperationsInput | string | null
    businessEntityId?: StringFieldUpdateOperationsInput | string
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleUpdateWithoutFleetInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plate?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    vin?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleUncheckedUpdateWithoutFleetInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plate?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    vin?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleUncheckedUpdateManyWithoutFleetInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plate?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    vin?: NullableStringFieldUpdateOperationsInput | string | null
    operatingUnitId?: StringFieldUpdateOperationsInput | string
    businessEntityId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalWalletEntryCreateManyWalletInput = {
    id?: string
    type: string
    amountMinorUnits: number
    currency: string
    referenceId?: string | null
    referenceType?: string | null
    description?: string | null
    createdAt?: Date | string
  }

  export type OperationalWalletEntryUpdateWithoutWalletInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalWalletEntryUncheckedUpdateWithoutWalletInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalWalletEntryUncheckedUpdateManyWithoutWalletInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amountMinorUnits?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthOtpCreateManyUserInput = {
    id?: string
    identifier: string
    purpose: string
    codeHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasswordResetTokenCreateManyUserInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthOtpUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    codeHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthOtpUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    codeHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthOtpUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    codeHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TenantCountOutputTypeDefaultArgs instead
     */
    export type TenantCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BusinessEntityCountOutputTypeDefaultArgs instead
     */
    export type BusinessEntityCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BusinessEntityCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OperatingUnitCountOutputTypeDefaultArgs instead
     */
    export type OperatingUnitCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OperatingUnitCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FleetCountOutputTypeDefaultArgs instead
     */
    export type FleetCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FleetCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OperationalWalletCountOutputTypeDefaultArgs instead
     */
    export type OperationalWalletCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OperationalWalletCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TenantDefaultArgs instead
     */
    export type TenantArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BusinessEntityDefaultArgs instead
     */
    export type BusinessEntityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BusinessEntityDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OperatingUnitDefaultArgs instead
     */
    export type OperatingUnitArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OperatingUnitDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FleetDefaultArgs instead
     */
    export type FleetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FleetDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DriverDefaultArgs instead
     */
    export type DriverArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DriverDefaultArgs<ExtArgs>
    /**
     * @deprecated Use VehicleDefaultArgs instead
     */
    export type VehicleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = VehicleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssignmentDefaultArgs instead
     */
    export type AssignmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssignmentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RemittanceDefaultArgs instead
     */
    export type RemittanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RemittanceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OperationalWalletDefaultArgs instead
     */
    export type OperationalWalletArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OperationalWalletDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OperationalWalletEntryDefaultArgs instead
     */
    export type OperationalWalletEntryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OperationalWalletEntryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AuthOtpDefaultArgs instead
     */
    export type AuthOtpArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AuthOtpDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PasswordResetTokenDefaultArgs instead
     */
    export type PasswordResetTokenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PasswordResetTokenDefaultArgs<ExtArgs>

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