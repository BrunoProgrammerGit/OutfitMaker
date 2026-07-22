import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { GarmentsService } from './garments.service'
import { CreateGarmentDto } from './dto/create-garment.dto'
import { UpdateGarmentDto } from './dto/update-garment.dto'

@Controller('api/garments')
export class GarmentsController {
  constructor(private readonly garmentsService: GarmentsService) {}

  @Get()
  findAll() {
    return this.garmentsService.findAll()
  }

  @Get(':id/reference-check')
  verifyDelete(@Param('id') id: string) {
    return this.garmentsService.checkPlannerEntryReferences(+id)
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@UploadedFile() file: Express.Multer.File, @Body() body: CreateGarmentDto) {
    return this.garmentsService.create({
      ...body,
      image: file,
    })
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateGarmentDto,
  ) {
    return this.garmentsService.update(+id, {
      ...body,
      image: file,
    })
  }

  @Patch(':id/availability')
  setAvailability(@Param('id') id: string, @Body() body: { isAvailable: boolean }) {
    return this.garmentsService.setAvailability(+id, body.isAvailable)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.garmentsService.remove(+id)
  }
}
