export * from './API';
export type Result<T> = Omit<T, '__typename'>;
