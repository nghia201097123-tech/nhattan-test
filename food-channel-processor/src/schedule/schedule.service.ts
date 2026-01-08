import { Injectable } from '@nestjs/common';
import { Cron, CronExpression} from '@nestjs/schedule';
import { SyncChannelOrdersService } from 'src/v1/sync-channel-order/sync-channel-orders.service';

@Injectable()
export class ScheduleService {

    constructor(
        private readonly syncChannelOrdersService: SyncChannelOrdersService,
    ) {}
    
        
    // @Cron(`0 ${process.env.CONFIG_CRON_HOUR_TO_SYNC_CHANNEL_ORDER} * * *`)
    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        await this.syncChannelOrdersService.spUSyncChannelOrderToData();

        console.log('Đã xoá dữ liệu cũ vào lúc',new Date());
        
    }
}
