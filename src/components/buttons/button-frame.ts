interface FrameLook {
  background: string;
  borderColor: string;
}

export const buttonFrame = (look: FrameLook, height: number) => ({
  height,
  backgroundColor: look.background,
  borderColor: look.borderColor,
});
