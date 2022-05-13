/**  */
import {BaobabOptions} from './baobab';

/**
 * This class only exists to group methods that are common to the Baobab and
 * Cursor classes. Since `Baobab.root` is a property while `Cursor#root` is a
 * method, Baobab cannot extend Cursor.
 */
export abstract class SCommonBaobabMethods<T>  {
  clone(): T;
  deepClone(): T;

  //TODO?: problematic overload? https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#use-union-types
  apply(getNew: (state: T) => T): T;
  apply<K extends keyof T>(key: K, getNew: (state: T[K]) => T[K]): T[K];

  get(): T;
  get<K extends keyof T>(key: K): T[K];

  merge(value: Partial<T>): T;
  merge<K extends keyof T>(path: K, value: Partial<T[K]>): T[K];

  release(): void;

  set(value: T): T;
  set<K extends keyof T>(key: K, value: T[K]): T[K];

  exists(): boolean;
}

type Listener<T> = (e: {
  data: {
    currentData: T;
    previousData: T;
  };
  target: SCursor<unknown>;
}) => void;

export class SCursor<T> extends SCommonBaobabMethods<T> {
  constructor(tree: any, path: any, hash: string);
  path?: any;
  solvedPath?: any;
  state: {
    killed: boolean;
    recording: boolean;
    undoing: boolean;
  };

  // Predicates:
  isLeaf(): boolean;
  isRoot(): boolean;
  isBranch(): boolean;

  // History:
  hasHistory(): boolean;
  getHistory(): any[];
  clearHistory(): this;
  startRecording(maxRecords?: number): this;
  stopRecording(): this;
  undo(steps?: number): this;

  // Others:
  toJSON(): string;
  toString(): string;

  on(_: 'update', handler: Listener<T>): this;
  once(_: 'update', handler: Listener<T>): this;
  off(_: 'update', handler: Listener<T>): this;
  listeners(_: 'update'): Listener<T>[];
  unbindAll(): this;

  // once
  // unbindAll
  // off
  select<K extends keyof T>(key: K): SCursor<T[K]>;
}

type WriteEvent = {data: {path: (string | number)[];};};
type InvalidEvent = {data: {error: unknown;};};
type GetEvent = {data: {path: unknown, solvedPath: (string | number)[], data: unknown;};};
type SelectEvent = {data: {path: unknown, cursor: unknown;};};
type UpdateEvent<T> = {data: {currentData: T, previousData: T; transaction: unknown; paths: unknown;};};
/** Stricter and more informative types for Baobab. Otherwise identical. */
export class SBaobab<T> extends SCommonBaobabMethods<T> {
  constructor(initialState?: T, options?: Partial<BaobabOptions>);
  debugType: T;

  root: SCursor<T>;
  options: BaobabOptions;

  commit(): this;

  unbindAll(): this;
  listeners(): ((...args: unknown[]) => unknown)[];

  on(name: 'write', handler: (e: WriteEvent) => void): this;
  on(name: 'invalid', handler: (e: InvalidEvent) => void): this;
  on(name: 'get', handler: (e: GetEvent) => void): this;
  on(name: 'select', handler: (e: SelectEvent) => void): this;
  on(name: 'update', handler: (e: UpdateEvent<T>) => void): this;

  off(name: 'write', handler: (e: WriteEvent) => void): this;
  off(name: 'invalid', handler: (e: InvalidEvent) => void): this;
  off(name: 'get', handler: (e: GetEvent) => void): this;
  off(name: 'select', handler: (e: SelectEvent) => void): this;
  off(name: 'update', handler: (e: UpdateEvent<T>) => void): this;

  once(name: 'write', handler: (e: WriteEvent) => void): this;
  once(name: 'invalid', handler: (e: InvalidEvent) => void): this;
  once(name: 'get', handler: (e: GetEvent) => void): this;
  once(name: 'select', handler: (e: SelectEvent) => void): this;
  once(name: 'update', handler: (e: UpdateEvent<T>) => void): this;

  select(): SCursor<T>;
  select<K extends keyof T>(key: K): SCursor<T[K]>;

}

type EmitterMethods =
  | 'on'
  | 'once'
  | 'unbindAll'
  | 'off'
  | 'listeners';

type ROMethods =
  | 'clone'
  | 'deepClone'
  | 'exists'
  | 'get';


export type ROBaobab<T> = Pick<SBaobab<T>, EmitterMethods | ROMethods | 'options'> & {
  select(): ROCursor<T>;
  select<K extends keyof T>(key: K): ROCursor<T[K]>;
};

export type ROCursor<T> = Pick<SCursor<T>, EmitterMethods | ROMethods> & {
  select<K extends keyof T>(key: K): ROCursor<T[K]>;
};
