import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { Repository } from 'typeorm'
import { Garment } from './garment.entity'
import { GarmentCategory } from './garment-category.enum'
import { v4 as uuidv4 } from 'uuid'
import * as cloudinary from 'cloudinary'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

@Injectable()
export class GarmentsService {
  constructor(
    @InjectRepository(Garment)
    private readonly garmentRepository: Repository<Garment>,
  ) {}

  async findAll(): Promise<Garment[]> {
    return this.garmentRepository.find({ order: { createdAt: 'DESC' } })
  }

  // Reusable filter for available garments — use this from recommendation engine
  async findAvailable(): Promise<Garment[]> {
    return this.garmentRepository.find({ where: { isAvailable: true }, order: { createdAt: 'DESC' } })
  }

  async create(payload: { name?: string; category?: GarmentCategory; description?: string; image?: Express.Multer.File }) {
    const garment = this.garmentRepository.create({
      name: payload.name ?? 'Nueva prenda',
      category: payload.category,
      description: payload.description,
    })

    if (payload.image) {
      garment.imageUrl = await this.storeImage(payload.image)
    }

    return this.garmentRepository.save(garment)
  }

  async update(id: number, payload: { name?: string; category?: GarmentCategory; description?: string; image?: Express.Multer.File }) {
    const garment = await this.garmentRepository.findOneBy({ id })
    if (!garment) throw new NotFoundException('Prenda no encontrada')

    if (payload.name !== undefined) garment.name = payload.name
    if (payload.category !== undefined) garment.category = payload.category
    if (payload.description !== undefined) garment.description = payload.description

    if (payload.image) {
      garment.imageUrl = await this.storeImage(payload.image)
    }

    return this.garmentRepository.save(garment)
  }

  async checkPlannerEntryReferences(id: number) {
    try {
      const result: Array<{ count: number }> = await this.garmentRepository.query(
        'SELECT COUNT(*) as count FROM planner_entry WHERE garment_id = ? LIMIT 1',
        [id],
      )
      return {
        referenced: (result[0]?.count ?? 0) > 0,
      }
    } catch (error: any) {
      const message = String(error?.message || error)
      if (message.includes('planner_entry') && message.match(/no such table|cannot find|does not exist/i)) {
        // TODO: habilitar la verificación cuando la tabla planner_entry esté creada en Issue #13.
        return { referenced: false }
      }
      throw error
    }
  }

  async setAvailability(id: number, isAvailable: boolean) {
    const garment = await this.garmentRepository.findOneBy({ id })
    if (!garment) throw new NotFoundException('Prenda no encontrada')
    garment.isAvailable = isAvailable
    return this.garmentRepository.save(garment)
  }

  private async storeImage(file: Express.Multer.File): Promise<string> {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const uploadResult = await cloudinary.v2.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'outfitmaker/garments',
          public_id: `garment-${uuidv4()}`,
        },
      )
      return uploadResult.secure_url
    }

    const uploadDir = join(process.cwd(), 'uploads', 'garments')
    await mkdir(uploadDir, { recursive: true })
    const baseName = `${uuidv4()}${this.getExtension(file.originalname)}`
    const filePath = join(uploadDir, baseName)
    await writeFile(filePath, file.buffer)
    return `http://localhost:${process.env.PORT ?? 3000}/uploads/garments/${baseName}`
  }

  private getExtension(fileName: string) {
    const match = fileName.match(/\.[^.]+$/)
    return match ? match[0] : '.bin'
  }

  async remove(id: number) {
    const garment = await this.garmentRepository.findOneBy({ id })
    if (!garment) throw new NotFoundException('Prenda no encontrada')
    await this.garmentRepository.remove(garment)
    return { deleted: true, id }
  }
}
