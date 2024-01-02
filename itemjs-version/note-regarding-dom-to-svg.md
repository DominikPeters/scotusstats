In file `inline.js` of the package `dom-to-svg` (apparently unmaintained as of 2024) need to replace line 21 with
```
const elementHref = element.getAttribute('href') || element.getAttribute('xlink:href');
const blob = await withTimeout(10000, `Timeout fetching ${elementHref}`, () => fetchResource(elementHref));
```

see https://github.com/felixfbecker/dom-to-svg/pull/183/commits/919de8c862f3e85fa8496e147aa75cadc2e98edd