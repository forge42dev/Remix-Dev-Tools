// adapted from https://github.com/radix-ui/primitives/blob/2f139a832ba0cdfd445c937ebf63c2e79e0ef7ed/packages/react/polymorphic/src/polymorphic.ts
// Big thanks to Jenna for the heavy lifting! https://github.com/jjenzz

import type * as React from "react";
import { forwardRef as React_forwardRef } from "react";

type Merge<P1 = {}, P2 = {}> = Omit<P1, keyof P2> & P2;

/**
 * Infers the OwnProps if E is a ForwardRefExoticComponentWithAs
 */
type OwnProps<E> = E extends ForwardRefComponent<any, infer P> ? P : {};

/**
 * Infers the JSX.IntrinsicElement if E is a ForwardRefExoticComponentWithAs
 */
type IntrinsicElement<E> =
  E extends ForwardRefComponent<infer I, any> ? I : never;

type ForwardRefExoticComponent<E, OwnProps> = React.ForwardRefExoticComponent<
  PropsWithAs<E, OwnProps>
>;

type PropsWithAs<E, OwnProps> = Merge<
  E extends React.ElementType ? React.ComponentPropsWithRef<E> : never,
  OwnProps & { as?: E }
>;

interface ForwardRefComponent<
  IntrinsicElementString,
  OwnProps = {},
  /*
   * Extends original type to ensure built in React types play nice with
   * polymorphic components still e.g. `React.ElementRef` etc.
   */
> extends ForwardRefExoticComponent<IntrinsicElementString, OwnProps> {
  /*
   * When `as` prop is passed, use this overload. Merges original own props
   * (without DOM props) and the inferred props from `as` element with the own
   * props taking precendence.
   *
   * We explicitly avoid `React.ElementType` and manually narrow the prop types
   * so that events are typed when using JSX.IntrinsicElements.
   */
  <As = IntrinsicElementString>(
    props: As extends ""
      ? { as: keyof JSX.IntrinsicElements }
      : As extends React.ComponentType<infer P>
        ? Merge<P, OwnProps & { as: As }>
        : As extends keyof JSX.IntrinsicElements
          ? Merge<JSX.IntrinsicElements[As], OwnProps & { as: As }>
          : never,
  ): React.ReactElement | null;
}

interface MemoComponent<IntrinsicElementString, OwnProps = {}>
  extends React.MemoExoticComponent<
    ForwardRefComponent<IntrinsicElementString, OwnProps>
  > {
  <As = IntrinsicElementString>(
    props: As extends ""
      ? { as: keyof JSX.IntrinsicElements }
      : As extends React.ComponentType<infer P>
        ? Merge<P, OwnProps & { as: As }>
        : As extends keyof JSX.IntrinsicElements
          ? Merge<JSX.IntrinsicElements[As], OwnProps & { as: As }>
          : never,
  ): React.ReactElement | null;
}

function forwardRef<OwnProps, TagName>(
  render: RenderFunction<OwnProps, TagName>,
) {
  return React_forwardRef(render) as ForwardRefComponent<TagName, OwnProps>;
}

interface RenderFunction<OwnProps, TagName> {
  (
    props: PropsWithAs<TagName, OwnProps>,
    ref: React.ForwardedRef<
      TagName extends keyof HTMLElementTagNameMap
        ? HTMLElementTagNameMap[TagName]
        : TagName extends keyof SVGElementTagNameMap
          ? SVGElementTagNameMap[TagName]
          : any
    >,
  ): React.ReactElement | null;
}

export { forwardRef };

export type {
  ForwardRefComponent,
  IntrinsicElement,
  MemoComponent,
  Merge,
  OwnProps,
  RenderFunction,
};
