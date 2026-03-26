# eDash

A lightweight, themeable dashboard and charting library built on top of native CSS Grid Layout and [Apache ECharts](https://echarts.apache.org/). It is designed to make it effortless to create beautiful, responsive, and dynamic data dashboards using a modular tile system with built-in theme switching.

## Live Preview here https://dspasyuk.github.io/edash 

## Features
- **CSS Grid Layout**: Automatically handles the responsive flow of tiles of various sizes (micro, small, medium, large, etc.).
- **Dynamic Native Theming**: Switch between 5 distinct themes simultaneously changing the CSS Variables for standard DOM elements while intelligently forcing ECharts to re-render to match the active theme.
- **Pre-built KPI Tiles**: Easily drop in simple value indicators like Micro Tiles, Small Data Tiles, and Medium split-tiles.
- **Micro-Stacks**: Natively vertically stack micro-tiles into 2-column wide sets mimicking the sizing of standard grid tiles.
- **Declarative Chart Rendering**: Helper methods to instantly render interactive Bar charts, Pie/Doughnut charts, or arbitrarily complex custom ECharts options.

## Quick Start

### 1. Include Dependencies
Include `echarts`, the `edash.css` stylesheet, and the `edash.js` library.

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<link rel="stylesheet" href="./public/css/edash.css">
<script src="./public/js/edash.js"></script>
```

### 2. Initialize Container
Create a dedicated `<div>` in your HTML for the dashboard:

```html
<div id="my-dashboard"></div>
```

### 3. Build Your Dashboard
Use the `edash` class to instantiate the grid and add your content:

```javascript
// Initialize the dashboard in the 'my-dashboard' container with the 'default' theme
const dashboard = new edash('my-dashboard', 'default');

// Add some KPI tiles
dashboard.addSmallTile("Income", "$2M", "+12% vs last Q", "blue");
dashboard.addSmallTile("Deals", "41", "Top Sector: Health", "dark-green");

// Add a chart utilizing CSS Grid sizing classes (e.g. 'xlarge' spans 12 columns)
const mockData = {
    "2025-Q1": { "Materials": 12, "Health": 8 },
    "2025-Q2": { "Materials": 15, "Health": 10 }
};

dashboard.renderBarChart("Quarterly Projects", mockData, "Qtr", "xlarge");
```

---

## API Reference

### Initialization & Theming

#### `new edash(containerId, initialTheme)`
Creates a dashboard.
- `containerId` (String): The HTML `id` attribute of the wrapper element.
- `initialTheme` (String): The starting theme. Can be `default`, `dark`, `pastel`, `ocean`, or `sunset`.

#### `setTheme(themeName)`
Dynamically change the UI theme. Updates UI colors natively and forces all ECharts instances to re-render their SVGs with the new color tokens.
- `themeName` (String): Theme string name.

---

### UI Tiles

*Many tile methods accept an optional `colorClass` string which natively maps to a pre-defined palette in `j2p.css`. Available colors are `green`, `dark-green`, `grey`, `purple`, `dark-blue`, `blue`, `yellow`, `red`.*

#### `addMicroTile(title, value, [colorClass])`
Adds a very thin minimalist tile (spanning 2 columns horizontally, but with half the height of a small tile).

#### `addMicroStack(tilesArray)`
Adds multiple `MicroTiles` tightly stacked vertically so their combined footprint perfectly mimics the size footprint of a `.small` tile. Each element in the `tilesArray` must be an object: `{ title: "...", value: "...", colorClass: "..." }`.

#### `addSmallTile(title, value, [footerData], [colorClass])`
Adds a standard 2-column square KPI tile with a prominent headline value, a title, and an optional footer tag.

#### `addMediumTile(leftTitle, leftData, rightTitle, rightData, [footerData], [colorClass])`
Adds a slightly wider 3-column structured KPI tile splitting the value representation into two side-by-side components inside the same tile container.

---

### Charting
Charts are sized using string arguments passed to the `size` parameter. Available options include (but are not limited to): `small`, `medium`, `large` (span 6), `xlarge` (span 12), `xxlarge` (span 18 - full width), `long` (span 6, row span 2), `mslong`.

#### `renderBarChart(title, data, [xCategoryName], [size], [colors])`
Renders a multi-series Stacked Bar Chart.
- `title` (String): The tile title.
- `data` (Object): The object mapping containing X-Axis categories mapping to series items. Ex: `{"X_Label": {"Series_1": 10, "Series_2": 20}}`.
- `xCategoryName` (String): Text label for the bottom X-axis.
- `size` (String): A CSS Grid sizing token (default `'xlarge'`).
- `colors` (Object): Custom color mapping. E.g. `{"Materials": "var(--theme-blue)"}`.

#### `renderPieChart(title, data, [size], [isDoughnut], [colors])`
Renders a standard Pie Chart or empty-center Doughnut chart.
- `data` (Object): The Key-Value mapping for series. Ex: `{"Returning": 45, "New": 15}`.
- `isDoughnut` (Boolean): If set to true, it renders a Doughnut hole in the center. Default is `true`.

#### `renderGaugeChart(title, value, [size], [min], [max], [color])`
Renders a numeric Gauge chart displaying progress towards a maximum.
- `value` (Number): The current progress value.
- `min` (Number), `max` (Number): The gauge bounds (defaults to 0 and 100).
- `color` (String): Active color, ideally a known CSS Variable like `var(--theme-red)`.

#### `renderTreemapChart(title, data, [size], [colors])`
Renders a hierarchical Treemap layout showing proportional sizes.
- `data` (Object | Array): Key-Value pairs mapping names to sizes, or explicitly structured ECharts treemap nodes.

#### `renderSankeyChart(title, data, links, [size])`
Renders a flow/Sankey diagram showing relationships and bandwidth.
- `data` (Array): Nodes representing entities. Ex: `[{name: "Source"}, {name: "Target"}]`.
- `links` (Array): Valid connections between nodes. Ex: `[{source: "Source", target: "Target", value: 50}]`.

#### `renderCustomChart(title, option, [size])`
If you need highly specialized visual configuration, this method allows raw [ECharts Option Configuration Objects](https://echarts.apache.org/en/option.html) to be fed directly into an eDash tile wrapper.
- `option` (Object | Function): A plain JS object defining the ECharts Option, or a function resolving to one.

### Screenshots
<img width="1533" height="1284" alt="image" src="https://github.com/user-attachments/assets/7196879b-b9a6-4880-b380-9ece4f743aa0" />
<img width="1533" height="1284" alt="image" src="https://github.com/user-attachments/assets/a30dc5f3-a3e8-41bd-9544-d4dcda6e84ae" />
<img width="1533" height="1284" alt="image" src="https://github.com/user-attachments/assets/fd9535f3-a3a0-4768-ae48-53cfa8506c49" />
<img width="1533" height="1284" alt="image" src="https://github.com/user-attachments/assets/b2002ea1-0faa-4118-b17d-fb90c717166f" />
<img width="1533" height="1284" alt="image" src="https://github.com/user-attachments/assets/8be2ff46-ccef-46fd-91e6-ef9ae5db91d3" />

