import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

export interface PostType {
  id: number,
  title: string,
  body: string,
  createdAt: Date,
  updatedAt: Date
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

  async createPost(data: { title: string; body: string }): Promise<PostType> {
    return (this.prisma as any).post.create({
      data: {
        title: data.title,
        body: data.body,
      },
    });
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    await (this.prisma as any).post.delete({
      where: { id: Number(id) }, // В схеме Int, поэтому приводим к числу
    });
    return { success: true };
  }

  async changePost(id: string, data: { title: string; body: string }): Promise<PostType> {
    return (this.prisma as any).post.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        body: data.body,
      },
    });
  }
}

// npx prisma generate --schema=src/prisma/schema.prisma