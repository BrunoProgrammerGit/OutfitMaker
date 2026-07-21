import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'
import { GarmentsController } from './garments.controller'
import { GarmentsService } from './garments.service'
import { Garment } from './garment.entity'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'sqljs',
      autoSave: false,
      entities: [Garment],
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([Garment]),
  ],
  controllers: [GarmentsController],
  providers: [GarmentsService],
})
export class GarmentsModule {}
