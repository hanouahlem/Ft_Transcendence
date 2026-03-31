import type { CSSProperties } from "react";

export const LOGIN_ACCENT_COLORS = [
  "var(--color-field-accent-blue)",
  "var(--color-field-accent-green)",
  "var(--color-field-accent-orange)",
];

const LOGIN_LAYOUT = {
  stageMaxWidth: "69rem",
  greenPanel: {
    top: "2.5rem",
    right: "1rem",
    bottom: "2.5rem",
    width: "65%",
  },
  paperCard: {
    left: "3rem",
    width: "50%",
    rotate: "-2deg",
  },
  leftBeads: {
    left: "0rem",
    top: "20%",
    shiftX: "50%",
  },
  signupStrip: {
    bottom: "-4rem",
  },
};

export const LOGIN_LAYOUT_VARS = {
  "--login-stage-max-width": LOGIN_LAYOUT.stageMaxWidth,
  "--login-green-top": LOGIN_LAYOUT.greenPanel.top,
  "--login-green-right": LOGIN_LAYOUT.greenPanel.right,
  "--login-green-bottom": LOGIN_LAYOUT.greenPanel.bottom,
  "--login-green-width": LOGIN_LAYOUT.greenPanel.width,
  "--login-paper-left": LOGIN_LAYOUT.paperCard.left,
  "--login-paper-width": LOGIN_LAYOUT.paperCard.width,
  "--login-paper-rotate": LOGIN_LAYOUT.paperCard.rotate,
  "--login-beads-left": LOGIN_LAYOUT.leftBeads.left,
  "--login-beads-top": LOGIN_LAYOUT.leftBeads.top,
  "--login-beads-shift-x": LOGIN_LAYOUT.leftBeads.shiftX,
  "--login-signup-bottom": LOGIN_LAYOUT.signupStrip.bottom,
} as CSSProperties;
