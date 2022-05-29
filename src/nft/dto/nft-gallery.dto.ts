import {ApiProperty} from "@nestjs/swagger";

export class NftGalleryDto {

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

}
