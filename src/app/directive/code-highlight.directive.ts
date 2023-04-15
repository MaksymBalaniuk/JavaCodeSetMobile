import {AfterViewInit, Directive} from '@angular/core';

@Directive({
  selector: '[appCodeHighlight]'
})
export class CodeHighlightDirective implements AfterViewInit {

  constructor() { }

  ngAfterViewInit(): void {
    (<any>window).Rainbow.color();
  }
}
