const axios = require('axios');

// URL của API
const apiUrl = 'http://127.0.0.1:1422/api/v1/channel-order-foods/orders?is_app_food=1&branch_id=3718&restaurant_id=2244&area_id=-1&is_have_restaurant_order=0&channel_order_food_id=-1&restaurant_brand_id=2982&customer_order_status=0%2C8';

// Header cho request
const headers = {
  Authorization: 'Bearer e640d854-25ad-4735-b223-00d5f5d0dc2f',
  ProjectId: '1422',
  Method: '0',
};

// Hàm để gọi API
const callApi = async () => {
  try {
    const response = await axios.get(apiUrl, { headers });
    console.log('Response:', response.data.status);
  } catch (error) {
    console.error('Error calling API:', error.message);
  }
};

// Hàm để gọi API 100 lần, mỗi lần cách nhau 10 giây
const callApiRepeatedly = (times, interval) => {
  let count = 0;
  const intervalId = setInterval(() => {
    if (count >= times) {
      clearInterval(intervalId);
      console.log('Finished calling API 100 times');
    } else {
      callApi();
      count++;
      console.log(`Call number: ${count}`);
    }
  }, interval);
};

// Gọi hàm để bắt đầu
callApiRepeatedly(100, 0); // 100 lần, mỗi lần cách nhau 10 giây (10,000 milliseconds)
