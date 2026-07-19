import { IsNotEmpty, IsString } from 'class-validator'

export class GoogleAuthDto {
  // ID token (credential) emitido por Google Identity Services en el frontend.
  @IsString()
  @IsNotEmpty({ message: 'GOOGLE_CREDENTIAL_REQUIRED' })
  credential: string
}
