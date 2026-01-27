import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly repository: Repository<Staff>,
  ) {}

  async findAll(query: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('staff');

    if (search) {
      queryBuilder.andWhere(
        '(staff.fullName ILIKE :search OR staff.code ILIKE :search OR staff.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`staff.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  async findByRole(role: string): Promise<Staff[]> {
    return this.repository
      .createQueryBuilder('staff')
      .where('staff.isActive = :isActive', { isActive: true })
      .andWhere(':role = ANY(staff.roles)', { role })
      .orderBy('staff.fullName', 'ASC')
      .getMany();
  }

  async findById(id: string): Promise<Staff> {
    const staff = await this.repository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async create(dto: CreateStaffDto): Promise<Staff> {
    const existing = await this.repository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException('Staff code already exists');
    }

    const staff = this.repository.create(dto);
    return this.repository.save(staff);
  }

  async update(id: string, dto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findById(id);

    if (dto.code && dto.code !== staff.code) {
      const existing = await this.repository.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new BadRequestException('Staff code already exists');
      }
    }

    Object.assign(staff, dto);
    return this.repository.save(staff);
  }

  async remove(id: string): Promise<void> {
    const staff = await this.findById(id);
    staff.isActive = false;
    await this.repository.save(staff);
  }
}
