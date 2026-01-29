import { Injectable } from '@nestjs/common';
import { title } from 'process';

export interface Post {
  id: string;
  title: string;
  body: string;
}

@Injectable()
export class AppService {
  private posts: Post[] = [];

  getHello(): string {
    return 'NestJS API is running!';
  }

  getPosts(): Post[] {
    console.log(`Returning ${this.posts.length} posts`);
    return this.posts;
  }

  createPost(data: { title: string; body: string }): Post {
    const newPost: Post = {
      id: Date.now().toString(),
      title: data.title,
      body: data.body,
    };

    this.posts.push(newPost);
    console.log(`Created new post. Total posts: ${this.posts.length}`);

    return newPost;
  }

  deletePost(id: string): { success: boolean; message: string } {
    this.posts = this.posts.filter(p => p.id !== id);
    return {
      success: true,
      message: `Post with id ${id} deleted successfully`,
    };
  }

  changePost(id: string, data: { title: string; body: string }): Post {
    const indexPost = this.posts.findIndex(p => p.id === id);

    if (data.title !== undefined) {
      this.posts[indexPost].title = data.title;
    }

    if (data.body !== undefined) {
      this.posts[indexPost].body = data.body;
    }
    return this.posts[indexPost];
  }
}
