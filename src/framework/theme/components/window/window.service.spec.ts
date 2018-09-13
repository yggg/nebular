import { Component, ElementRef, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NB_DOCUMENT } from '../../theme.options';
import { NbThemeModule } from '../../theme.module';
import { NbOverlayContainerAdapter, NbOverlayModule } from '../cdk';
import { NbWindowModule } from './window.module';
import { NbWindowSize } from './window-types';
import { NbWindowService } from './window.service';
import createSpy = jasmine.createSpy;

const WINDOW_CONTENT = 'window content';
@Component({
  selector: 'nb-test-window',
  template: WINDOW_CONTENT,
})
class NbTestWindowComponent {}

@NgModule({
  declarations: [NbTestWindowComponent],
  entryComponents: [NbTestWindowComponent],
})
class NbTestWindowModule {}

let overlayContainerService: NbOverlayContainerAdapter;
let overlayContainer: HTMLElement;
let document: Document;
const queryBackdrop = () => overlayContainer.querySelector('.cdk-overlay-backdrop');
let windowService: NbWindowService;

describe('window-service', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NbThemeModule.forRoot({ name: 'default' }),
        NbOverlayModule.forRoot(),
        NbWindowModule.forRoot(),
        NbTestWindowModule,
      ],
    });
    windowService = TestBed.get(NbWindowService);
    overlayContainerService = TestBed.get(NbOverlayContainerAdapter);
    document = TestBed.get(NB_DOCUMENT);
  });

  beforeEach(() => {
    overlayContainer = document.createElement('div');
    overlayContainerService.setContainer(overlayContainer);
    document.body.appendChild(overlayContainer);
  });

  afterEach(() => {
    overlayContainerService.clearContainer();
    document.body.removeChild(overlayContainer);
  });

  it('should render window', () => {
    const windowRef = windowService.open(NbTestWindowComponent);
    windowRef.componentRef.changeDetectorRef.detectChanges();
    expect(windowRef.componentRef).toBeDefined();
    const windowElement: ElementRef<HTMLElement> = windowRef.componentRef.injector.get(ElementRef);

    expect(windowElement.nativeElement.innerText).toContain(WINDOW_CONTENT);
  });

  it('should set title', () => {
    const title = 'Window title';
    const windowRef = windowService.open(NbTestWindowComponent, { title });
    windowRef.componentRef.changeDetectorRef.detectChanges();
    const windowElement: ElementRef<HTMLElement> = windowRef.componentRef.injector.get(ElementRef);

    expect(windowElement.nativeElement.querySelector('.title').innerHTML).toEqual(title);
  });

  it('should set default size', () => {
    const windowRef = windowService.open(NbTestWindowComponent);
    windowRef.componentRef.changeDetectorRef.detectChanges();
    const windowElement: ElementRef<HTMLElement> = windowRef.componentRef.injector.get(ElementRef);

    expect(windowElement.nativeElement.querySelector('nb-card').classList).toContain('large-card');
  });

  it('should set size if provided', () => {
    const windowRef = windowService.open(NbTestWindowComponent, { size: NbWindowSize.SMALL });
    windowRef.componentRef.changeDetectorRef.detectChanges();
    const windowElement: ElementRef<HTMLElement> = windowRef.componentRef.injector.get(ElementRef);

    expect(windowElement.nativeElement.querySelector('nb-card').classList).toContain('small-card');
  });

  it('should render with backdrop if hasBackdrop is true', () => {
    const windowRef = windowService.open(NbTestWindowComponent, { hasBackdrop: true });
    windowRef.componentRef.changeDetectorRef.detectChanges();

    expect(queryBackdrop()).toBeTruthy();
  });

  it('should render without backdrop if hasBackdrop is false', () => {
    const windowRef = windowService.open(NbTestWindowComponent, { hasBackdrop: false });
    windowRef.componentRef.changeDetectorRef.detectChanges();

    expect(queryBackdrop().hasAttribute('hidden')).toBeTruthy();
  });

  it('should close on backdrop click if closeOnBackdropClick is true', () => {
    const closeSpy = createSpy('closeSpy');
    const windowRef = windowService.open(NbTestWindowComponent, { closeOnBackdropClick: true });
    windowRef.componentRef.changeDetectorRef.detectChanges();
    windowRef.onClose.subscribe(closeSpy);
    queryBackdrop().dispatchEvent(new Event('click'));

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should not close on backdrop click if closeOnBackdropClick is false', () => {
    const closeSpy = createSpy('closeSpy');
    const windowRef = windowService.open(NbTestWindowComponent, { closeOnBackdropClick: false });
    windowRef.componentRef.changeDetectorRef.detectChanges();
    windowRef.onClose.subscribe(closeSpy);
    queryBackdrop().dispatchEvent(new Event('click'));

    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('should close on escape press if closeOnEsc is true', () => {
    const closeSpy = createSpy('closeSpy');
    const windowRef = windowService.open(NbTestWindowComponent, { closeOnEsc: true });
    windowRef.componentRef.changeDetectorRef.detectChanges();
    windowRef.onClose.subscribe(closeSpy);
    document.body.dispatchEvent(new KeyboardEvent('keydown', <any> { keyCode: 27 }));

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should not close on escape press if closeOnEsc is false', () => {
    const closeSpy = createSpy('closeSpy');
    const windowRef = windowService.open(NbTestWindowComponent, { closeOnEsc: false });
    windowRef.componentRef.changeDetectorRef.detectChanges();
    windowRef.onClose.subscribe(closeSpy);
    document.body.dispatchEvent(new KeyboardEvent('keydown', <any> { keyCode: 27 }));

    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('should hide backdrop when window not in a full screen', () => {
    const windowRef = windowService.open(NbTestWindowComponent, { closeOnEsc: false });
    windowRef.componentRef.changeDetectorRef.detectChanges();
    expect(queryBackdrop().hasAttribute('hidden')).toBeFalsy();

    windowRef.minimize();
    windowRef.componentRef.changeDetectorRef.detectChanges();
    expect(queryBackdrop().hasAttribute('hidden')).toBeTruthy();

    windowRef.maximize();
    windowRef.componentRef.changeDetectorRef.detectChanges();
    expect(queryBackdrop().hasAttribute('hidden')).toBeTruthy();

    windowRef.fullScreen();
    windowRef.componentRef.changeDetectorRef.detectChanges();
    expect(queryBackdrop().hasAttribute('hidden')).toBeFalsy();
  });

  it('should keep backdrop while at least one full screen window is open', () => {
    const firstWindow = windowService.open(NbTestWindowComponent);
    const secondWindow = windowService.open(NbTestWindowComponent);
    firstWindow.componentRef.changeDetectorRef.detectChanges();
    secondWindow.componentRef.changeDetectorRef.detectChanges();
    expect(queryBackdrop().hasAttribute('hidden')).toBeFalsy();

    firstWindow.minimize();
    firstWindow.componentRef.changeDetectorRef.detectChanges();
    expect(queryBackdrop().hasAttribute('hidden')).toBeFalsy();

    secondWindow.minimize();
    secondWindow.componentRef.changeDetectorRef.detectChanges();
    expect(queryBackdrop().hasAttribute('hidden')).toBeTruthy();

    firstWindow.fullScreen();
    firstWindow.componentRef.changeDetectorRef.detectChanges();
    expect(queryBackdrop().hasAttribute('hidden')).toBeFalsy();
  });
});
