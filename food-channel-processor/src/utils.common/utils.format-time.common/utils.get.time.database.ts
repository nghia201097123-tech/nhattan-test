export class GetReportTimeDatabase {

  from_date: string;

  to_date: string;

  group_type: number;

  constructor(from_date?: string, to_date?: string, group_type?: number) {
    this.from_date = from_date;
    this.to_date = to_date;
    this.group_type = group_type;
  }
}
