import { ConflictException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './register.dto'

interface User {
  id: number
  email: string
  passwordHash: string
}

@Injectable()
export class AuthService {
  private users: User[] = []
  private nextId = 1

  async register(dto: RegisterDto): Promise<{ id: number; email: string }> {
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === dto.email.toLowerCase(),
    )
    if (existing) {
      throw new ConflictException('EMAIL_ALREADY_REGISTERED')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user: User = { id: this.nextId++, email: dto.email, passwordHash }
    this.users.push(user)

    return { id: user.id, email: user.email }
  }
}
