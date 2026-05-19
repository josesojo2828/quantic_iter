import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';

@Injectable()
export class TemplateRendererService {
  render(template: string, context: any): string {
    const compiled = handlebars.compile(template);
    return compiled(context);
  }
}
