import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import type { PostType } from './app.service';

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
  createPost(@Body() body: { title: string; body: string }): Promise<PostType> {
    console.log('POST /posts request received with data:', body);
    return this.appService.createPost(body);
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    console.log("DELETE /posts request delete data by id:", id);
    return this.appService.deletePost(id);
  }

  @Patch('posts/:id')
  changePost(
    @Param('id') id: string,
    @Body() body: { title: string; body: string }
  ): Promise<PostType> {
    console.log('PATCH /posts request changed data: ', id, body)
    return this.appService.changePost(id, body);
  }
}