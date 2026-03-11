import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'seller@collector.local' })
  email!: string;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role!: Role;
}
