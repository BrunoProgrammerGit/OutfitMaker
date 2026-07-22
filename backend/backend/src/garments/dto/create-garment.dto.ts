import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { GarmentCategory } from '@shared/garment-category'

export class CreateGarmentDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(GarmentCategory)
  category: GarmentCategory

  @IsString()
  @IsOptional()
  description?: string
}
