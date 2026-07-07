// Tiny classnames helper -- avoids pulling in `clsx`/`tailwind-merge` for
// what is, in this project, always a short list of conditional class strings.
export const cn = (...classes) => classes.filter(Boolean).join(' ');
