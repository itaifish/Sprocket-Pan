export type KeyValueValues = string | string[] | (string | string[]);

export type KeyValuePair<T extends KeyValueValues = string> = { key: string; value?: T };
