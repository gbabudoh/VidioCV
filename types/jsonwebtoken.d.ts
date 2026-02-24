declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    subject?: string;
    issuer?: string;
    jwtid?: string;
    noTimestamp?: boolean;
    header?: Record<string, any>;
    encoding?: string;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | (string | RegExp)[];
    clockTimestamp?: number;
    clockTolerance?: number;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    subject?: string;
    maxAge?: string | number;
  }

  export function sign(
    payload: Record<string, any>,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions
  ): Record<string, any>;
}
