import { IsEnum, IsOptional, IsString } from 'class-validator'
import { GarmentCategory } from '@shared/garment-category'

export class UpdateGarmentDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsEnum(GarmentCategory)
  @IsOptional()
  category?: GarmentCategory

  @IsString()
  @IsOptional()
  description?: string
}
