import { HttpStatus } from "@nestjs/common";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { ChannelBranch } from "../channel-order/entity/channel-branch";
import { ChannelOrderFoodTokenEntity } from "../channel-order/entity/channel-order-food-token.entity";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";

const { exec } = require("child_process");
import { promisify } from 'util';
const execAsync = promisify(exec);

/**
 * Safe JSON parse với error handling
 */
function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('[safeJsonParse] Failed to parse JSON:', error);
    return defaultValue;
  }
}

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

async function getSHFBranchList(
  url: string,
  url_get_branch_info: string,
  x_merchant_token: string
): Promise<any> {
  try {
    const body = JSON.stringify({
      page_size: 999999,
    });

    const curlCommand = `curl -s -X POST '${url}' \
      --header 'x-merchant-token: ${x_merchant_token}' \
      --header 'Content-Type: application/json' \
      --data '${body.replace(/'/g, "'\\''")}'`;

    const result = await execAsync(curlCommand);
    const data = safeJsonParse(result.stdout, { error_code: 0, data: { store_list: [] } });

    if (data.error_code == 10007) {
      return new ResponseData(
        HttpStatus.UNAUTHORIZED,
        "Vui lòng cập nhập token cho app SHF",
        []
      );
    } else {

      const allBranches = (data.data?.store_list || []).map((store: any) => ({
        merchant_id: "0",
        branch_id: store.store_id,
        branch_name: store.store_name,
        branch_address: '',
        branch_phone: ''
      }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", allBranches);
    }
  } catch (error: any) {
    console.error('[getSHFBranchList] Error:', error.message);
    const statusCode = HttpStatus.BAD_REQUEST;
    const message = error.message || "Lỗi rồi getSHFBranchList";

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

    const curlCommand = `curl -s -X GET '${url}' \
      --header 'Content-Type: application/json' \
      --header 'x-mts-ssid: ${access_token}' \
      --header 'x-user-type: user-profile'`;

    const result = await execAsync(curlCommand);
    const data = safeJsonParse(result.stdout, { data: null });

    if (data.data?.grab_food_profile?.merchant?.name) {
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        name: data.data.grab_food_profile.merchant.name,
        address: data.data.grab_food_profile.merchant.address,
        phone: data.data.grab_food_profile.merchant.contractNumber
      });
    } else {
      return new ResponseData(HttpStatus.OK, "BAD REQUEST", { name: "" });
    }
  } catch (error: any) {
    console.error('[getGRFBranchDetail] Error:', error.message);
    const statusCode = HttpStatus.BAD_REQUEST;
    const message = error.message || "Lỗi rồi getGRFBranchDetail";

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

    const body = JSON.stringify({
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
    });

    const curlCommand = `curl -s -X POST '${url}' \
      --header 'Content-Type: application/json' \
      --header 'user-agent: Grab Merchant/4.126.0 (ios 16.7.10; Build 102734851)' \
      --header 'mex-country: VN' \
      --header 'x-currency: VND' \
      --data '${body.replace(/'/g, "'\\''")}'`;

    const result = await execAsync(curlCommand);
    const data = safeJsonParse(result.stdout, { data: { code: 0 } });

    if (data.data?.code === 200) {
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        device_id: !data.data.active_session
          ? device_id
          : !data.data.active_session.mobile_session_data
            ? device_id
            : data.data.active_session.mobile_session_data.device_id,
        device_brand: !data.data.active_session
          ? device_brand
          : !data.data.active_session.mobile_session_data
            ? device_brand
            : data.data.active_session.mobile_session_data.device_brand,
        jwt: !data.data.data ? "" : data.data.data.jwt,
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
  } catch (error: any) {
    console.error('[loginGRF] Error:', error.message);
    const statusCode = HttpStatus.BAD_REQUEST;
    const message = error.message || "Lỗi rồi loginGRF";

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

    const body = JSON.stringify({
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
    });

    const curlCommand = `curl -s -X POST '${url}' \
      --header 'Content-Type: application/json' \
      --data '${body.replace(/'/g, "'\\''")}'`;

    const result = await execAsync(curlCommand);
    const data = safeJsonParse(result.stdout, { data: { code: 0 } });

    if (data.data?.code === 200) {
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        device_id: "",
        device_brand: "",
        jwt: !data.data.data ? "" : data.data.data.jwt,
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
  } catch (error: any) {
    console.error('[logoutGRF] Error:', error.message);
    return new ResponseData(HttpStatus.BAD_REQUEST, error.message || "Error", {
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

    const body = JSON.stringify({
      access_token: access_token,
    });

    const curlCommand = `curl -s -X POST '${url}' \
      --header 'Content-Type: application/json' \
      --data '${body.replace(/'/g, "'\\''")}'`;

    const result = await execAsync(curlCommand);
    const data = safeJsonParse(result.stdout, { code: 0, data: [] });

    if (data.code == 143) {

      const allBranches = (data.data || []).reduce((accumulator: any[], merchant: any) => {
        const storeProfiles = (merchant.store_profiles || []).map((store: any) => ({
          merchant_id: merchant.merchant_id,
          branch_id: store.store_id,
          branch_name: store.store_name,
          branch_address: store.address,
          branch_phone: ''
        }));
        return accumulator.concat(storeProfiles);
      }, []);

      for (const branch of allBranches) {

        const body_get_branch_info = JSON.stringify({
          access_token: access_token,
          merchant_id: +branch.merchant_id,
          store_id: +branch.branch_id
        });

        const curlCommand2 = `curl -s -X POST '${url_get_branch_info}' \
          --header 'Content-Type: application/json' \
          --data '${body_get_branch_info.replace(/'/g, "'\\''")}'`;

        const result2 = await execAsync(curlCommand2);
        const dataGetBranchInfo = safeJsonParse(result2.stdout, { store: { phone_no: '' } });
        branch.branch_phone = formatPhoneNumber(dataGetBranchInfo.store?.phone_no || '');
      }

      return new ResponseData(HttpStatus.OK, "SUCCESS", allBranches);
    } else {
      return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
    }
  } catch (error: any) {
    console.error('[getBEFBranchList] Error:', error.message);
    const statusCode = HttpStatus.BAD_REQUEST;
    const message = error.message || "Lỗi ! getBEFBranchList";

    return new ResponseData(statusCode, message, []);
  }
}

async function loginBEF(
  url: string,
  usernamne: string,
  password: string
): Promise<any> {
  try {
    let body: any = {};

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

    const bodyStr = JSON.stringify(body);

    const curlCommand = `curl -s -X POST '${url}' \
      --header 'Content-Type: application/json' \
      --data '${bodyStr.replace(/'/g, "'\\''")}'`;

    const result = await execAsync(curlCommand);
    const data = safeJsonParse(result.stdout, { code: 0, token: '' });

    if (data.code == 143) {
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        jwt: !data.token ? "" : data.token,
      });
    } else {
      return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", {
        jwt: "",
      });
    }
  } catch (error: any) {
    console.error('[loginBEF] Error:', error.message);
    const statusCode = HttpStatus.BAD_REQUEST;
    const message = error.message || "Lỗi ! loginBEF";

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

    const curlCommand = `curl -s -X GET '${url}' \
      --header 'Content-Type: application/json' \
      --header 'Authorization: ${access_token}'`;

    const result = await execAsync(curlCommand);
    const data = safeJsonParse(result.stdout, { status: 0, locations: [] });

    if (data.status != HttpStatus.OK) {

      return new ResponseData(HttpStatus.OK, "SUCCESS", (data.locations || []).map((x: any) => ({
        branch_id: x.id,
        branch_name: x.name,
        branch_address: `${x.address1}, ${x.ward_name}, ${x.district_name}, ${x.province_name}`,
        branch_phone: x.phone
      }))
      );
    } else {
      return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
    }
  } catch (error: any) {
    console.error('[getCNVLBranchList] Error:', error.message);
    const statusCode = HttpStatus.BAD_REQUEST;
    const message = error.message || "Lỗi ! getCNVLBranchList";

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
