import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true  // ✅ Makes this a standalone pipe
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    // ✅ Bypasses Angular's security checks for trusted URLs
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
