import * as React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Colors } from "@/theme";

const buttonVariants = cva("flex-row items-center justify-start gap-2 px-5", {
  variants: {
    variant: {
      default: "bg-primary",
      destructive: "border-2 border-primary bg-transparent",
      outline: "border-2 border-text bg-transparent",
      secondary: "bg-secondary",
      ghost: "bg-transparent",
      link: "bg-transparent",
    },
    size: {
      default: "h-14",
      sm: "h-9 px-3",
      lg: "h-16",
      icon: "h-12 w-12 justify-center px-0",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

const buttonTextVariants = cva("font-ui-extrabold uppercase", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-primary",
      outline: "text-text",
      secondary: "text-secondary-foreground",
      ghost: "text-text",
      link: "text-primary underline",
    },
    size: {
      default: "text-[15px] tracking-[1.35px]",
      sm: "text-sm tracking-[1px]",
      lg: "text-[15px] tracking-[1.35px]",
      icon: "text-base",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;

const ICON_SIZE = 16;

const iconColorByVariant: Record<ButtonVariant, string> = {
  default: Colors.primaryForeground,
  destructive: Colors.primary,
  outline: Colors.text,
  secondary: Colors.secondaryForeground,
  ghost: Colors.text,
  link: Colors.primary,
};

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<PressableProps, "children" | "style">, ButtonVariantProps {
  children?: React.ReactNode;
  className?: string;
  textClassName?: string;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
}

const renderIcon = (
  icon: React.ReactElement | undefined,
  variant: ButtonVariant,
): React.ReactElement | null => {
  if (icon === undefined) {
    return null;
  }
  const props = icon.props as { size?: number; color?: string };
  return React.cloneElement(icon, {
    size: props.size ?? ICON_SIZE,
    color: props.color ?? iconColorByVariant[variant],
  } as Partial<typeof props>);
};

export const Button = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  ButtonProps
>(
  (
    {
      className,
      textClassName,
      variant,
      size,
      disabled,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    const resolvedVariant: ButtonVariant = variant ?? "default";
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled ?? false }}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant, size }),
          "active:opacity-80",
          disabled && "opacity-50",
          className,
        )}
        {...props}
      >
        {renderIcon(leftIcon, resolvedVariant)}
        {typeof children === "string" ? (
          <Text
            className={cn(buttonTextVariants({ variant, size }), textClassName)}
          >
            {children}
          </Text>
        ) : (
          children
        )}
        {renderIcon(rightIcon, resolvedVariant)}
      </Pressable>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants, buttonTextVariants };
