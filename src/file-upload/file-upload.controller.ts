import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  Res,
  Body,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
// TODO: The naming needs to be changed
import { FileUploadService } from './file-upload.service';

@Controller('csv')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Get('getDataJSON')
  async getDataJSON(@Res() response: Response) {
    try {
      const data = await this.fileUploadService.getDataJSON();
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      console.error(error);
      return response.status(HttpStatus.NOT_FOUND).send(error.message);
    }
  }

  @Get('getOneSheet/:title')
  async getOneSheet(@Param('title') title: string, @Res() response: Response) {
    try {
      const sheet = await this.fileUploadService.getOneSheet(title);
      return response.status(HttpStatus.OK).json(sheet);
    } catch (error) {
      console.error(error);
      return response.status(HttpStatus.NOT_FOUND).send(error.message);
    }
  }

  @Get('getDataCSV')
  async getDataCSV(@Res() response: Response) {
    try {
      const csvData = await this.fileUploadService.getDataCSV();
      response.setHeader('Content-Type', 'text/csv');
      response.setHeader(
        'Content-Disposition',
        'attachment; filename=data.csv',
      );
      return response.send(csvData);
    } catch (error) {
      console.error(error);
      return response.status(HttpStatus.NOT_FOUND).send(error.message);
    }
  }

  @Post('uploadCSV')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string, // Added title from body
    @Res() response: Response,
  ) {
    if (!file || !title) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('File or title is missing');
    }

    try {
      const jsonData = await this.fileUploadService.processFile(file, title);
      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'File uploaded successfully',
        data: jsonData,
      });
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('Error processing file: ' + error.message);
    }
  }

  @Post('uploadJSON')
  async uploadJSON(@Body() jsonData: any, @Res() response: Response) {
    try {
      const data = await this.fileUploadService.addDataJSON(jsonData);
      return response
        .status(HttpStatus.OK)
        .send({ success: true, message: 'JSON data added successfully', data });
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('Error processing file.');
    }
  }

  @Put('update/:title')
  async updateSheet(
    @Param('title') title: string,
    @Body() updateData: any, // Expecting JSON data in the request body
    @Res() response: Response,
  ) {
    if (!title || !updateData) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('Title or data is missing');
    }

    try {
      const updatedData = await this.fileUploadService.updateSheet(
        title,
        updateData,
      );
      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'Sheet updated successfully',
        data: updatedData,
      });
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('Error updating sheet: ' + error.message);
    }
  }

  @Delete('delete/:title')
  async deleteSheet(@Param('title') title: string, @Res() response) {
    try {
      const result = await this.fileUploadService.deleteSheet(title);
      if (result) {
        return response
          .status(200)
          .send({ message: 'Sheet deleted successfully' });
      } else {
        return response.status(404).send({ message: 'Sheet not found' });
      }
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('Error processing file.');
    }
  }
}
