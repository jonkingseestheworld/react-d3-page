// Edit this file to control metadata for each plot in the nav menu and home page cards.
// Key: the Plot*.jsx filename without extension (e.g., 'Plot1')
// Value: object with label, description, tags, and thumbnail path

export const plotConfig = {
  Plot1: {
    label: 'D3 course learner summary',
    description: 'An interactive summary of D3.js course learners by country. Built with D3 for calculations and React for rendering.',
    tags: ['React', 'D3.js', 'Data Viz'],
    thumbnail: '/thumbnails/Plot1_thumbnail.png',
  },
  Plot2: {
    label: 'Economist Virus Barplot',
    description: 'Economist-style horizontal bar chart of infectious disease data, exploring D3 scales and responsive sizing.',
    tags: ['React', 'D3.js', 'Data Viz'],
    thumbnail: '/thumbnails/Plot2_thumbnail.png',
  },
  Plot3: {
    label: 'Gapminder Health x Wealth',
    description: 'Animated bubble chart recreating Hans Rosling\'s famous Gapminder visualisation of health vs. wealth over time.',
    tags: ['React', 'D3.js', 'Data Viz'],
    thumbnail: '/thumbnails/Plot3_thumbnail.png',
  },
  Plot4: {
    label: 'Global Energy Mix Dashboard',
    description: 'Multi-chart dashboard exploring global energy consumption by source, country, and year from 1965–2024.',
    tags: ['React', 'D3.js', 'Dashboard'],
    thumbnail: '/thumbnails/Plot4_thumbnail.png',
  },
  Plot5: {
    label: '[Placeholder!]',
    description: 'Coming soon.',
    tags: [],
    thumbnail: null,
  },
};

// Derived — keeps the hamburger nav working without changes
export const plotLabels = Object.fromEntries(
  Object.entries(plotConfig).map(([k, v]) => [k, v.label])
);
