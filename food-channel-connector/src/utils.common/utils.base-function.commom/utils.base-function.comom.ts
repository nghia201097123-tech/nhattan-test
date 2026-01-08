import { RedisService } from "src/v1/redis/redis.service";

export class UtilsBaseFunction {

    static createXSapRi(): string {
        const prefix = "1".repeat(24);
        const randomPart = Array.from({ length: 24 }, () =>
          Math.floor(Math.random() * 10).toString()
        ).join("");
        return prefix + randomPart;
    }

   
    static async getHeaderShoppeg(): Promise<string> {

      try {
        
     

      const redisService = new RedisService();
      const redisKey = 'shopeefood:header';
      
      // Kiểm tra xem có giá trị trong redis không
      const cachedValue = await redisService.getKey(redisKey);      
      
      if (cachedValue) {
        return cachedValue;
      }
     
      const newValue = JSON.stringify({
        "user-agent": "language=vi app_type=29",
        "x-foody-app-type": "1024",
        "Content-Type": "application/json"
      })
      // ;
      // Lưu vào redis với TTL 3600 giây (1 giờ)
      await redisService.setKey(redisKey, newValue);

      return newValue;
    } catch (error) {
        console.log(error);
        
    }
  }

}