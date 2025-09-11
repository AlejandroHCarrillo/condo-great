import { Component, input } from '@angular/core';

@Component({
  selector: 'show-form-error-template',
  imports: [],
  templateUrl: './show-form-error-template.component.html',
})
export class ShowFormErrorTemplateComponent {
  isValid = input<boolean|unknown|null|undefined>(false);
  errorMessage = input<string|unknown|null|undefined>('');
 }
