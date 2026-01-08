import { ReportTypeEnum } from "../utils.enum.common/utils.report-type.enum";

export class UtilsBaseExceptionLangValidator {
  static exceptionStringRestaurantBrand() {
    return `Id thương hiệu, Nếu truyền -1 là lấy hết ngược lại sẽ lấy theo kết quả người dùng.`;
  }

  static exceptionStringRestaurant() {
    return `Id nhà hàng, Nếu truyền -1 là lấy hết ngược lại sẽ lấy theo kết quả người dùng.`;
  }

  static exceptionStringBranch() {
    return `Id chi nhánh, Nếu truyền -1 là lấy hết ngược lại sẽ lấy theo kết quả người dùng.`;
  }

  static exceptionArea() {
    return `Id khu vực, truyền -1 để lấy tất cả`;
  }

  static exceptionEmployee() {
    return `Id nhân viên, truyền -1 để lấy tất cả`;
  }

  static exceptionCustomer() {
    return `Id khách hàng, truyền -1 để lấy tất cả `;
  }

  static exceptionListBranch() {
    return `Id chi nhánh, Nếu truyền [] là lấy hết ngược lại sẽ lấy theo kết quả người dùng.`;
  }
  static exceptionStringSupplierMaterial() {
    return `Id nguyên liệu nhà cung cấp, Nếu truyền -1 là lấy hết ngược lại sẽ lấy theo kết quả người dùng.`;
  }
  static exceptionStringDate() {
    return `Thời gian lấy theo định dạng report_type, ngược lại sẽ lấy theo kết quả người dùng.
    \n . Các định dạng: lấy theo ngày: dd/mm/YYYY, 
    \n . Các định dạng: lấy theo tuần: ww/YYYY, 
    \n . Các định dạng: lấy theo tháng: mm/YYYY, 
    \n . Các định dạng: lấy theo năm: YYYY
  `;
  }

  static exceptionStringYear() {
    return `Năm muốn lấy, nếu không truyền sẽ lấy năm hiện tại.

  `;
  }

  static exceptionStringFromDate() {
    return `Thời gian bắt đầu, Nếu truyền rỗng('') là lấy hết, ngược lại sẽ lấy theo kết quả người dùng.
    \n . Các định dạng: lấy theo ngày: dd/mm/YYYY, 
    \n . Các định dạng: lấy theo ngày: ww/YYYY, 
    \n . Các định dạng: lấy theo tháng: mm/YYYY, 
    \n . Các định dạng: lấy theo năm: YYYY
  `;
  }

  static exceptionStringToDate() {
    return `Thời gian kết thúc, Nếu truyền rỗng('') là lấy hết, ngược lại sẽ lấy theo kết quả người dùng.
    \n . Các định dạng: lấy theo ngày: dd/mm/YYYY, 
    \n . Các định dạng: lấy theo ngày: ww/YYYY, 
    \n . Các định dạng: lấy theo tháng: mm/YYYY, 
    \n . Các định dạng: lấy theo năm: YYYY
      `;
  }

  static exceptionStringKeySearch() {
    return `Tiềm kiếm, Nếu truyền rỗng("") thì sẽ lấy hết ngược lại sẽ lấy theo giá trị người dùng truyền vào!`;
  }

  static exceptionStringGroupByTypeSupplier() {
    return `.Type để lấy định dạng 
  \n . Type = 1  group theo giờ trong ngày , 
  \n . Type = 2 group theo ngày , 
  \n . Type = 3 group theo tuần ,
  \n . Type = 4 group theo tháng,
  \n . Type = 5 group theo năm,
  
  -- Quy ước các ngày trong tuần của MSQL
      -- Thứ 2: 0
      -- Thứ 3: 1
      -- Thứ 4: 2
      -- Thứ 5: 3
      -- Thứ 6: 4
      -- Thứ 7: 5
      -- CN: 6
`;
  }

  static exceptionStringReportType() {
    return `Loại báo cáo , sẽ trả về các kiểu báo cáo theo yêu cầu của người dùng 
    \n . 0 : lấy theo thời gian (giờ) hiện tại , 
    \n . 1 : lấy theo ngày hiện tại , 
    \n . 2 : lấy theo tuần hiện tại, 
    \n . 3 : lấy theo tháng hiện tại, 
    \n . 4 : lấy theo 3 tháng gần nhất , 
    \n . 5 : lấy theo năm hiện tại , 
    \n . 6 : lấy theo 3 năm gần nhất , 
    \n . 7 : lấy tất cả các tháng , 
    \n . 8 : lấy tất cả các năm  , 
    \n . 9 : lấy theo ngày hôm qua , 
    \n . 10 : lấy theo tháng trước , 
    \n . 11 : lấy theo năm trước ,
    \n . 12 : lấy theo tuỳ chọn theo giờ,
    \n . 13 : lấy theo tuỳ chọn theo ngày,
    \n . 14 : lấy theo tuỳ chọn theo tuần,
    \n . 15 : lấy theo tuỳ chọn theo tháng,
    \n . 16 : lấy theo tuỳ chọn theo năm`;
  }

  static exceptionStringLimit() {
    return `Giới hạn phần tử lấy lên, Mặc định sẽ lấy 20 phần tử nếu người dùng không truyền vào.`;
  }

  static exceptionStringPage() {
    return `Phân trang người dùng, mặc định sẽ lấy trang đầu tiên nếu người dùng không truyền vào.`;
  }
  static exceptionStringReportTypeWithSelect(value: number[]): string {
    let stringMessage = ``;

    if (value.length > 0) {
      value.forEach((element) => {
        if (ReportTypeEnum.DEFAULT === element) {
          stringMessage += `\n report_type: ${element} lấy tất cả `;
        }

        if (ReportTypeEnum.HOUR === element) {
          stringMessage += `,report_type: ${element} lấy theo giờ  `;
        }

        if (ReportTypeEnum.DAY === element) {
          stringMessage += `,report_type: ${element} lấy theo ngày  `;
        }

        if (ReportTypeEnum.WEEK === element) {
          stringMessage += `,report_type: ${element} lấy theo tuần hiện tại `;
        }

        if (ReportTypeEnum.MONTH === element) {
          stringMessage += `,report_type: ${element} lấy theo tháng hiện tại `;
        }

        if (ReportTypeEnum.NEAREST_THREE_MONTHS === element) {
          stringMessage += `,report_type: ${element} lấy theo 3 tháng gần nhất tính cả tháng hiện tại `;
        }

        if (ReportTypeEnum.YEAR === element) {
          stringMessage += `,report_type: ${element} lấy năm hiện tại  `;
        }

        if (ReportTypeEnum.THREE_YEARS === element) {
          stringMessage += `,report_type: ${element} lấy theo 3 năm gần nhất tính cả năm hiện tại `;
        }

        if (ReportTypeEnum.ALL_MONTHS === element) {
          stringMessage += `,report_type: ${element} lấy tất cả các tháng `;
        }

        if (ReportTypeEnum.ALL_YEAR === element) {
          stringMessage += `,report_type: ${element} lấy tất cả các năm `;
        }

        if (ReportTypeEnum.YESTERDAY === element) {
          stringMessage += `,report_type: ${element} lấy ngày hôm qua `;
        }

        if (ReportTypeEnum.LAST_MONTH === element) {
          stringMessage += `,report_type: ${element} lấy tháng trước `;
        }

        if (ReportTypeEnum.LAST_YEAR === element) {
          stringMessage += `,report_type: ${element} lấy năm trước `;
        }




        if (ReportTypeEnum.OPTION_HOUR === element) {
          stringMessage += `,report_type: ${element} lấy theo tuỳ chọn giờ`;
        }

        if (ReportTypeEnum.OPTION_DAY === element) {
          stringMessage += `,report_type: ${element} lấy theo tuỳ chọn ngày `;
        }

        if (ReportTypeEnum.OPTION_WEEK === element) {
          stringMessage += `,report_type: ${element} lấy theo tuỳ chọn tuần `;
        }

        if (ReportTypeEnum.OPTION_MONTH === element) {
          stringMessage += `,report_type: ${element} lấy theo tuỳ chọn tháng `;
        }

        if (ReportTypeEnum.OPTION_YEAR === element) {
          stringMessage += `,report_type: ${element} lấy theo tuỳ chọn năm `;
        }
      });
    }
    return stringMessage;
  }

  // BranchInnerInventory
  static exceptionBranchInnerInventoryType() {
    return `Loại kiểm kê, Nếu truyền -1 là lấy hết ngược lại sẽ lấy theo kết quả người dùng`;
  }

  static exceptionFromBranchInventoryReport() {
    return `Kiểm kê từ, Nếu truyền -1 là lấy hết ngược lại sẽ lấy theo kết quả người dùng`;
  }

  static exceptionToBranchInventoryReport() {
    return `Kiểm kê đến, Nếu truyền -1 là lấy hết ngược lại sẽ lấy theo kết quả người dùng`;
  }

  static exceptionBranchInventoryReportId() {
    return `Id của phiếu kiểm kê kho nội bộ`;
  }

  static exceptionBranchInventoryReportCode() {
    return `Code của phiếu kiểm kê kho nội bộ`;
  }

  static exceptionBranchInventoryReportName() {
    return `Tên của phiếu kiểm kê kho nội bộ`;
  }

  static exceptionBranchInventoryReportPrefix() {
    return `Prefix của phiếu kiểm kê kho nội bộ`;
  }

  static exceptionBranchInventoryReportPrice() {
    return `Giá nguyên liệu của phiếu kiểm kê kho nội bộ`;
  }

  static exceptionBranchInventoryReportNormalizeName() {
    return `normalize_name của phiếu kiểm kê kho nội bộ`;
  }

  static exceptionBranchInventoryReportMaterialCategoryId() {
    return `Id danh mục nguyên liệu của phiếu kiểm kê kho nội bộ`;
  }

  static exceptionBranchInventoryReportMaterialCategoryName() {
    return `Tên danh mục nguyên liệu của phiếu kiểm kê kho nội bộ`;
  }

  static exceptionStatus() {
    return `Trạng thái truyền truyền -1 sẽ lấy tất cả, truyền 0 sẽ tìm theo trạng thái đóng, 1 là trạng thái mở `;
  }

  static exceptionProductWarehouseLocationId() {
    return `Id kho sản phẩm, truyền -1 sẽ lấy tất cả, truyền id kho sẽ tìm theo id kho`;
  }

  static exceptionProductId() {
    return `Id sản phẩm, truyền -1 sẽ lấy tất cả, truyền id sẽ tìm theo id sản phẩm`;
  }

  static exceptionTechresSalerId() {
    return `Id nhân viên saler, truyền -1 sẽ lấy tất cả, truyền id sẽ tìm theo id nhân viên saler`;
  }

  static exceptionSupplierCancelReturnType() {
    return `Loại muốn lọc, nhập 1 để lấy dữ liệu trả, 2 để lấy dữ liệu hủy`;
  }

  static exceptionSupplierId() {
    return `Id nhà cung cấp, Nếu truyền -1 là lấy hết ngược lại sẽ lấy theo kết quả người dùng.`;
  }

  static exceptionCategoryId() {
    return `Id danh mục, Nếu truyền -1 là lấy hết ngược lại sẽ lấy theo kết quả người dùng.`;
  }


  // BranchInnerInventory
}
