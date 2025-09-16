
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseStringPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (typeof value !== 'string') {
            throw new BadRequestException(`Invalid ${metadata.data}: ${value}`);
        }
        return value;
    }
}
