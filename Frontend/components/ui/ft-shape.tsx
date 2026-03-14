"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

const STATIC_SHAPES = [
  6, 8, 9, 10, 11, 12, 19, 20, 21, 25, 26, 27, 42, 43, 45, 49, 55, 56, 59,
  65, 66, 67, 68, 69,
]

const ROTATE_SHAPES = [
  1, 4, 21, 27, 28, 29, 33, 35, 36, 37, 39, 40, 46, 47, 48, 49, 51, 53, 59,
  68,
]

const COLORS = {
  orange: "var(--primary)",
  lime: "var(--secondary)",
  black: "var(--foreground)",
} as const

type ShapeColor = keyof typeof COLORS

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

type FtShapeProps = {
  rotate?: boolean
  color?: ShapeColor
  className?: string
} & React.ComponentProps<"div">

function FtShape({
  rotate = false,
  color,
  className,
  ...props
}: FtShapeProps) {
  const { src, fillColor, fixedRotation } = useMemo(() => {
    const pool = rotate ? ROTATE_SHAPES : STATIC_SHAPES
    const folder = rotate ? "shapes-rotate" : "shapes"
    const num = pickRandom(pool)
    const resolvedColor = color ?? pickRandom<ShapeColor>(["orange", "lime", "black"])
    const deg = rotate ? 0 : Math.floor(Math.random() * 360)

    return {
      src: `/${folder}/Shape ${num}.svg`,
      fillColor: COLORS[resolvedColor],
      fixedRotation: deg,
    }
  }, [rotate, color])

  return (
    <div
      className={cn("inline-block", className)}
      style={{
        transform: rotate ? undefined : `rotate(${fixedRotation}deg)`,
        animation: rotate ? "ft-shape-spin 12s linear infinite" : undefined,
      }}
      {...props}
    >
      <div
        style={{
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          backgroundColor: fillColor,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}

export { FtShape }
export type { ShapeColor }
