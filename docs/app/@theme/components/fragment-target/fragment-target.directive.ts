import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs';
import { takeWhile, publish, refCount, filter, tap, debounce } from 'rxjs/operators';
import { NB_WINDOW, NbLayoutScrollService } from '@nebular/theme';
import { NgdVisibilityService } from '../../../@theme/services';

const OBSERVER_OPTIONS = { rootMargin: '-30% 0px -50%' };

@Directive({
  selector: '[ngdFragment]',
})
export class NgdFragmentTargetDirective implements OnInit, OnDestroy {

  private readonly marginFromTop = 120;
  private visible: boolean = false;
  private isScrolling: boolean = false;
  private alive = true;

  @Input() ngdFragment: string;
  @Input() ngdFragmentClass: string;
  @Input() ngdFragmentSync: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(NB_WINDOW) private window,
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId,
    private visibilityService: NgdVisibilityService,
    private scrollService: NbLayoutScrollService,
  ) {}

  ngOnInit() {
    this.activatedRoute.fragment
      .pipe(
        publish(null),
        refCount(),
        takeWhile(() => this.alive),
        filter(() => this.ngdFragmentSync),
      )
      .subscribe((fragment: string) => {
        if (fragment && this.ngdFragment === fragment) {
          this.selectFragment();
        } else {
          this.deselectFragment();
        }
      });

    this.visibilityService.observe(this.el.nativeElement, OBSERVER_OPTIONS)
      .pipe(
        takeWhile(() => this.alive),
        tap((e: IntersectionObserverEntry) => console.info(`${this.ngdFragment} - ${e.isIntersecting}`)),
      )
      .subscribe((entry: IntersectionObserverEntry) => this.onVisibilityChange(entry));

    this.scrollService.onScroll()
      .pipe(
        takeWhile(() => this.alive),
        tap(() => this.isScrolling = true),
        debounce(() => timer(100)),
      )
      .subscribe(() => this.isScrolling = false);
  }

  selectFragment() {
    this.ngdFragmentClass && this.renderer.addClass(this.el.nativeElement, this.ngdFragmentClass);

    const shouldScroll = !this.visible || !this.isScrolling;
    if (shouldScroll) {
      this.window.scrollTo(0, this.el.nativeElement.offsetTop - this.marginFromTop);
    }
  }

  deselectFragment() {
    this.renderer.removeClass(this.el.nativeElement, this.ngdFragmentClass);
  }

  onVisibilityChange(entry: IntersectionObserverEntry) {
    this.visible = entry.isIntersecting;

    const urlFragment = this.activatedRoute.snapshot.fragment;
    const alreadyThere = urlFragment && urlFragment.includes(this.ngdFragment);
    if (this.visible && !alreadyThere) {
      this.router.navigate([], { fragment: this.ngdFragment, replaceUrl: true });
    }
  }

  ngOnDestroy() {
    this.alive = false;
    this.visibilityService.unobserve(this.el.nativeElement, OBSERVER_OPTIONS);
  }
}
