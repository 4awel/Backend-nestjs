import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateApiDto } from './api/dto/create-api.dto';
import { UpdateApiDto } from './api/dto/update-api.dto';

export interface PostType {
  id: number;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'NestJS API is running!';
  }

  async getPosts(): Promise<PostType[]> {
    return (this.prisma as any).post.findMany();
  }

  async getPost(id: number): Promise<PostType> {
    const post = (this.prisma as any).post.findUnique({
      where: { id: id },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async createPost(CreateApiDto: CreateApiDto): Promise<PostType> {
    return (this.prisma as any).post.create({
      data: {
        ...CreateApiDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    this.getPost(Number(id));

    await (this.prisma as any).post.delete({
      where: { id: Number(id) }, // В схеме Int, поэтому приводим к числу
    });
    return { success: true };
  }

  async changePost(id: string, UpdateApiDto: UpdateApiDto): Promise<PostType> {
    this.getPost(Number(id));
    return (this.prisma as any).post.update({
      where: { id: Number(id) },
      data: {
        ...UpdateApiDto,
        updatedAt: new Date(),
      },
    });
  }
}

// npx prisma generate --schema=src/prisma/schema.prisma // призма генерация
