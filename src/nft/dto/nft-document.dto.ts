import {ApiProperty} from "@nestjs/swagger";

export class NftDocumentDto {

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  description: string;

}
