import { Injectable } from "@nestjs/common";

@Injectable()
export class BufferCacheService {
  private cache = new Map<string, any>();

  /**
   * Lưu dữ liệu vào cache
   */
  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || 300000, // 5 phút mặc định
    });
  }

  /**
   * Lấy dữ liệu từ cache
   */
  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    // Kiểm tra TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Xóa dữ liệu khỏi cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Kiểm tra key có tồn tại trong cache không
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Kiểm tra TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Xóa tất cả cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Lấy kích thước cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Lấy tất cả keys trong cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}
