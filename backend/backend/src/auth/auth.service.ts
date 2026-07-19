import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { OAuth2Client, TokenPayload } from 'google-auth-library'
import { RegisterDto } from './register.dto'

interface User {
  id: number
  email: string
  // Ausente en cuentas creadas solo con Google (no piden password).
  passwordHash?: string
  // Ausente en cuentas email/password que aún no vincularon Google.
  googleId?: string
  name?: string
  picture?: string
}

export interface AuthResult {
  accessToken: string
  user: { id: number; email: string; name?: string; picture?: string }
}

@Injectable()
export class AuthService {
  private users: User[] = []
  private nextId = 1
  private readonly googleClient: OAuth2Client

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
    )
  }

  async register(dto: RegisterDto): Promise<{ id: number; email: string }> {
    const existing = this.findByEmail(dto.email)
    if (existing) {
      throw new ConflictException('EMAIL_ALREADY_REGISTERED')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user: User = { id: this.nextId++, email: dto.email, passwordHash }
    this.users.push(user)

    return { id: user.id, email: user.email }
  }

  /**
   * Login/registro con Google. Recibe el ID token emitido por Google Identity
   * Services en el frontend, lo verifica contra Google (firma, expiración y
   * audience == nuestro Client ID) y emite un JWT propio de la app; el token
   * de Google nunca se usa como sesión.
   *
   * Vinculación de cuentas: si el email ya existe como cuenta email/password,
   * se vincula automáticamente (se guarda el googleId en esa misma cuenta).
   * Es seguro porque solo aceptamos tokens con email_verified=true: Google ya
   * demostró que quien inicia sesión controla ese correo. La cuenta conserva
   * su password y a partir de ahí ambos métodos funcionan.
   */
  async googleLogin(credential: string): Promise<AuthResult> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID')
    if (!clientId) {
      // Config del servidor incompleta; nunca verificar sin audience.
      throw new UnauthorizedException('GOOGLE_AUTH_NOT_CONFIGURED')
    }

    let payload: TokenPayload | undefined
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      })
      payload = ticket.getPayload()
    } catch {
      throw new UnauthorizedException('GOOGLE_TOKEN_INVALID')
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException('GOOGLE_TOKEN_INVALID')
    }

    const { sub: googleId, email, name, picture } = payload

    let user = this.users.find((u) => u.googleId === googleId)
    if (!user) {
      const byEmail = this.findByEmail(email)
      if (byEmail) {
        // Cuenta email/password existente: vincular Google a esa cuenta.
        byEmail.googleId = googleId
        byEmail.name = byEmail.name ?? name
        byEmail.picture = byEmail.picture ?? picture
        user = byEmail
      } else {
        // Primer login con Google: crear la cuenta sin password.
        user = { id: this.nextId++, email, googleId, name, picture }
        this.users.push(user)
      }
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    })

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    }
  }

  private findByEmail(email: string): User | undefined {
    return this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )
  }
}
