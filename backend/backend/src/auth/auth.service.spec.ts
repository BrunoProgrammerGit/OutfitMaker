import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

// Mock de google-auth-library: controlamos el payload que devolvería Google.
const verifyIdToken = jest.fn()
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken })),
}))

describe('AuthService.googleLogin', () => {
  let service: AuthService

  beforeEach(async () => {
    verifyIdToken.mockReset()
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: { get: (k: string) => (k === 'GOOGLE_CLIENT_ID' ? 'cid' : undefined) },
        },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('app-jwt') } },
      ],
    }).compile()
    service = moduleRef.get(AuthService)
  })

  function mockGooglePayload(payload: Record<string, unknown>) {
    verifyIdToken.mockResolvedValue({ getPayload: () => payload })
  }

  it('crea una cuenta nueva sin password y devuelve un JWT propio', async () => {
    mockGooglePayload({
      sub: 'g-1',
      email: 'new@example.com',
      email_verified: true,
      name: 'Nuevo',
    })
    const res = await service.googleLogin('token')
    expect(res.accessToken).toBe('app-jwt')
    expect(res.user.email).toBe('new@example.com')
  })

  it('vincula Google a una cuenta email/password existente (mismo email)', async () => {
    await service.register({ email: 'dup@example.com', password: 'password123' })
    mockGooglePayload({
      sub: 'g-2',
      email: 'dup@example.com',
      email_verified: true,
    })
    const res = await service.googleLogin('token')
    // Reusa la misma cuenta (id 1), no crea una duplicada.
    expect(res.user.id).toBe(1)
  })

  it('rechaza tokens con email no verificado', async () => {
    mockGooglePayload({ sub: 'g-3', email: 'x@example.com', email_verified: false })
    await expect(service.googleLogin('token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })

  it('rechaza tokens que Google no valida (audience/firma)', async () => {
    verifyIdToken.mockRejectedValue(new Error('invalid'))
    await expect(service.googleLogin('bad')).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })
})
