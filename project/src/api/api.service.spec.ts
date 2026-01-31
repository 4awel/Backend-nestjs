// src/app.service.spec.ts (дополнительные тесты)
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AppService Edge Cases', () => {
  let service: AppService;

  const mockPrisma = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('Валидация ID', () => {
    it('должен выбрасывать ошибку для нечислового ID', async () => {
      await expect(service.getPost(NaN)).rejects.toThrow();
    });

    it('должен обрабатывать большие числа', async () => {
      const largeId = 999999999;
      mockPrisma.post.findUnique.mockResolvedValue({ id: largeId, title: 'Test' });
      
      const result = await service.getPost(largeId);
      expect(result.id).toBe(largeId);
    });
  });
});