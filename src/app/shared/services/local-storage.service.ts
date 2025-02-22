import { Injectable } from '@angular/core';
import { IStorageService } from '../interfaces/storage.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements IStorageService {
  getItems<T>(key: string): T[] {
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  }

  setItems<T>(key: string, items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
  }
}
