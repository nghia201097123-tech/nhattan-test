import { HttpStatus } from "@nestjs/common";
import axios from "axios";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { ChannelBranch } from "../channel-order/entity/channel-branch";
import { ChannelOrderFoodTokenEntity } from "../channel-order/entity/channel-order-food-token.entity";
import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";

export default async function processTask(
  channelFoodToken: ChannelOrderFoodTokenEntity
): Promise<any> {
  let channelBranch: ChannelBranch[] = [];

  if (channelFoodToken.channel_order_food_id == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
    let data = await getSHFBranchList(
      channelFoodToken.url_get_branches,
      channelFoodToken.url_get_branch_info,
      channelFoodToken.access_token
    );
    if (data.status != HttpStatus.OK) {
      channelBranch = [];
    } else {
      channelBranch = new ChannelBranch().mapToList(
        data.data,
        channelFoodToken.id,
        channelFoodToken.name
      );
    }
  }

  if (channelFoodToken.channel_order_food_id == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
    let data = await getGRFBranchDetail(
      channelFoodToken.url_get_branches,
      channelFoodToken.access_token
    );

    if (data.status == HttpStatus.UNAUTHORIZED) {
      let access_token_new = await syncTokenGRF(
        channelFoodToken.url_login,
        channelFoodToken.username,
        channelFoodToken.password,
        channelFoodToken.device_id,
        channelFoodToken.device_brand
      );

      data = await getGRFBranchDetail(
        channelFoodToken.url_get_branches,
        access_token_new
      );
    }

    if (data.status != HttpStatus.OK) {
      channelBranch = [];
    } else {

      let result = [
        {
          branch_id: channelFoodToken.username,
          branch_name: data.data.name,
          branch_address: data.data.address,
          branch_phone: formatPhoneNumber(data.data.phone),
          merchant_id: "0",
        },
      ];

      channelBranch = new ChannelBranch().mapToList(
        result,
        channelFoodToken.id,
        channelFoodToken.name
      );
    }
  }

  if (channelFoodToken.channel_order_food_id == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
    let data = await getBEFBranchList(
      channelFoodToken.url_get_branches,
      channelFoodToken.url_get_branch_info,
      channelFoodToken.access_token
    );
    if (data.status == HttpStatus.UNAUTHORIZED) {
      let access_token_new = await syncTokenBEF(
        channelFoodToken.url_login,
        channelFoodToken.username,
        channelFoodToken.password
      );

      data = await getBEFBranchList(
        channelFoodToken.url_get_branches,
        channelFoodToken.url_get_branch_info,
        access_token_new
      );
    }
    if (data.status != HttpStatus.OK) {
      channelBranch = [];
    } else {
      channelBranch = new ChannelBranch().mapToList(
        data.data,
        channelFoodToken.id,
        channelFoodToken.name
      );
    }
  }

  if (channelFoodToken.channel_order_food_id == +ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER) {
    let data = await getCNVLBranchList(
      channelFoodToken.url_get_branches,
      channelFoodToken.access_token
    );

    if (data.status != HttpStatus.OK) {
      channelBranch = [];
    } else {
      channelBranch = new ChannelBranch().mapToList(
        data.data,
        channelFoodToken.id,
        channelFoodToken.name
      );
    }
  }


  return {
    branches: channelBranch,
  };
}

// ------------------ SHF --------------------

function createXSapRi(): string {
  // Tạo chuỗi 24 ký tự '1'
  const phanDau = '1'.repeat(24);

  // Tạo chuỗi 24 ký tự số ngẫu nhiên từ 0 đến 9
  const phanSau = Array.from({ length: 24 }, () => Math.floor(Math.random() * 10).toString()).join('');

  // Kết hợp hai phần lại
  return phanDau + phanSau;
}

async function getSHFBranchList(
  url: string,
  url_get_branch_info: string,
  x_merchant_token: string
): Promise<any> {
  try {
    let headers = {
      "x-merchant-token": x_merchant_token,
    };

    const body = {
      page_size: 999999,
    };

    const data = await axios.post(url, body, { headers });

    if (data.data.error_code == 10007) {
      return new ResponseData(
        HttpStatus.UNAUTHORIZED,
        "Vui lòng cập nhập token cho app SHF",
        []
      );
    } else {

      const allBranches = data.data.data.store_list.map((store) => ({
        merchant_id: "0",
        branch_id: store.store_id,
        branch_name: store.store_name,
        branch_address: '',
        branch_phone: ''
      }));

      // const headers_detail = {
      //   "x-foody-access-token": x_merchant_token,
      //   "x-foody-entity-id": 0,
      //   "x-sap-ri": createXSapRi(),
      //   'user-agent' : ChannelOrderFoodApiEnum.SHF_USER_AGENT,
      //   'x-foody-app-type':"1024",
      // };

      // for (const branch of allBranches) {

      //   headers_detail["x-foody-entity-id"] = +branch.branch_id;

      //   const data = await axios.get(url_get_branch_info, { headers: headers_detail });

      //   branch.branch_address = data.data.data.address + ", " + data.data.data.district_name + ", " + data.data.data.city_name;
      //   branch.branch_phone = formatPhoneNumber(data.data.data?.primary_contact_number ?? "")
      // }

      return new ResponseData(HttpStatus.OK, "SUCCESS", allBranches);
    }
  } catch (error) {

    const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
    const message = error.response?.statusText || "Lỗi rồi getSHFBillNewList";

    return new ResponseData(statusCode, message, []);
  }
}

// ------------------ SHF --------------------

// ------------------ GRF --------------------

async function getGRFBranchDetail(
  url: string,
  access_token: string
): Promise<any> {
  try {
    const headers = {
      "Content-Type": "application/json",
      "x-mts-ssid": access_token,
      "x-user-type": "user-profile",
    };

    const data = await axios.get(url, { headers });

    if (data.status == 200) {
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        name: data.data.data.grab_food_profile.merchant.name,
        address: data.data.data.grab_food_profile.merchant.address,
        phone: data.data.data.grab_food_profile.merchant.contractNumber
      });
    } else {
      return new ResponseData(HttpStatus.OK, "BAD REQUEST", { name: "" });
    }
  } catch (error) {
    const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
    const message = error.response?.statusText || "Lỗi rồi getSHFBillNewList";

    return new ResponseData(statusCode, message, { name: "" });
  }
}

async function loginGRF(
  url: string,
  usernamne: string,
  password: string,
  device_id: string,
  device_brand: string
): Promise<any> {
  try {

    const headers = {
      "Content-Type": "application/json",
      "user-agent": "Grab Merchant/4.126.0 (ios 16.7.10; Build 102734851)",
      "mex-country": "VN",
      "x-currency": "VND"
    }

    const body = {
      login_source: "TROY_APP_MAIN_USERNAME_PASSWORD",
      session_data: {
        mobile_session_data: {
          device_model: "iPhone 13",
          device_id: device_id,
          device_brand: device_brand,
        },
      },
      without_force_logout: true,
      password: password,
      username: usernamne,
    };

    const data = await axios.post(url, JSON.stringify(body), { headers });

    if (data.data.data.code === 200) {
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        device_id: !data.data.data.active_session
          ? device_id
          : !data.data.data.active_session.mobile_session_data
            ? device_id
            : data.data.data.active_session.mobile_session_data.device_id,
        device_brand: !data.data.data.active_session
          ? device_brand
          : !data.data.data.active_session.mobile_session_data
            ? device_brand
            : data.data.data.active_session.mobile_session_data.device_brand,
        jwt: !data.data.data.data ? "" : data.data.data.data.jwt,
      });
    } else {
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        "Vui lòng đăng nhập trên thiết bị di động . rồi hãy thử lại",
        {
          device_id: device_id,
          device_brand: device_brand,
          jwt: "",
        }
      );
    }
  } catch (error) {
    const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
    const message = error.response?.statusText || "Lỗi rồi getSHFBillNewList";

    return new ResponseData(statusCode, message, {
      device_id: device_id,
      device_brand: device_brand,
      jwt: "",
    });
  }
}

async function logoutGRF(
  url: string,
  usernamne: string,
  password: string
): Promise<any> {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const body = {
      login_source: "TROY_APP_MAIN_USERNAME_PASSWORD",
      session_data: {
        mobile_session_data: {
          device_model: "iPhone 13",
          device_id: "",
          device_brand: "",
        },
      },
      without_force_logout: false,
      password: password,
      username: usernamne,
    };

    const data = await axios.post(url, JSON.stringify(body), { headers });

    if (data.data.data.code === 200) {
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        device_id: "",
        device_brand: "",
        jwt: !data.data.data.data ? "" : data.data.data.data.jwt,
      });
    } else {
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        "Vui lòng đăng nhập trên thiết bị di động . rồi hãy thử lại",
        {
          device_id: "",
          device_brand: "",
          jwt: "",
        }
      );
    }
  } catch (error) {
    return new ResponseData(error.response.status, error.response.statusText, {
      device_id: "",
      device_brand: "",
      jwt: "",
    });
  }
}

async function syncTokenGRF(
  url_login: string,
  usernamne: string,
  password: string,
  device_id: string,
  device_brand: string
): Promise<any> {
  let data = await loginGRF(
    url_login,
    usernamne,
    password,
    device_id,
    device_brand
  );

  if (
    data.status == HttpStatus.BAD_REQUEST ||
    data.status == HttpStatus.TOO_MANY_REQUESTS
  ) {
    return "";
  }

  if (data.data.jwt == "" || data.data.jwt == null) {
    await delay(2000);
    data = await loginGRF(
      url_login,
      usernamne,
      password,
      data.data.device_id,
      data.data.device_brand
    );
  }

  if (
    data.status == HttpStatus.BAD_REQUEST ||
    data.status == HttpStatus.TOO_MANY_REQUESTS
  ) {
    return;
  }

  if (data.data.jwt == "" || data.data.jwt == null) {
    await delay(2000);
    data = await logoutGRF(url_login, usernamne, password);

    if (data.status != HttpStatus.OK) {
      return "";
    }
  }

  return data.data.jwt;

  async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
// ------------------ GRF --------------------
// ------------------ BEF --------------------

async function getBEFBranchList(
  url: string,
  url_get_branch_info: string,
  access_token: string
): Promise<any> {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const body = {
      access_token: access_token,
    };

    const data = await axios.post(url, JSON.stringify(body), { headers });

    if (data.data.code == 143) {

      const allBranches = data.data.data.reduce((accumulator, merchant) => {
        const storeProfiles = merchant.store_profiles.map((store) => ({
          merchant_id: merchant.merchant_id,
          branch_id: store.store_id,
          branch_name: store.store_name,
          branch_address: store.address,
          branch_phone: ''
        }));
        return accumulator.concat(storeProfiles);
      }, []);

      const body_get_branch_info = {
        access_token: access_token,
        store_id: 0,
        merchant_id: 0
      };

      for (const branch of allBranches) {

        body_get_branch_info.merchant_id = +branch.merchant_id;
        body_get_branch_info.store_id = +branch.branch_id;

        const dataGetBranchInfo = await axios.post(url_get_branch_info, JSON.stringify(body_get_branch_info), { headers });
        branch.branch_phone = formatPhoneNumber(dataGetBranchInfo.data.store.phone_no);
      }

      return new ResponseData(HttpStatus.OK, "SUCCESS", allBranches);
    } else {
      return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
    }
  } catch (error) {
    const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
    const message = error.response?.statusText || "Lỗi ! getSHFBillNewList";

    return new ResponseData(statusCode, message, []);
  }
}

async function loginBEF(
  url: string,
  usernamne: string,
  password: string
): Promise<any> {
  try {
    let body = {};

    if (!usernamne.includes("@")) {
      usernamne = usernamne.replace(/^0/, "+84");

      body = {
        password: password,
        phone_no: usernamne,
      };
    } else {
      body = {
        password: password,
        email: usernamne,
      };
    }

    const headers = {
      "Content-Type": "application/json",
    };

    const data = await axios.post(url, JSON.stringify(body), { headers });

    if (data.data.code == 143) {
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        jwt: !data.data.token ? "" : data.data.token,
      });
    } else {
      return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, {
        jwt: "",
      });
    }
  } catch (error) {
    const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
    const message = error.response?.statusText || "Lỗi ! getSHFBillNewList";

    return new ResponseData(statusCode, message, {
      jwt: "",
    });
  }
}

async function syncTokenBEF(
  url_login: string,
  usernamne: string,
  password: string
): Promise<any> {
  let data = await loginBEF(url_login, usernamne, password);

  if (data.status != HttpStatus.OK) {
    return "";
  }

  return data.data.jwt;
}

// ------------------ BEF --------------------


// ------------------ CNVL --------------------

async function getCNVLBranchList(
  url: string,
  access_token: string
): Promise<any> {
  try {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": access_token
    };

    const data = await axios.get(url, { headers });

    if (data.data.status != HttpStatus.OK) {


      return new ResponseData(HttpStatus.OK, "SUCCESS", data.data.locations.map((x) => ({
        branch_id: x.id,
        branch_name: x.name,
        branch_address: `${x.address1}, ${x.ward_name}, ${x.district_name}, ${x.province_name}`,
        branch_phone: x.phone
      }))
      );
    } else {
      return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
    }
  } catch (error) {
    const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
    const message = error.response?.statusText || "Lỗi ! getSHFBillNewList";

    return new ResponseData(statusCode, message, []);
  }
}



// ------------------ CNVL --------------------


function formatPhoneNumber(phone: string): string {
  // Bỏ tất cả khoảng trắng trước
  phone = phone.replace(/\s+/g, "");

  // Nếu số điện thoại bắt đầu bằng "+84", thay thế "+84" bằng "0"
  if (phone.startsWith("+84")) {
    return phone.replace("+84", "0");
  }

  // Nếu số điện thoại bắt đầu bằng "84" (không có dấu "+"), thay thế "84" bằng "0"
  if (phone.startsWith("84")) {
    return phone.replace("84", "0");
  }

  return phone; // Trả về số không thay đổi nếu không có "84" hoặc "+84"
}



