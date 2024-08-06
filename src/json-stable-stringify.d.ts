declare module 'json-stable-stringify' {
  function stringify(obj: any, options?: { space?: number | string }): string;
  export default stringify;
}