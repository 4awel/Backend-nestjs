// src/app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiDto } from '../api/dto/create-api.dto';
import { UpdateApiDto } from '../api/dto/update-api.dto';
import { NotFoundException } from '@nestjs/common';

// Моки
const mockPrismaService = {
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockPost = {
  id: 12345,
  title: 'Test title',
  body: 'Test body',
  createdAt: new Date('2026-01-31'),
  updatedAt: new Date('2026-01-31'),
};

const mockPostList = [
  mockPost,
  {
    id: 12346,
    title: 'Test title 2',
    body: 'Test body 2',
    createdAt: new Date('2026-01-30'),
    updatedAt: new Date('2026-01-30'),
  },
];

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);

    // Очистка моков перед каждым тестом
    jest.clearAllMocks();
  });

  describe('Тестирование получения запросов', () => {
    it('должен быть определен', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });

    describe('GET /', () => {
      it('должен возвращать приветствие', () => {
        const result = controller.getHello();
        expect(result).toBe('NestJS API is running!');
      });
    });

    describe('GET /posts', () => {
      it('должен возвращать массив постов', async () => {
        mockPrismaService.post.findMany.mockResolvedValue(mockPostList);

        const result = await controller.getPosts();

        expect(result).toEqual(mockPostList);
        expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
          orderBy: { createdAt: 'desc' },
        });
        expect(mockPrismaService.post.findMany).toHaveBeenCalledTimes(1);
      });

      it('должен возвращать пустой массив если нет постов', async () => {
        mockPrismaService.post.findMany.mockResolvedValue([]);

        const result = await controller.getPosts();

        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('GET /posts/:id', () => {
      it('должен возвращать пост по ID', async () => {
        mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

        const result = await controller.getPost('12345');

        expect(result).toEqual(mockPost);
        expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
          where: { id: 12345 },
        });
      });

      it('должен выбрасывать NotFoundException если пост не найден', async () => {
        mockPrismaService.post.findUnique.mockResolvedValue(null);

        await expect(controller.getPost('99999')).rejects.toThrow(
          NotFoundException,
        );
        await expect(controller.getPost('99999')).rejects.toThrow(
          'Post with ID 99999 not found',
        );
      });
    });
  });

  describe('Тестирование обработки запросов и отправки данных', () => {
    describe('POST /posts', () => {
      it('должен создавать новый пост и отправлять данные в Prisma', async () => {
        const createApiDto: CreateApiDto = {
          title: 'New Post',
          body: 'New body content',
        };

        const createdPost = {
          ...createApiDto,
          id: 99999,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.post.create.mockResolvedValue(createdPost);

        const result = await controller.createPost(createApiDto);

        expect(result).toEqual(createdPost);
        expect(mockPrismaService.post.create).toHaveBeenCalledWith({
          data: {
            title: createApiDto.title,
            body: createApiDto.body || '',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        });
        expect(mockPrismaService.post.create).toHaveBeenCalledTimes(1);
      });

      it('должен создавать пост с пустым body если не передано', async () => {
        const createApiDto: CreateApiDto = {
          title: 'Post without body',
        };

        const createdPost = {
          ...createApiDto,
          body: '',
          id: 88888,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.post.create.mockResolvedValue(createdPost);

        const result = await controller.createPost(createApiDto);

        expect(result.body).toBe('');
      });
    });

    describe('PATCH /posts/:id', () => {
      it('должен обновлять пост и отправлять данные в Prisma', async () => {
        const updateApiDto: UpdateApiDto = {
          title: 'Updated title',
          body: 'Updated body',
        };

        const updatedPost = {
          ...mockPost,
          ...updateApiDto,
          updatedAt: new Date(),
        };

        mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
        mockPrismaService.post.update.mockResolvedValue(updatedPost);

        const result = await controller.changePost('12345', updateApiDto);

        expect(result).toEqual(updatedPost);
        expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
          where: { id: 12345 },
        });
        expect(mockPrismaService.post.update).toHaveBeenCalledWith({
          where: { id: 12345 },
          data: {
            ...updateApiDto,
            updatedAt: expect.any(Date),
          },
        });
      });

      it('должен выбрасывать ошибку при обновлении несуществующего поста', async () => {
        mockPrismaService.post.findUnique.mockResolvedValue(null);

        await expect(
          controller.changePost('99999', { title: 'Updated' }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('DELETE /posts/:id', () => {
      it('должен удалять пост из Prisma', async () => {
        mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
        mockPrismaService.post.delete.mockResolvedValue(mockPost);

        await controller.deletePost('12345');

        expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
          where: { id: 12345 },
        });
        expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
          where: { id: 12345 },
        });
        expect(mockPrismaService.post.delete).toHaveBeenCalledTimes(1);
      });

      it('должен выбрасывать ошибку при удалении несуществующего поста', async () => {
        mockPrismaService.post.findUnique.mockResolvedValue(null);

        await expect(controller.deletePost('99999')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('Интеграционные тесты с Prisma', () => {
    it('должен корректно вызывать Prisma методы для полного цикла CRUD', async () => {
      // Test Data
      const testData: CreateApiDto = {
        title: 'Integration Test Post',
        body: 'Integration test body',
      };

      // Create
      const createdPost = {
        ...testData,
        id: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.post.create.mockResolvedValue(createdPost);

      const created = await service.createPost(testData);
      expect(mockPrismaService.post.create).toHaveBeenCalled();

      // Find All
      mockPrismaService.post.findMany.mockResolvedValue([created]);
      const allItems = await service.getPosts();
      expect(mockPrismaService.post.findMany).toHaveBeenCalled();

      // Find One
      mockPrismaService.post.findUnique.mockResolvedValue(created);
      const found = await service.getPost(100);
      expect(mockPrismaService.post.findUnique).toHaveBeenCalled();

      // Update
      const updateData: UpdateApiDto = { title: 'Updated Title' };
      const updatedPost = {
        ...found,
        ...updateData,
        updatedAt: new Date(),
      };
      mockPrismaService.post.update.mockResolvedValue(updatedPost);
      const updated = await service.changePost('100', updateData);
      expect(mockPrismaService.post.update).toHaveBeenCalled();

      // Delete
      mockPrismaService.post.delete.mockResolvedValue(updated);
      const deleteResult = await service.deletePost('100');
      expect(mockPrismaService.post.delete).toHaveBeenCalled();
      expect(deleteResult.success).toBe(true);
    });

    it('должен корректно конвертировать ID из строки в число', async () => {
      const postId = '12345';
      
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      
      await controller.getPost(postId);
      
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 12345 }, // Должно быть число, а не строка
      });
    });
  });
});