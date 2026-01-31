import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';
import type { PostType } from './app.service';
import { CreateApiDto } from './api/dto/create-api.dto';
import { UpdateApiDto } from './api/dto/update-api.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log('GET / request received');
    return this.appService.getHello();
  }

  @Get('posts')
  getPosts(): Promise<PostType[]> {
    console.log('GET /posts request received');
    return this.appService.getPosts();
  }

  @Post('posts')
  createPost(@Body() CreateApiDto: CreateApiDto): Promise<PostType> {
    console.log('POST /posts request received with data:', CreateApiDto);
    return this.appService.createPost(CreateApiDto);
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string): Promise<PostType> {
    console.log('GET /posts/:id request received for id:', id);
    return this.appService.getPost(Number(id));
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    console.log('DELETE /posts request delete data by id:', id);
    return this.appService.deletePost(id);
  }

  @Patch('posts/:id')
  changePost(
    @Param('id') id: string,
    @Body() UpdateApiDto: UpdateApiDto,
  ): Promise<PostType> {
    console.log('PATCH /posts request changed data: ', id, UpdateApiDto);
    return this.appService.changePost(id, UpdateApiDto);
  }
}
