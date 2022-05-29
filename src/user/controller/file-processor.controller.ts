import {
  Controller, Get, HttpCode, HttpStatus,
  Logger,
  Post,
  Query, Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {mapToResponse} from "../../common/utils";
import {FileInterceptor} from "@nestjs/platform-express";
import * as UUID from "uuid";
import {Status} from "../../common/status";
import {ApiImplicitQuery} from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import {FileService} from "../service/file.service";
import * as path from 'path'
import * as os from "os";
import {RcxAuthGaurd} from "../../auth/guards/rcx-auth-gaurd";

@Controller('api/files')
@ApiBearerAuth('JWT')
export class FileProcessorController {
  private readonly logger = new Logger(FileProcessorController.name);

  constructor(private fileService: FileService) {
  }

  @Post("upload")
  @UseGuards(RcxAuthGaurd)
  @ApiTags("Files")
  @ApiOperation({summary: 'Upload files for IPX'})
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  async uploadCompanyPhoto(@UploadedFile() file) {
    const fileNameSplit = file.originalname.split('.');
    const fileExt = fileNameSplit[fileNameSplit.length - 1];
    let id = UUID.v4();
    let downloadUrl = '/api/files/download?id=' + id;
    //allowing any type of file to upload
    if (fileExt !== '') {
      const uploadFileName = (id + "_file." + fileExt);
      let uploadedDetails: any = await this.fileService.upload(file, uploadFileName);
      this.logger.log(uploadedDetails);
      return mapToResponse({
        fileId: id,
        fileName: uploadFileName,
        fileLocation: uploadedDetails.Location,
        ipxFileDownloadUrl: downloadUrl,
        message: "File uploaded successfully."
      }, false, Status.SUCCESS);
    }
    return mapToResponse({message: "File upload failed. Please try again."}, true, Status.FAILURE);
  }

  //DOWNLOAD
  @Get("download/files")
  @ApiTags("Files")
  @ApiOperation({summary: 'Download file by fileId'})
  @ApiImplicitQuery({name: 'fileId', required: true})
  @HttpCode(200)
  async downloadCompanyPhoto(@Res() res, @Query('fileId') fileId: string) {
    let fileNamePattern = fileId + '_file';
    await this.downloadAndReturnFile(res, fileNamePattern);
  }

  async downloadAndReturnFile(res: any, fileNamePattern: string) {
    try {
      let files = await this.fileService.listMatchingFiles(fileNamePattern);
      if (files && files.length <= 0) {
        res.status(HttpStatus.NOT_FOUND).send({
          statusCode: 404,
          status: 'BAD_REQUEST',
          message: "No file found for with file name pattern " + fileNamePattern,
          timestamp: new Date().toISOString()
        });
      }
      let fileName = '';
      if (files && files.length > 0)
        fileName = files[0];
      let tmpdir = os.tmpdir();
      let downloadPath = tmpdir + '/' + fileName;
      await this.fileService.download(fileName, tmpdir);
      return res.download(path.resolve(downloadPath));
    } catch (err) {
      this.logger.error(err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        statusCode: 500,
        status: 'INTERNAL_SERVER_ERROR',
        message: "Something went wrong while downloading. Please try again",
        timestamp: new Date().toISOString()
      });
    }
  }
}
