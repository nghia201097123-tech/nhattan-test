export enum ChannelOrderFoodApiEnum {

    // Lấy danh sách món ăn của App SHOPEE FOOD
    SHF_GET_FOOD_LIST = 'https://gmerchant.deliverynow.vn/api/v5/seller/store/dishes',
    // Lấy chi tiết món ăn của App SHOPEE FOOD
    SHF_GET_FOOD_DETAIL = 'https://gmerchant.deliverynow.vn/api/v5/seller/store/dish',
    // Cập nhập món ăn của App SHOPEE FOOD
    SHF_UPDATE_FOOD = 'https://gmerchant.deliverynow.vn/api/v5/seller/store/dish/update',
    // Lấy danh sách chi nhánh của App SHOPEE FOOD
    SHF_GET_BRANCH_LIST = 'https://app.partner.shopee.vn/mss/app-api/PartnerRNServer/GetStoreList',
    // Lấy danh sách bill  của App SHOPEE FOOD
    SHF_GET_BILL_LIST = 'https://gmerchant.deliverynow.vn/api/v5/order/get_list',
    // Lấy chi tiết bill  của App SHOPEE FOOD
    SHF_GET_BILL_DETAIL = 'https://gmerchant.deliverynow.vn/api/v5/order/get_detail',
    // Lấy danh sách món topping
    SHF_GET_FOOD_TOPPING_LIST = 'https://gmerchant.deliverynow.vn/api/v5/seller/store/option-groups',


    // Lấy danh sách món ăn của App GRAB FOOD
    GRF_GET_FOOD_LIST = 'https://api.grab.com/food/merchant/v2/menu',
    // Lấy danh sách đơn hàng của App GRAB FOOD
    GRF_GET_ORDER_LIST = 'https://api.grab.com/food/merchant/v1/reports/daily-pagination',
    // Lấy danh sách đơn hàng chi tiết của App GRAB FOOD
    GRF_GET_ORDER_DETAIL = 'https://api.grab.com/food/merchant/v3/orders/',
    // Đăng nhập App GRAB FOOD
    GRF_LOGIN = 'https://api.grab.com/mex-app/troy/user-profile/v1/login',
    // Chi tiết thông tin chi nhánh App GRAB FOOD
    GRF_BRANCH_DETAIL = 'https://api.grab.com/mex-app/troy/user-profile/v1/unified-profile?isBalanceNeeded=false',
    // Lấy danh sách đơn hàng mới của App GRAB FOOD
    GRF_GET_NEW_ORDER_LIST = 'https://api.grab.com/food/merchant/v3/orders-pagination?autoAcceptGroup=3&pageType=Preparing',
    // Cập nhập thông tin thiết bị 
    GRF_UPDATE_DEVICE_INFO = 'https://api.grab.com/grabdevices/updateDeviceInfo',
    // Lấy danh sách món topping
    GRF_GET_FOOD_TOPPING_LIST = 'https://api.grab.com/food/merchant/v2/menu',


    // Đăng nhập App Beefood
    BEF_LOGIN = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/login',
    // Lấy danh sách món ăn của App BEE FOOD
    BEF_GET_FOOD_LIST = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/get_merchant_items',
    // Lấy danh sách chi nhánh của App Gofood
    BEF_GET_BRANCH_LIST = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/get_user_profiles',
    // Lấy chi tiết món ăn của App BEE FOOD
    BEF_GET_FOOD_DETAIL = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/get_merchant_item',
    // Lấy chi tiết món ăn của App BEE FOOD
    BEF_UPDATE_FOOD = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/update_merchant_item',
    // Lấy danh sách món ăn của App BEE FOOD
    BEF_GET_BILL_LIST = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/get_restaurant_orders',
    // Lấy danh sách món ăn của App BEE FOOD
    BEF_GET_BILL_DETAIL = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/get_restaurant_order',
    // Lấy danh sách món ăn của chi nhánh
    BEF_GET_BRANCH_FOOD_LIST = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/get_restaurant_items',
    // Lấy thông tin chi nhánh
    BEF_GET_BRANCH_INFO = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/store/get',
    // Lấy danh sách món topping
    BEF_GET_FOOD_TOPPING_LIST = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/get_item_customizes',


    SHF_USER_AGENT= 'language=vi app_type=2',

    SHF_USER_AGENT_V2= 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'

}


