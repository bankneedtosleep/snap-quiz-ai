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

export function OutlineButton({ className, children, ...props }: ButtonProps | LinkProps) {
  if ("href" in props && props.href) {
    return (
      <Link className={classNameFor("outline-button", className)} {...props}>
        {children}
      </Link>
    );
  }

  const buttonProps = { ...props };
  delete buttonProps.href;

  return (
    <button className={classNameFor("outline-button", className)} {...buttonProps}>
      {children}
    </button>
  );
}
