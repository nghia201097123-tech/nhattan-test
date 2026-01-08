import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  isNotEmpty,
  isString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";
import { MaterialCategoryTypeParent } from "../utils.enum.common/utils.material-category-type-parent.enum";
import { ReportTypeEnum } from "../utils.enum.common/utils.report-type.enum";
import { ExceptionResponseDetail } from "../utils.exception.common/utils.exception.common";

export const GetUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new HttpException(
        new ExceptionResponseDetail(
          HttpStatus.UNAUTHORIZED,
          "Token không hợp lệ!"
        ),
        HttpStatus.OK
      );
    }
    return request.user;
  }
);

export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: "isNotEmptyString",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any): boolean =>
          isString(value) && isNotEmpty(value.trim()),
        defaultMessage: (validationArguments?: ValidationArguments): string => {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              `[${validationArguments.property}] không được để trống `
            ),
            HttpStatus.OK
          );
        },
      },
    });
  };
}

export function IsNotEmpty(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: "isNotEmpty",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any): boolean =>
          typeof value === "string" && value.trim().length > 0,
        defaultMessage: (validationArguments?: ValidationArguments): string => {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              `[${validationArguments.property}] không được để trống `
            ),
            HttpStatus.OK
          );
        },
      },
    });
  };
}

export function IsInt(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: "isInt",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any): boolean =>
        !isNaN(value) || Number.isInteger(value),
        defaultMessage: (validationArguments?: ValidationArguments): string => {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              `[${validationArguments.property}] phải là kiêu số nguyên!`
            ),
            HttpStatus.OK
          );
        },
      },
    });
  };
}

export function MaxLength20(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: "maxLength20",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any): boolean => !(value.length > 20) || !value,
        defaultMessage: (validationArguments?: ValidationArguments): string => {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              `[${validationArguments.property}] không được nhập quá 20 ký tự ${propertyName}!`
            ),
            HttpStatus.OK
          );
        },
      },
    });
  };
}

export function IsEmptyArray(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: "isNotArray",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any): boolean => !(value.length == 0),
        defaultMessage: (validationArguments?: ValidationArguments): string => {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              `[${validationArguments.property}] không được để rỗng!`
            ),
            HttpStatus.OK
          );
        },
      },
    });
  };
}

export function Min(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: "Min",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any): boolean =>
          !isNaN(value) || Number.isInteger(value) || !(value < 1),
        defaultMessage: (validationArguments?: ValidationArguments): string => {
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              `[${validationArguments.property}] Phải là số nguyên và lớn hơn 0!`
            ),
            HttpStatus.OK
          );
        },
      },
    });
  };
}
