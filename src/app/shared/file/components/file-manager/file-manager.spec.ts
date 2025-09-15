import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileManager } from './file-manager';

describe('FileManager', () => {
  let component: FileManager;
  let fixture: ComponentFixture<FileManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove stored file', () => {
    component.storedFiles = ['file1.pdf', 'file2.jpg'];
    
    component.removeStoredFile('file1.pdf');
    
    expect(component.currentStoredFiles()).toEqual(['file2.jpg']);
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(0)).toBe('0 B');
    expect(component.formatFileSize(1024)).toBe('1.0 KB');
    expect(component.formatFileSize(1048576)).toBe('1.0 MB');
  });

  it('should extract filename from path', () => {
    expect(component.getFileName('uploads/123/test.pdf')).toBe('test.pdf');
    expect(component.getFileName('simple.jpg')).toBe('simple.jpg');
  });
});