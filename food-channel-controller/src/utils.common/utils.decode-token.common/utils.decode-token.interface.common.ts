import { Account } from "../utils.enum/utils.account.enum"

export interface DecodeBearerTokenInterFace {
    jti: string
    iat: number
    sub: number
    exp: number
    user_id: number,
    jwt_token: string
}