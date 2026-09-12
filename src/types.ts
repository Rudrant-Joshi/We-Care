export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface FeatureHighlight {
  id: string;
  icon: 'workflow' | 'agents';
  title: string;
  subtitle: string;
}

export interface LiquidGlassConfig {
  blurAmount: number;
  glassOpacity: number;
  refractionIntensity: number;
  blueGlowIntensity?: number;
  amberGlowIntensity?: number;
  fluidAnimation: boolean;
  chromaticShift: boolean;
}
