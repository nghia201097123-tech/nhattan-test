import { Any } from "@grpc/grpc-js/build/src/generated/google/protobuf/Any";

export class EmployeeEntity {
  id: number;

  restaurant_id: number;

  restaurant_brand_id: number;

  branch_id: number;

  employee_role_id: number;

  avatar?: string;

  birthday?: string;

  email: string;

  prefix?: string;

  normalize_name: string;

  full_name: string;

  gender: number;

  password: string;

  phone: string;

  status: number;

  privilege_tags: PrivilegeTags[];

  is_employee_partime: number;


  constructor( e ?: any) {

    this.id = e ? e.id : 0;
    this.restaurant_id = e ? e.restaurant_id : 0;
    this.restaurant_brand_id = e ? e.restaurant_brand_id : 0;
    this.branch_id = e ? e.branch_id : 0;
    this.employee_role_id = e ? e.employee_role_id : 0;
    this.avatar = e ? e.avatar : '';
    this.birthday = e ? e.birthday : '';
    this.email = e ? e.email : '';
    this.prefix = e ? e.prefix : '';
    this.normalize_name = e ? e.normalize_name : '';
    this.full_name = e ? e.full_name : '';
    this.gender = e ? e.gender : 0;
    this.password = e ? e.password : '';
    this.phone = e ? e.phone : '';
    this.status = e ? e.status : 0;
    // this.privilege_tags = e ? e.privilege_tags.map(tag => new PrivilegeTags(tag)) : [];
    this.is_employee_partime = e ? !e.is_employee_partime ? 0 : e.is_employee_partime : 0;
    
  }


  public mapToList(data: any[]) {
    let response: EmployeeEntity[] = [];
    data.forEach((e) => {
      response.push(new EmployeeEntity(e));
    });
    return response;
  }
}

export class PrivilegeTags {
  id: number;

  code : string;

  constructor(tag?: PrivilegeTags) {
  this.id = tag ? tag.id : 0;
  this.code = tag ? tag.code : '';
  }
}
