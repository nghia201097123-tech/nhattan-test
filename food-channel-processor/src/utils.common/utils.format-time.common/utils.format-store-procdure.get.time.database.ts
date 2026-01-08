import { HttpException, HttpStatus } from "@nestjs/common";
import * as moment from "moment";
import { GroupByEnum } from "../utils.enum/utils.group-by-time.enum";
import { ReportTypeEnum } from "../utils.enum/utils.report-type.enum";
import { ExceptionResponseDetail } from "../utils.exception.common/utils.exception.common";
import { GetReportTimeDatabase } from "./utils.get.time.database";

export class StoreProcedureGetReportTimeDatabase {
  public report_type: ReportTypeEnum;
  public date_time: string = "";
  public from_date: string = "";
  public to_date: string = "";

  constructor(
    report_type: ReportTypeEnum,
    date_time: string,
    from_date: string,
    to_date: string
  ) {
    this.report_type = report_type;
    this.date_time = date_time ? date_time : "";
    this.from_date = from_date ? from_date : "";
    this.to_date = to_date ? to_date : "";
  }

  /**
   *
   * @returns
   */
  public getReportTimeDatabase(): GetReportTimeDatabase {
    let reportTypes: number[] = [
      ReportTypeEnum.DEFAULT,
      ReportTypeEnum.HOUR,
      ReportTypeEnum.DAY,
      ReportTypeEnum.WEEK,
      ReportTypeEnum.MONTH,
      ReportTypeEnum.NEAREST_THREE_MONTHS,
      ReportTypeEnum.YEAR,
      ReportTypeEnum.THREE_YEARS,
      ReportTypeEnum.ALL_MONTHS,
      ReportTypeEnum.ALL_YEAR,
      ReportTypeEnum.YESTERDAY,
      ReportTypeEnum.LAST_MONTH,
      ReportTypeEnum.LAST_YEAR,
      ReportTypeEnum.DATE_TIME,
    ];

    // chổ này để xử lí tuỳ chọn thời gian
    let reportTypeOption: number[] = [
      ReportTypeEnum.OPTION_HOUR,
      ReportTypeEnum.OPTION_DAY,
      ReportTypeEnum.OPTION_WEEK,
      ReportTypeEnum.OPTION_MONTH,
      ReportTypeEnum.OPTION_YEAR,
    ];

    let fromDate = "";
    let toDate = "";
    let groupType = GroupByEnum.GROUP_DAY;

    /**
     *
     * Kiểm tra trường hợp nếu [date_time] Khác rỗng thì phải kiểm tra report_type phải bắt buột nằm trong EMUM ReportTypeEnum
     *
     * Nếu [date_time] Thuộc [ReportTypeEnum.HOUR, ReportTypeEnum.DAY] -> Định dang thời gian sẽ là DD/MM/YYYY
     * Nếu [date_time] Thuộc [ReportTypeEnum.WEEK] -> Định dang thời gian sẽ là WW/YYYY
     * Nếu [date_time] Thuộc [ReportTypeEnum.MONTH, ReportTypeEnum.NEAREST_THREE_MONTHS, ReportTypeEnum.LAST_MONTH] -> Định dang thời gian sẽ là MM/YYYY
     * Nếu [date_time] Thuộc [ReportTypeEnum.YEAR, ReportTypeEnum.THREE_YEARS, ReportTypeEnum.LAST_YEAR] -> Định dang thời gian sẽ là YYYY
     *
     *
     *
     */

    if (this.date_time !== "" || this.date_time.length > 0) {
      if (!reportTypes.includes(+this.report_type)) {
        throw new HttpException(
          new ExceptionResponseDetail(
            HttpStatus.BAD_REQUEST,
            `report_type bạn truyền phải thuộc các trạng thái sau: ${reportTypes}`
          ),
          HttpStatus.OK
        );
      }
    } else if (this.from_date !== "" && this.to_date !== "") {
      if (!reportTypeOption.includes(+this.report_type)) {
        throw new HttpException(
          new ExceptionResponseDetail(
            HttpStatus.BAD_REQUEST,
            `report_type bạn truyền phải thuộc các trạng thái sau: ${reportTypeOption}`
          ),
          HttpStatus.OK
        );
      }
    }

    /**
     *
     * Kiểm tra xem định dạng thời gian có thuộc các format được cho phép hay không?
     *
     */

    switch (+this.report_type) {
      case ReportTypeEnum.HOUR:
        if (!moment(this.date_time, "DD/MM/YYYY", true).isValid()) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian date_string truyền sai định dạng DD/MM/YYYY!"
            ),
            HttpStatus.OK
          );
        }

        fromDate = moment(this.date_time, "DD/MM/YYYY").format("YYYY-MM-DD");
        toDate = moment(this.date_time, "DD/MM/YYYY")
          .add(1, "day")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_HOUR;
        break;

      case ReportTypeEnum.DAY:
        if (!moment(this.date_time, "DD/MM/YYYY", true).isValid()) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian date_string truyền sai định dạng DD/MM/YYYY!"
            ),
            HttpStatus.OK
          );
        }
        fromDate = moment(this.date_time, "DD/MM/YYYY").format("YYYY-MM-DD");
        toDate = moment(this.date_time, "DD/MM/YYYY")
          .add(1, "day")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_HOUR;
        break;

      case ReportTypeEnum.WEEK:
        if (!moment(this.date_time, "WW/YYYY", true).isValid()) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian date_string truyền sai định dạng WW/YYYY!"
            ),
            HttpStatus.OK
          );
        }

        fromDate = moment(this.date_time, "WW/YYYY")
          .clone()
          .startOf("isoWeek")
          .format("YYYY-MM-DD");
        toDate = moment(this.date_time, "WW/YYYY")
          .clone()
          .endOf("isoWeek")
          .add(1, "days")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_WEEK;
        break;

      case ReportTypeEnum.MONTH:
        if (!moment(this.date_time, "MM/YYYY", true).isValid()) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian date_string truyền sai định dạng MM/YYYY!"
            ),
            HttpStatus.OK
          );
        }

        fromDate = moment(this.date_time, "MM/YYYY")
          .clone()
          .startOf("month")
          .format("YYYY-MM-DD");
        toDate = moment(this.date_time, "MM/YYYY")
          .clone()
          .endOf("month")
          .add(1, "days")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_DAY;
        break;

      case ReportTypeEnum.NEAREST_THREE_MONTHS:
        fromDate = moment(moment().format("MM/YYYY"), "MM/YYYY")
          .clone()
          .startOf("month")
          .subtract(2, "month")
          .format("YYYY-MM-DD");
        toDate = moment(moment().format("MM/YYYY"), "MM/YYYY")
          .clone()
          .endOf("month")
          .add(1, "days")
          .format("YYYY-MM-DD");

        groupType = GroupByEnum.GROUP_DAY;
        break;
      case ReportTypeEnum.YEAR:
        if (!moment(this.date_time, "YYYY", true).isValid()) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian date_string truyền sai định dạng YYYY!"
            ),
            HttpStatus.OK
          );
        }

        fromDate = moment(this.date_time, "YYYY")
          .clone()
          .startOf("year")
          .format("YYYY-MM-DD");
        toDate = moment(this.date_time, "YYYY")
          .clone()
          .endOf("year")
          .add(1, "days")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_MONTH;
        break;

      case ReportTypeEnum.THREE_YEARS:
        fromDate = moment(moment().format("YYYY"))
          .clone()
          .startOf("year")
          .subtract(2, "year")
          .format("YYYY-MM-DD");
        toDate = moment(moment().format("YYYY"))
          .clone()
          .endOf("year")
          .add(1, "days")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_MONTH;
        break;

      case ReportTypeEnum.ALL_MONTHS:
        groupType = GroupByEnum.GROUP_MONTH;
        break;

      case ReportTypeEnum.ALL_YEAR:
        groupType = GroupByEnum.GROUP_YEAR;
        break;

      case ReportTypeEnum.YESTERDAY:
        fromDate = moment()
          .subtract(1, "day")
          .format("YYYY-MM-DD");
        toDate = moment().format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_HOUR;
        break;

      case ReportTypeEnum.LAST_MONTH:
        fromDate = moment()
          .startOf("month")
          .subtract(1, "month")
          .format("YYYY-MM-DD");
        toDate = moment()
          .subtract(1, "month")
          .endOf("month")
          .add(1, "day")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_DAY;
        break;

      case ReportTypeEnum.LAST_YEAR:
        fromDate = moment(moment().format("YYYY"))
          .clone()
          .startOf("year")
          .subtract(1, "year")
          .format("YYYY-MM-DD");
        toDate = moment(moment().format("YYYY"))
          .clone()
          .endOf("year")
          .subtract(1, "year")
          .add(1, "days")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_MONTH;

        break;
    }

    /**
     *
     * Xử lý tiếp trường hợp người dùng truyền thời gian tuỳ chọn lên khi truyền thời gian tuỳ chọn bắt buộc phải thuộc các OPTION SAU:
     *
     * Nếu report_type = ReportTypeEnum.OPTION_HOUR, ReportTypeEnum.OPTION_DAY thì from_date và to_date phải thuộc định dạng [DD/MM/YYYY] và date_time = ""
     * Nếu report_type = ReportTypeEnum.OPTION_MONTH, ReportTypeEnum.OPTION_DAY thì from_date và to_date phải thuộc định dạng [MM/YYYY] và date_time = ""
     * Nếu report_type = ReportTypeEnum.OPTION_YEAR, ReportTypeEnum.OPTION_DAY thì from_date và to_date phải thuộc định dạng [YYYY] và date_time = ""
     *
     */

    switch (+this.report_type) {
      case ReportTypeEnum.OPTION_HOUR:
        if (
          !moment(this.from_date, "DD/MM/YYYY", true).isValid() ||
          !moment(this.to_date, "DD/MM/YYYY", true).isValid()
        ) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian from_date, to_date truyền sai định dạng DD/MM/YYYY!"
            ),
            HttpStatus.OK
          );
        }

        fromDate = moment(this.from_date, "DD/MM/YYYY").format("YYYY-MM-DD");
        toDate = moment(this.to_date, "DD/MM/YYYY")
          .add(1, "day")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_HOUR;
        break;

      case ReportTypeEnum.OPTION_DAY:
        if (
          !moment(this.from_date, "DD/MM/YYYY", true).isValid() ||
          !moment(this.to_date, "DD/MM/YYYY", true).isValid()
        ) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian from_date, to_date truyền sai định dạng DD/MM/YYYY!"
            ),
            HttpStatus.OK
          );
        }

        fromDate = moment(this.from_date, "DD/MM/YYYY").format("YYYY-MM-DD");
        toDate = moment(this.to_date, "DD/MM/YYYY")
          .add(1, "day")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_DAY;
        break;

      case ReportTypeEnum.OPTION_WEEK:
        if (
          !moment(this.from_date, "WW/YYYY", true).isValid() ||
          !moment(this.to_date, "WW/YYYY", true).isValid()
        ) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian from_date, to_date truyền sai định dạng WW/YYYY!"
            ),
            HttpStatus.OK
          );
        }

        fromDate = moment(this.from_date, "WW/YYYY")
          .clone()
          .startOf("isoWeek")
          .format("YYYY-MM-DD");
        toDate = moment(this.to_date, "WW/YYYY")
          .clone()
          .endOf("isoWeek")
          .add(1, "days")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_WEEK;
        break;

      case ReportTypeEnum.OPTION_MONTH:
        if (
          !moment(this.from_date, "MM/YYYY", true).isValid() ||
          !moment(this.to_date, "MM/YYYY", true).isValid()
        ) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian from_date, to_date truyền sai định dạng MM/YYYY!"
            ),
            HttpStatus.OK
          );
        }

        fromDate = moment(this.from_date, "MM/YYYY")
          .clone()
          .startOf("month")
          .format("YYYY-MM-DD");

        toDate = moment(this.to_date, "MM/YYYY")
          .clone()
          .endOf("month")
          .add(1, "days")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_MONTH;
        break;

      case ReportTypeEnum.OPTION_YEAR:
        if (
          !moment(this.from_date, "YYYY", true).isValid() ||
          !moment(this.to_date, "YYYY", true).isValid()
        ) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian from_date, to_date truyền sai định dạng YYYY!"
            ),
            HttpStatus.OK
          );

        }


        fromDate = moment(this.from_date, "YYYY")
          .clone()
          .startOf("year")
          .format("YYYY-MM-DD");
        toDate = moment(this.to_date, "YYYY")
          .clone()
          .endOf("year")
         // .add(1, "days")
          .format("YYYY-MM-DD");
        groupType = GroupByEnum.GROUP_YEAR;
        break;
      case ReportTypeEnum.DATE_TIME:
        if (!moment(this.date_time, "DD/MM/YYYY H:m:s", true).isValid()) {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Thời gian date_string truyền sai định dạng DD/MM/YYYY H:m:s !"
            ),
            HttpStatus.OK
          );
        }

        fromDate = moment(this.date_time, "DD/MM/YYYY H:m:s").format("YYYY/MM/DD HH:mm:ss");
        toDate = moment(this.date_time, "DD/MM/YYYY H:m:s")
          .clone()
          .add(59, "minute")
          .add(59, "second")
          .format("YYYY/MM/DD HH:mm:ss");

        groupType = GroupByEnum.GROUP_DATE_TIME;
        break;
    }
    return new GetReportTimeDatabase(fromDate, toDate, groupType);
  }
}
