import { User } from "../user.entity/user.enity";

export class UserResponse {
  id: number;
  company_id: number;
  role_id: number;
  country_id: number;
  first_name: string;
  last_name: string;
  phone_country_code: string;
  phone_number: string;
  email: string;
  password: string;
  avatar: string;
  identification_number: string;
  gender: number;
  birthday: Date;
  position: string;
  introduction: string;
  account_type: number;
  is_show_on_e_namecard: number;
  is_active: number;
  created_at: Date;
  updated_at: Date;

  constructor(user?: User) {
    this.id = user ? user.id : 0;
    this.company_id = user ? user.company_id : 0;
    this.role_id = user ? user.role_id : 0;
    this.country_id = user ? user.country_id : 0;
    this.first_name = user ? user.first_name : '';
    this.last_name = user ? user.last_name : '';
    this.phone_country_code = user ? user.phone_country_code : '';
    this.phone_number = user ? user.phone_number : '';
    this.email = user ? user.email : '';
    this.password = user ? user.password : '';
    this.avatar = user ? user.avatar : '';
    this.identification_number = user ? user.identification_number : '';
    this.gender = user ? user.gender : 0;
    this.birthday = user ? user.birthday : new Date('0000-00-00');
    this.position = user ? user.position : '';
    this.introduction = user ? user.introduction : '';
    this.account_type = user ? user.account_type : 0;
    this.is_show_on_e_namecard = user ? user.is_show_on_e_namecard : 0;
    this.is_active = user ? user.is_active : 0;
    this.created_at = user ? user.created_at : new Date();
    this.updated_at = user ? user.updated_at : new Date();
  }


  public mapToList(data: User[]) {
    let response: UserResponse[] = [];
    data.forEach((e) => {

      response.push(new UserResponse(e));
    });
    return response;
  }
}
