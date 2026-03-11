import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.prisma.category.create({
        data: {
          name: this.normalizeName(createCategoryDto.name),
        },
      });
    } catch (error: unknown) {
      if (this.hasPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException('Category name already exists');
      }

      throw new InternalServerErrorException('Unable to create category');
    }
  }

  findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: this.normalizeName(updateCategoryDto.name),
        },
      });
    } catch (error: unknown) {
      if (this.hasPrismaErrorCode(error, 'P2025')) {
        throw new NotFoundException('Category not found');
      }

      if (this.hasPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException('Category name already exists');
      }

      throw new InternalServerErrorException('Unable to update category');
    }
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  private hasPrismaErrorCode(error: unknown, code: string): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === code
    );
  }
}
