import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagManager } from './tag-manager';

describe('TagManager', () => {
  let component: TagManager;
  let fixture: ComponentFixture<TagManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided tags', () => {
    component.tags = ['Nové', 'Custom Tag'];
    
    expect(component.currentTags()).toEqual(['Nové', 'Custom Tag']);
  });

  it('should add predefined tag', () => {
    component.predefinedTagControl.setValue('Hotové');
    component.addPredefinedTag();
    
    expect(component.currentTags()).toContain('Hotové');
    expect(component.predefinedTagControl.value).toBe('');
  });

  it('should add custom tag', () => {
    component.customTagControl.setValue('Custom Tag');
    component.addCustomTag();
    
    expect(component.currentTags()).toContain('Custom Tag');
    expect(component.customTagControl.value).toBe('');
  });

  it('should remove tag', () => {
    component.currentTags.set(['Tag1', 'Tag2']);
    component.removeTag('Tag1');
    
    expect(component.currentTags()).toEqual(['Tag2']);
  });

  it('should not add duplicate tags', () => {
    component.currentTags.set(['Existing']);
    component.customTagControl.setValue('Existing');
    component.addCustomTag();
    
    expect(component.currentTags()).toEqual(['Existing']);
  });

  it('should filter available predefined tags', () => {
    component.currentTags.set(['Nové']);
    
    const available = component.availablePredefinedTags();
    expect(available).toEqual(['Rozpracované', 'Hotové']);
    expect(available).not.toContain('Nové');
  });

  it('should add custom tag on Enter key', () => {
    component.customTagControl.setValue('New Tag');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    
    component.addCustomTag(event);
    
    expect(component.currentTags()).toContain('New Tag');
  });

  it('should not add empty or whitespace-only tags', () => {
    component.customTagControl.setValue('   ');
    component.addCustomTag();
    
    expect(component.currentTags()).toEqual([]);
  });
});