import * as React from "react";
import { Text, View, type TextProps, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("border bg-transparent", {
  variants: {
    variant: {
      default: "border-border",
      accent: "border-accent",
    },
    padding: {
      none: "",
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
    },
  },
  defaultVariants: { variant: "default", padding: "md" },
});

type CardVariantProps = VariantProps<typeof cardVariants>;

export interface CardProps extends ViewProps, CardVariantProps {
  className?: string;
}

export const Card = React.forwardRef<
  React.ComponentRef<typeof View>,
  CardProps
>(({ className, variant, padding, ...props }, ref) => (
  <View
    ref={ref}
    className={cn(cardVariants({ variant, padding }), className)}
    {...props}
  />
));
Card.displayName = "Card";

export interface CardHeaderProps extends ViewProps {
  className?: string;
}

export const CardHeader = React.forwardRef<
  React.ComponentRef<typeof View>,
  CardHeaderProps
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex-row items-center justify-between", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends TextProps {
  className?: string;
}

export const CardTitle = React.forwardRef<
  React.ComponentRef<typeof Text>,
  CardTitleProps
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn("text-base font-semibold text-text", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export interface CardContentProps extends ViewProps {
  className?: string;
}

export const CardContent = React.forwardRef<
  React.ComponentRef<typeof View>,
  CardContentProps
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn(className)} {...props} />
));
CardContent.displayName = "CardContent";

export { cardVariants };
