import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Shared = {
  children: ReactNode;
  className?: string;
};

type ButtonProps = Shared &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
  };

type LinkProps = Shared &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: string;
  };

function classNameFor(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

export function PrimaryButton(props: ButtonProps | LinkProps) {
  if ("href" in props && props.href) {
    const { className, children, ...linkProps } = props;
    return (
      <Link className={classNameFor("primary-button", className)} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { className, children, ...buttonProps } = props as ButtonProps;
  return (
    <button className={classNameFor("primary-button", className)} {...buttonProps}>
      {children}
    </button>
  );
}
