import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsEmail({}, { message: 'EMAIL_INVALID' })
  email: string

  @IsString()
  @MinLength(8, { message: 'PASSWORD_TOO_SHORT' })
  password: string
}
