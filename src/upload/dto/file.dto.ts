import { ApiProperty } from '@nestjs/swagger';

export default class FileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
    file: any;
}
