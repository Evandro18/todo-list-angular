export interface IStorageService {
  getItems<T>(key: string): T[];
  setItems<T>(key: string, items: T[]): void;
}
