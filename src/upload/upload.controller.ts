import {
  BadRequestException, Controller, Get, Param, Post,
  StreamableFile, UploadedFile, UseInterceptors, Response,
} from '@nestjs/common';
import {
  ApiBody, ApiConsumes,
  ApiOperation, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { contentType } from 'mime-types';
import FileDto from './dto/file.dto';

@ApiTags('파일 업로드')
@Controller('upload')
export default class UploadController {
  @ApiOperation({
    summary: '이미지 업로드',
    description: '이미지 파일을 업로드 합니다. jpg, png, jpeg, gif, svg, ico 파일을 지원합니다.',
  })
  @ApiResponse({ status: 201, type: String, description: '업로드 성공 (파일명 리턴)' })
  @ApiResponse({ status: 400, description: '잘못된 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일',
    type: FileDto,
  })
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|png|jpeg|gif|svg|ico)$/i)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('지원하지 않는 확장자입니다.'), false);
      }
    },
    storage: diskStorage({
      destination: (request, file, callback) => {
        const path = 'upload-file';
        if (!existsSync(path)) {
          mkdirSync(path);
        }
        callback(null, path);
      },
      filename(req, file, cb) {
        const chop = file.originalname.split('.').reverse();
        cb(null, `${randomUUID()}.${chop[0]}`);
      },
    }),
  }))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<string> {
    if (file === undefined) {
      throw new BadRequestException('잘못된 업로드 방법입니다.');
    }
    return `/api/upload/${file.filename}`;
  }

  @ApiOperation({
    summary: '이미지 다운로드',
    description: '이미지 파일을 다운로드 합니다. 업로드 한 파일명에 대해 파일을 서빙해줍니다.',
  })
  @ApiResponse({ status: 200, description: '파일 리턴' })
  @ApiResponse({ status: 400, description: '잘못된 접근' })
  @Get(':filename')
  async download(
    @Param('filename') filename: string,
      @Response({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    const [ext, fileName] = filename.split('.').reverse();
    if (!fileName || !ext) {
      throw new BadRequestException('잘못된 요청입니다.');
    }
    if (filename !== 'DefaultProfile.png') {
      const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
      if (regexExp.test(fileName) === false) {
        throw new BadRequestException('잘못된 요청입니다.');
      }
    }
    const file = createReadStream(join(process.cwd(), `upload-file/${filename}`));

    const openCheck = await new Promise<boolean>((resolve) => {
      file.on('open', () => {
        resolve(true);
      });
      file.on('error', () => {
        resolve(false);
      });
    });

    if (!openCheck) {
      throw new BadRequestException('잘못된 요청입니다.');
    }
    res.set({
      'content-type': contentType(ext),
    });
    return new StreamableFile(file);
  }
}
