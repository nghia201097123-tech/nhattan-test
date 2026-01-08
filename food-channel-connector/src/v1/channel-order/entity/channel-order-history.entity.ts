export class ChannelOrderHistory {

  order_id: string = '';

  status_string: string = '';

  order_status: number = 0 ;

  constructor(entity?: any , channelOrderFood? : number ) {
    if(channelOrderFood == 1){
        this.order_id = entity?.order_id ?? '' ;
        this.order_status = entity?.order_status ?? 0 ;
        this.status_string = '';
    }
    if(channelOrderFood == 2){
      this.order_id = entity?.order_id ?? '' ;
      this.order_status = 0;
      this.status_string = entity?.status_string ?? '' ;
    }
    if(channelOrderFood == 4){
      this.order_id = entity?.order_id ?? '' ;
      this.order_status = entity?.order_status ?? 0 ;
      this.status_string = '';
    }

  }

  public mapToList(data: any[] , channelOrderFood : number) {
    let response: ChannelOrderHistory[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderHistory(e,channelOrderFood));
    });
    return response;
  }
}
