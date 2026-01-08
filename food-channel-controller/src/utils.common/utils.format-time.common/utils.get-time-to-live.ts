import { type } from "os";
import { ReportTypeEnum } from "../utils.enum/utils.report-type.enum";

export class getTimeToLive {
    report_type: ReportTypeEnum;
    secondsInMinute: number = 60;
    secondsInOneHour: number = this.secondsInMinute * 60;
    secondsInOneDay: number = this.secondsInOneHour * 24;
    timeNow: Date;

    constructor(
        report_type: ReportTypeEnum
    ) {
        this.timeNow = new Date();
        this.report_type = report_type;
    }

    calculateRemainSecondsOfMinute(time: Date): number {
        let remain: number = (60 - time.getSeconds());
        return remain;
    }

    calculateRemainMinuteOfHour(time: Date): number {
        let remain: number = (60 - time.getMinutes()) * 60 + this.calculateRemainSecondsOfMinute(time);
        return remain;
    }

    /*
        Lấy số giờ còn lại của ngày:
        VD: Giờ hiện tại là 10h và không lấy giờ hiện tại vì theo công thức (24 - time.getHours() - 1) * 60
        để tính thời gian trong 1 giờ. Nên đã qua 10h nên ta trừ thêm 1 ở trong công thức
     */
    calculateRemainHourOfDay(time: Date) {
        let remain = (24 - time.getHours() - 1) * 60 * 60 + this.calculateRemainMinuteOfHour(time);
        return remain;
    }

    calculateRemainDayOfWeek(time: Date) {
        let currentDay: number = time.getDay(); // hàm trả về ngày trong tuần (0-6), với chủ nhật là 0, thứ 2 là 1, thứ 3 là 2 ,...
        let remain: number = 0;
        if (currentDay == 0) {
            remain = this.calculateRemainHourOfDay(time);
        } else {
            remain = (7 - currentDay) * 24 * 60 * 60 + this.calculateRemainHourOfDay(time);
        }
        return remain;
    }

    calculateRemainDayOfMonth(time: Date) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentMonth, 1);

        firstDayOfMonth.setMonth(currentMonth + 1);
        firstDayOfMonth.setDate(0);

        const lastDayOfMonth = firstDayOfMonth.getDate();
        let remain = (lastDayOfMonth - time.getDate()) * 24 * 60 * 60 + this.calculateRemainHourOfDay(time);
        return remain;
    }

    calculateRemainDayOfYear(time: Date) {
        const currentDate: any = new Date();
        const currentYear = currentDate.getFullYear();
        const firstDayOfNextYear: any = new Date(currentYear + 1, 0, 1);
        const millisecondsPerDay = 24 * 60 * 60 * 1000;

        let numberOfDays: any = Math.floor((firstDayOfNextYear - currentDate) / millisecondsPerDay);
        let timeToyear = numberOfDays * 24 * 60 * 60 + this.calculateRemainHourOfDay(time);
        return timeToyear;
    }

    public calculateTheNumberOfSeconds(): number {
        let remain: number = 0;
        switch (+this.report_type) {
            case ReportTypeEnum.HOUR:
            case ReportTypeEnum.OPTION_HOUR:
            case ReportTypeEnum.DATE_TIME:
                remain = this.calculateRemainMinuteOfHour(this.timeNow);
                return remain;

            case ReportTypeEnum.DAY:
            case ReportTypeEnum.YESTERDAY:
            case ReportTypeEnum.OPTION_DAY:
            case ReportTypeEnum.ALL_YEAR:
                remain = this.calculateRemainHourOfDay(this.timeNow);
                return remain;

            case ReportTypeEnum.WEEK:
            case ReportTypeEnum.OPTION_WEEK:
                remain = this.calculateRemainDayOfWeek(this.timeNow);
                return remain;

            case ReportTypeEnum.MONTH:
            case ReportTypeEnum.NEAREST_THREE_MONTHS:
            case ReportTypeEnum.ALL_MONTHS:
            case ReportTypeEnum.LAST_MONTH:
            case ReportTypeEnum.OPTION_MONTH:
                remain = this.calculateRemainDayOfMonth(this.timeNow);
                return remain;

            case ReportTypeEnum.YEAR:
            case ReportTypeEnum.THREE_YEARS:
            case ReportTypeEnum.LAST_YEAR:
            case ReportTypeEnum.OPTION_YEAR:
                remain = this.calculateRemainDayOfYear(this.timeNow);
                return remain;

            default:
                remain = this.calculateRemainDayOfYear(this.timeNow);
                return remain;
        }
    }
}