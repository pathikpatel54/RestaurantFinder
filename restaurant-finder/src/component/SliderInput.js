import { useState } from "react";
import { createStyles, NumberInput, Slider, rem } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
  },

  input: {
    height: "auto",
    paddingTop: rem(22),
    paddingBottom: rem(3),
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },

  slider: {
    position: "absolute",
    width: "100%",
    bottom: rem(-1),
  },

  thumb: {
    width: rem(16),
    height: rem(16),
  },

  track: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },
}));

export function SliderInput({
  onChange,
  max,
  min,
  label,
  placeholder,
  step,
  value,
  error,
}) {
  const { classes } = useStyles();

  const handleChange = (newValue = "") => {
    onChange(newValue);
  };

  return (
    <div className={classes.wrapper}>
      <NumberInput
        value={value}
        onChange={handleChange}
        label={label}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        hideControls
        classNames={{ input: classes.input, label: classes.label }}
        error={error}
      />
      <Slider
        max={max}
        step={step}
        min={min}
        label={null}
        value={value === "" ? 0 : value}
        onChange={handleChange}
        size={2}
        radius={0}
        className={classes.slider}
        classNames={{ thumb: classes.thumb, track: classes.track }}
      />
    </div>
  );
}
