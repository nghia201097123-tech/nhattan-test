export interface StoreProcedureOutputResultInterface<T, Y> {
  total_record: number;
  list: T[];
  output: Y;
}
