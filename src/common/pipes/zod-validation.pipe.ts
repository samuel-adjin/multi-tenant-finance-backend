
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodType) { }

    transform(value: unknown, metadata: ArgumentMetadata) {
        try {

            const parsedValue = this.schema.parse(value);
            return parsedValue;
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: error.issues, 
                    statusCode: 400
                });
            }
            throw new BadRequestException('Validation failed');
        }
    }
}
