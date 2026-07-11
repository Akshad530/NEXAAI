import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SunburstIconProps {
  size?: number;
  color?: string;
}

/**
 * Custom sunburst/spark icon — a distinct 10-petal radial mark.
 * Built from scratch in code (no image asset needed), so there's
 * nothing for Metro to fail resolving.
 */
export default function SunburstIcon({ size = 80, color = '#D97757' }: SunburstIconProps) {
  const petals = 10;
  const cx = 50;
  const cy = 50;
  const outerR = 46;
  const innerR = 6;
  const petalWidth = 6.5; // half-width of each petal base, in degrees

  const paths: string[] = [];

  for (let i = 0; i < petals; i++) {
    const angle = (360 / petals) * i;
    const a0 = ((angle - petalWidth) * Math.PI) / 180;
    const a1 = ((angle + petalWidth) * Math.PI) / 180;
    const aTip = (angle * Math.PI) / 180;

    // Vary petal length slightly for an organic, hand-drawn burst
    const lenR = i % 2 === 0 ? outerR : outerR * 0.68;

    const x0 = cx + innerR * Math.cos(a0);
    const y0 = cy + innerR * Math.sin(a0);
    const x1 = cx + innerR * Math.cos(a1);
    const y1 = cy + innerR * Math.sin(a1);
    const xTip = cx + lenR * Math.cos(aTip);
    const yTip = cy + lenR * Math.sin(aTip);

    paths.push(
      `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} Q ${xTip.toFixed(2)} ${yTip.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)} Z`
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {paths.map((d, idx) => (
        <Path key={idx} d={d} fill={color} />
      ))}
    </Svg>
  );
}
