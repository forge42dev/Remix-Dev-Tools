import { type SVGProps } from "react";

import { type IconName } from "~/components/icons/names";
import spriteHref from "~/components/icons/sprite.svg";

export type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg {...props}>
      <use href={`${spriteHref}#${name}`} />
    </svg>
  );
}
