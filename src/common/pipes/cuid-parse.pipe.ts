import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import z from 'zod';

@Injectable()
export class ParseCuidPipe implements PipeTransform<string, string> {
  private readonly cuidSchema = z.cuid();

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      console.log("cuid")
      const parsedValue = this.cuidSchema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new BadRequestException('Validation failed', error);
    }
  }
}



