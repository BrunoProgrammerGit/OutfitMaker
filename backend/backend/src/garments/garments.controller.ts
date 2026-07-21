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

@Controller('api/garments')
export class GarmentsController {
  constructor(private readonly garmentsService: GarmentsService) {}

  @Get()
  findAll() {
    return this.garmentsService.findAll()
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
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
    @Body() body: any,
  ) {
    return this.garmentsService.update(+id, {
      ...body,
      image: file,
    })
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.garmentsService.remove(+id)
  }
}
