export type FieldWithUniqId<T> = T & {
  uniId?: number | string | null;
};
