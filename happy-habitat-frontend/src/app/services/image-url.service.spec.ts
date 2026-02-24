import { TestBed } from '@angular/core/testing';
import { ImageUrlService } from './image-url.service';
import { environment } from '../../environments/environment';

describe('ImageUrlService', () => {
  let service: ImageUrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageUrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getImageUrl', () => {
    it('returns empty string for empty or whitespace path', () => {
      expect(service.getImageUrl('')).toBe('');
      expect(service.getImageUrl('   ')).toBe('');
    });

    it('returns URL as-is when path starts with http or https', () => {
      const url = 'https://example.com/image.jpg';
      expect(service.getImageUrl(url)).toBe(url);
      expect(service.getImageUrl('http://other.com/pic.png')).toBe('http://other.com/pic.png');
    });

    it('builds absolute URL from relative path using apiUrl base', () => {
      const base = (environment.apiUrl || '').replace(/\/api\/?$/, '');
      expect(service.getImageUrl('uploads/tickets/1/photo.jpg')).toBe(`${base}/uploads/tickets/1/photo.jpg`);
    });

    it('normalizes backslashes to forward slashes', () => {
      const base = (environment.apiUrl || '').replace(/\/api\/?$/, '');
      expect(service.getImageUrl('uploads\\tickets\\1\\photo.jpg')).toBe(`${base}/uploads/tickets/1/photo.jpg`);
    });
  });

  describe('uniqueFileName', () => {
    it('returns a string ending with original extension', () => {
      const result = service.uniqueFileName('photo.jpg');
      expect(result.endsWith('.jpg')).toBe(true);
      expect(service.uniqueFileName('doc.pdf').endsWith('.pdf')).toBe(true);
    });

    it('uses .jpg when original has no extension', () => {
      const result = service.uniqueFileName('noext');
      expect(result.endsWith('.jpg')).toBe(true);
    });

    it('returns different names for consecutive calls', () => {
      const a = service.uniqueFileName('a.jpg');
      const b = service.uniqueFileName('a.jpg');
      expect(a).not.toBe(b);
    });
  });
});
