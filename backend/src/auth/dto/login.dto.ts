import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'seller@collector.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Seller123!' })
  @IsString()
  @MinLength(6)
  password!: string;
}
