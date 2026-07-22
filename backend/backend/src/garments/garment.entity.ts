import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { GarmentCategory } from '@shared/garment-category'

@Entity('garments')
export class Garment {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  category?: GarmentCategory

  @Column({ nullable: true })
  description?: string

  @Column({ nullable: true })
  imageUrl?: string

  @Column({ default: true })
  isAvailable: boolean
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
