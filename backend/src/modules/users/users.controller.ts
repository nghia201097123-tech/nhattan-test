import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PERMISSIONS } from '../../shared/constants/permissions.constant';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(PERMISSIONS.ADMIN_USERS)
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ADMIN_USERS)
  @ApiOperation({ summary: 'Get user by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Permissions(PERMISSIONS.ADMIN_USERS)
  @ApiOperation({ summary: 'Create new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @Permissions(PERMISSIONS.ADMIN_USERS)
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ADMIN_USERS)
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Put(':id/roles')
  @Permissions(PERMISSIONS.ADMIN_USERS)
  @ApiOperation({ summary: 'Assign roles to user' })
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('roleIds') roleIds: string[],
  ) {
    return this.usersService.assignRoles(id, roleIds);
  }

  @Get('roles/all')
  @ApiOperation({ summary: 'Get all roles' })
  async getAllRoles() {
    return this.usersService.getAllRoles();
  }

  @Get('permissions/all')
  @ApiOperation({ summary: 'Get all permissions' })
  async getAllPermissions() {
    return this.usersService.getAllPermissions();
  }
}
