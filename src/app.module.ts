import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: "sqlite",
    database: "db.sqlite",
    entities: []
  })],
  controllers: [],
  providers: [],
})
export class AppModule { }
