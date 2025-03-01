import chroma from 'chroma-js';
import colors from '@/assets/colors.json';

export function generateColors({
  yparse = [],
  tmpColorParse = [],
  highlightIndex = [],
  selectedPalette = '',
  reverseOrder = false,
}) {
  const colorParse = [];
  const colorHover = [];
  const palette = choosePalette(selectedPalette);

  // Si nécessaire, inverser l'ordre des données (divergentDescending)
  const adjustedYparse = reverseOrder ? [...yparse].reverse() : yparse;

  // Génération des couleurs pour chaque série de données
  for (let i = 0; i < adjustedYparse.length; i++) {
    const dataSet = adjustedYparse[i];
    let colors = [];
    let hoverColors = [];

    if (tmpColorParse[i]) {
      // Couleur personnalisée
      const color = tmpColorParse[i];
      const dataLength = dataSet && dataSet.length ? dataSet.length : 1;
      colors = Array(dataLength).fill(color);
      hoverColors = colors.map((c) => chroma(c).darken(0.8).hex());
    } else if (selectedPalette === 'neutral' && highlightIndex.length > 0 && Array.isArray(dataSet)) {
      // Palette neutre avec indices de surbrillance
      const dataLength = dataSet && dataSet.length ? dataSet.length : 1;
      for (let j = 0; j < dataLength; j++) {
        const color = highlightIndex.includes(j) ? getDefaultColor() : getNeutralColor();
        colors.push(color);
        hoverColors.push(chroma(color).darken(0.8).hex());
      }
    } else if (selectedPalette.startsWith('divergent')) {
      // Palette divergente (ascending/descending)
      const dataLength = dataSet && dataSet.length ? dataSet.length : 1;
      colors = Array(dataLength).fill(palette[i % palette.length]);
      hoverColors = colors.map((c) => chroma(c).darken(0.8).hex());
    } else if (selectedPalette === 'categorical' || !selectedPalette) {
      // Palette catégorique ou défaut
      const color = getColorsByIndex(i, palette);
      const dataLength = dataSet && dataSet.length ? dataSet.length : 1;
      colors = Array(dataLength).fill(color);
      hoverColors = colors.map((c) => chroma(c).darken(0.8).hex());
    } else {
      // Cas par défaut : génération de couleurs via une échelle
      const allDataValues = yparse.flat();
      const minValue = Math.min(...allDataValues);
      const maxValue = Math.max(...allDataValues);
      const colorScale = chroma.scale(palette).domain([maxValue, minValue]);
      const data = dataSet || [minValue];
      colors = data.map((value) => chroma(colorScale(value)).hex());
      hoverColors = colors.map((color) => chroma(color).darken(0.8).hex());
    }

    // Ajoute les couleurs générées pour cette série
    colorParse.push(colors);
    colorHover.push(hoverColors);
  }

  // Gestion des couleurs de légende
  const legendColors = reverseOrder ? colorParse.map((c) => c[0]).reverse() : colorParse.map((c) => c[0]);

  return {
    colorParse,
    colorHover,
    legendColors,
  };
}

export function generateBarLineChartColors({
  vlineParse = [],
  hlineParse = [],
  tmpVlineColorParse = [],
  tmpHlineColorParse = [],
  selectedPalette = '',
}) {
  const palette = choosePalette(selectedPalette);

  const colorBarParse = getColorsByIndex(0, palette);
  const colorBarHover = chroma(colorBarParse).darken(0.8).hex();

  const colorParse = getColorsByIndex(1, palette);
  const colorHover = chroma(colorParse).darken(0.8).hex();

  const vlineColorParse = vlineParse.map((_, i) => (tmpVlineColorParse[i] || getNeutralColor()));

  const hlineColorParse = hlineParse.map((_, i) => (tmpHlineColorParse[i] || getNeutralColor()));

  return {
    colorBarParse,
    colorBarHover,
    colorParse,
    colorHover,
    vlineColorParse,
    hlineColorParse,
  };
}

export function generateScatterChartColors({
  yparse = [],
  tmpColorParse = [],
  selectedPalette = '',
  highlightIndex = -1,
  vlineParse = [],
  tmpVlineColorParse = [],
  hlineParse = [],
  tmpHlineColorParse = [],
}) {
  const palette = choosePalette(selectedPalette);

  // Génération des couleurs pour les séries
  const colorParse = [];
  const colorHover = [];
  for (let i = 0; i < yparse.length; i++) {
    let color;

    if (tmpColorParse[i]) {
      color = tmpColorParse[i];
    } else if (i === highlightIndex) {
      color = getNeutralColor(); // Couleur par défaut pour la mise en avant
    } else {
      color = getColorsByIndex(i, palette);
    }

    colorParse.push(color);
    colorHover.push(chroma(color).darken(0.8).hex());
  }

  // Génération des couleurs pour les lignes verticales
  const vlineColorParse = vlineParse.map((_, i) => (tmpVlineColorParse[i] || getNeutralColor()));

  // Génération des couleurs pour les lignes horizontales
  const hlineColorParse = hlineParse.map((_, i) => (tmpHlineColorParse[i] || getNeutralColor()));

  return {
    colorParse,
    colorHover,
    vlineColorParse,
    hlineColorParse,
  };
}

function getThemeColors() {
  const currentTheme = document.documentElement.getAttribute('data-fr-theme') || 'light';
  return colors[currentTheme] || colors['light'];
}

export function getCategoricalPalette() {
  const themeColors = getThemeColors();
  return [
    themeColors['dsfr-chart-colors-01'],
    themeColors['dsfr-chart-colors-02'],
    themeColors['dsfr-chart-colors-03'],
    themeColors['dsfr-chart-colors-04'],
    themeColors['dsfr-chart-colors-05'],
    themeColors['dsfr-chart-colors-06'],
    themeColors['dsfr-chart-colors-07'],
    themeColors['dsfr-chart-colors-08'],
  ];
}

// Palettes séquentielles
export function getSequentialAscending() {
  const themeColors = getThemeColors();
  return chroma.scale([
    themeColors['dsfr-chart-colors-09'],
    themeColors['dsfr-chart-colors-10'],
  ]).colors(10);
}

export function getSequentialDescending() {
  const themeColors = getThemeColors();
  return chroma.scale([
    themeColors['dsfr-chart-colors-10'],
    themeColors['dsfr-chart-colors-09'],
  ]).colors(10);
}

export function getDivergentAscending() {
  const themeColors = getThemeColors();
  return chroma.scale([
    themeColors['dsfr-chart-colors-11'],
    themeColors['dsfr-chart-colors-13'],
    themeColors['dsfr-chart-colors-15'],
  ]).colors(4);
}

export function getDivergentDescending() {
  const themeColors = getThemeColors();
  return chroma.scale([
    themeColors['dsfr-chart-colors-15'],
    themeColors['dsfr-chart-colors-13'],
    themeColors['dsfr-chart-colors-11'],
  ]).colors(4);
}

export function getColorsByIndex(index, palette = getCategoricalPalette()) {
  return palette[index % palette.length];
}

export function getDefaultColor() {
  const themeColors = getThemeColors();
  return themeColors['dsfr-chart-colors-default'];
}

export function getNeutralColor() {
  const themeColors = getThemeColors();
  return themeColors['dsfr-chart-colors-neutral'];
}

export function choosePalette(selectedPalette) {
  switch (selectedPalette) {
    case 'default':
      return [getDefaultColor()];
    case 'neutral':
      return [getNeutralColor()];
    case 'categorical':
      return getCategoricalPalette();
    case 'sequentialAscending':
      return getSequentialAscending();
    case 'sequentialDescending':
      return getSequentialDescending();
    case 'divergentAscending':
      return getDivergentAscending();
    case 'divergentDescending':
      return getDivergentDescending();
    default:
      return getCategoricalPalette();
  }
}
