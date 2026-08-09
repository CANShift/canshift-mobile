import * as React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../alert-dialog";

interface HarnessProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (next: boolean) => void;
  onAction?: () => void;
  onCancel?: () => void;
}

const Harness = ({
  open,
  defaultOpen,
  onOpenChange,
  onAction,
  onCancel,
}: HarnessProps): React.ReactElement => {
  return (
    <AlertDialog
      {...(open !== undefined && { open })}
      {...(defaultOpen !== undefined && { defaultOpen })}
      {...(onOpenChange !== undefined && { onOpenChange })}
    >
      <AlertDialogTrigger>
        <Text>Open</Text>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onPress={onAction}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

describe("AlertDialog", () => {
  it("opens the content when the trigger is pressed", async () => {
    const { getByText, queryByText } = await render(<Harness />);
    expect(queryByText("Are you sure?")).toBeNull();
    await fireEvent.press(getByText("Open"));
    expect(getByText("Are you sure?")).toBeTruthy();
    expect(getByText("This action cannot be undone.")).toBeTruthy();
  });

  it("calls the action handler and closes when action is pressed", async () => {
    const onAction = jest.fn();
    const { getByText, queryByText } = await render(
      <Harness defaultOpen onAction={onAction} />,
    );
    await fireEvent.press(getByText("Delete"));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(queryByText("Are you sure?")).toBeNull();
  });

  it("calls the cancel handler and closes when cancel is pressed", async () => {
    const onCancel = jest.fn();
    const { getByText, queryByText } = await render(
      <Harness defaultOpen onCancel={onCancel} />,
    );
    await fireEvent.press(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(queryByText("Are you sure?")).toBeNull();
  });

  it("reflects controlled state via onOpenChange", async () => {
    const onOpenChange = jest.fn();
    const { getByText } = await render(
      <Harness open={false} onOpenChange={onOpenChange} />,
    );
    await fireEvent.press(getByText("Open"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
