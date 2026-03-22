class edash {
    constructor(containerId, theme = 'default') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`edash: Container with id '${containerId}' not found.`);
            return;
        }
        this.container = container;
        this.charts = [];
        this.chartRecords = [];

        this.grid = document.createElement('div');
        this.grid.className = 'container-dashboard';
        this.container.appendChild(this.grid);

        this.setTheme(theme);

        window.addEventListener('resize', () => {
            this.charts.forEach(chart => chart.resize());
        });
    }

    setTheme(themeName) {
        this.themeId = themeName;
        this.echartsTheme = themeName === 'dark' ? 'dark' : null;
        document.documentElement.setAttribute('data-theme', themeName);
        
        // Use a tiny timeout to ensure the browser has computed the new CSS variables on documentElement
        // before we query them for the ECharts canvas paint logic!
        setTimeout(() => {
            this.reRenderAll();
        }, 50);
    }

    _resolveColor(c) {
        if (c && c.startsWith('var(')) {
            const match = c.match(/var\(([^)]+)\)/);
            if (match) {
                return getComputedStyle(document.documentElement).getPropertyValue(match[1].trim()).trim();
            }
        }
        return c;
    }

    reRenderAll() {
        this.charts.forEach(chart => chart.dispose());
        this.charts = [];
        
        this.chartRecords.forEach(record => {
            const chart = echarts.init(record.container, this.echartsTheme, { renderer: 'svg' });
            chart.setOption(record.buildOption());
            this.charts.push(chart);
        });
    }

    addMicroTile(title, value, colorClass = 'green') {
        const tile = document.createElement('div');
        tile.className = `tile micro`;
        tile.style.display = 'flex';
        tile.style.alignItems = 'stretch';
 
        tile.innerHTML = `
            <div class="left ${colorClass}" style="height: 100%; display: flex; align-items: center; justify-content: center; padding-top: 0;">${title}</div>
            <div class="right text${colorClass}" style="height: 100%; display: flex; align-items: center; justify-content: center; padding-top: 0;">${value}</div>
        `;
        this.grid.appendChild(tile);
        return tile;
    }

    addMicroStack(tiles) {
        const stack = document.createElement('div');
        stack.className = 'micro-stack';
        
        tiles.forEach(t => {
            const tile = document.createElement('div');
            tile.className = 'tile micro';
            tile.style.display = 'flex';
            tile.style.alignItems = 'stretch';
            tile.innerHTML = `
                <div class="left ${t.colorClass || 'green'}" style="height: 100%; display: flex; align-items: center; justify-content: center; padding-top: 0;">${t.title}</div>
                <div class="right text${t.colorClass || 'green'}" style="height: 100%; display: flex; align-items: center; justify-content: center; padding-top: 0;">${t.value}</div>
            `;
            stack.appendChild(tile);
        });

        this.grid.appendChild(stack);
        return stack;
    }

    addSmallTile(title, value, footerData = '', colorClass = 'green') {
        const tile = document.createElement('div');
        tile.className = `tile small`;
        tile.innerHTML = `
            <div class="tile_header ${colorClass}">
                <div class="tile_title">${title}</div>
                <div class="tile_headerdata">${value}</div>
            </div>
            ${footerData ? `
            <div class="tile_bodyfooter">
                <div class="tile_title text${colorClass}">${footerData}</div>
            </div>` : ''}
        `;
        this.grid.appendChild(tile);
        return tile;
    }

    addMediumTile(leftTitle, leftData, rightTitle, rightData, footerData = '', colorClass = 'green') {
        const tile = document.createElement('div');
        tile.className = `tile medium`;
        tile.innerHTML = `
            <div class="tile_header ${colorClass}" style="display: flex; align-items: center;">
                <div class="left" style="flex: 1;">
                    <div class="tile_title">${leftTitle}</div>
                    <div class="tile_headerdata">${leftData}</div>
                </div>
                <div class="right" style="flex: 1;">
                    <div class="tile_title">${rightTitle}</div>
                    <div class="tile_headerdata">${rightData}</div>
                </div>
            </div>
            ${footerData ? `
            <div class="tile_bodyfooter">
                <div class="tile_title text${colorClass}">${footerData}</div>
            </div>` : ''}
        `;
        this.grid.appendChild(tile);
        return tile;
    }

    _addChartContainer(title, size) {
        const tile = document.createElement('div');
        tile.className = `tile ${size} blanc`; 
        tile.style.display = 'flex';
        tile.style.flexDirection = 'column';
        
        let containerHTML = "";
        if (title) {
            containerHTML += `
            <div class="tile_title large_title" style="flex: 0 0 auto;">
                <div class="tile_title">${title}</div>
            </div>`;
        }
        
        const chartDiv = document.createElement('div');
        chartDiv.className = 'jp_chart_container';
        chartDiv.style.flex = '1 1 auto';
        chartDiv.style.width = '100%';
        chartDiv.style.minHeight = '0';
        
        tile.innerHTML = containerHTML;
        tile.appendChild(chartDiv);
        
        this.grid.appendChild(tile);
        return chartDiv;
    }

    renderBarChart(title, data, xCategoryName = '', size = 'xlarge', colors = null) {
        const container = this._addChartContainer(title, size);
        
        const buildOption = () => {
            const xAxisData = Object.keys(data);
            const seriesNames = new Set();
            xAxisData.forEach(x => {
                Object.keys(data[x]).forEach(s => seriesNames.add(s));
            });
            
            const series = Array.from(seriesNames).map(name => {
                const s = {
                    name: name,
                    type: 'bar',
                    stack: 'total',
                    data: xAxisData.map(x => data[x][name] || 0)
                };
                if (colors && colors[name]) {
                    s.itemStyle = { color: this._resolveColor(colors[name]) };
                }
                return s;
            });

            return {
                backgroundColor: 'transparent',
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { data: Array.from(seriesNames), type: 'scroll', top: 5, left: '10%', right: '80px' },
                grid: { left: '3%', right: '4%', bottom: '10%', top: '20%', containLabel: true },
                toolbox: {
                    show: true,
                    right: 15,
                    feature: {
                        dataView: { readOnly: false },
                        magicType: { type: ['line', 'bar'] },
                        saveAsImage: { type: 'svg' }
                    }
                },
                xAxis: { type: 'category', data: xAxisData, name: xCategoryName, nameLocation: 'middle', nameGap: 25 },
                yAxis: { type: 'value' },
                series: series
            };
        };

        setTimeout(() => {
            const chart = echarts.init(container, this.echartsTheme, { renderer: 'svg' });
            chart.setOption(buildOption());
            this.charts.push(chart);
            this.chartRecords.push({ container, buildOption });
        }, 100); // 100ms timeout on init accommodates the CSS var flush cleanly!
    }

    renderPieChart(title, data, size = 'large', isDoughnut = true, colors = null) {
        const container = this._addChartContainer(title, size);
        
        const buildOption = () => {
            const seriesData = Object.entries(data).map(([name, value]) => {
                const item = { name, value };
                if (colors && colors[name]) {
                    item.itemStyle = { color: this._resolveColor(colors[name]) };
                }
                return item;
            });

            return {
                backgroundColor: 'transparent',
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: { type: 'scroll', top: 5, left: '10%', right: '80px' },
                toolbox: {
                    show: true,
                    right: 15,
                    feature: {
                        dataView: { readOnly: false },
                        saveAsImage: { type: 'svg' }
                    }
                },
                series: [
                    {
                        name: title,
                        type: 'pie',
                        radius: isDoughnut ? ['40%', '70%'] : '70%',
                        center: ['50%', '55%'],
                        itemStyle: {
                            borderRadius: isDoughnut ? 5 : 0,
                            borderColor: 'transparent',
                            borderWidth: 2
                        },
                        data: seriesData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
        };

        setTimeout(() => {
            const chart = echarts.init(container, this.echartsTheme, { renderer: 'svg' });
            chart.setOption(buildOption());
            this.charts.push(chart);
            this.chartRecords.push({ container, buildOption });
        }, 100);
    }

    renderGaugeChart(title, value, size = 'small', min = 0, max = 100, color = 'var(--theme-green)') {
        const container = this._addChartContainer(title, size);
        
        const buildOption = () => {
            return {
                backgroundColor: 'transparent',
                tooltip: { formatter: '{a} <br/>{b} : {c}' },
                toolbox: {
                    show: true,
                    right: 15,
                    feature: { saveAsImage: { type: 'svg' } }
                },
                series: [
                    {
                        name: title,
                        type: 'gauge',
                        min: min,
                        max: max,
                        radius: '90%',
                        center: ['50%', '55%'],
                        title: { show: false },
                        progress: {
                            show: true,
                            width: 15,
                            itemStyle: { color: this._resolveColor(color) }
                        },
                        pointer: {
                            show: true,
                            itemStyle: { color: this._resolveColor(color) }
                        },
                        axisLine: {
                            lineStyle: { 
                                width: 15,
                                color: [[1, 'rgba(200, 200, 200, 0.25)']] 
                            }
                        },
                        axisTick: {
                            distance: -25,
                            length: 8,
                            lineStyle: { color: '#999', width: 1 }
                        },
                        splitLine: {
                            distance: -25,
                            length: 12,
                            lineStyle: { color: '#999', width: 2 }
                        },
                        axisLabel: {
                            distance: -15,
                            color: '#999',
                            fontSize: 12
                        },
                        detail: {
                            valueAnimation: true,
                            formatter: '{value}',
                            color: 'inherit',
                            fontSize: 40,
                            fontWeight: 'bold',
                            offsetCenter: [0, '60%']
                        },
                        data: [{ value: value }]
                    }
                ]
            };
        };

        setTimeout(() => {
            const chart = echarts.init(container, this.echartsTheme, { renderer: 'svg' });
            chart.setOption(buildOption());
            this.charts.push(chart);
            this.chartRecords.push({ container, buildOption });
        }, 100);
    }

    renderTreemapChart(title, data, size = 'large', colors = null) {
        const container = this._addChartContainer(title, size);
        
        const buildOption = () => {
            let seriesData = [];
            if (Array.isArray(data)) {
                seriesData = data;
            } else {
                seriesData = Object.entries(data).map(([name, value]) => {
                    const item = { name, value };
                    if (colors && colors[name]) {
                        item.itemStyle = { color: this._resolveColor(colors[name]) };
                    }
                    return item;
                });
            }

            return {
                backgroundColor: 'transparent',
                tooltip: { trigger: 'item', formatter: '{b}: {c}' },
                toolbox: {
                    show: true,
                    right: 15,
                    feature: { saveAsImage: { type: 'svg' } }
                },
                series: [{
                    type: 'treemap',
                    name: title,
                    data: seriesData,
                    label: { show: true, formatter: "{b}\n{c}" },
                    itemStyle: { gapWidth: 2 }
                }]
            };
        };

        setTimeout(() => {
            const chart = echarts.init(container, this.echartsTheme, { renderer: 'svg' });
            chart.setOption(buildOption());
            this.charts.push(chart);
            this.chartRecords.push({ container, buildOption });
        }, 100);
    }

    renderSankeyChart(title, data, links, size = 'xlarge') {
        const container = this._addChartContainer(title, size);
        
        const buildOption = () => {
            return {
                backgroundColor: 'transparent',
                tooltip: { trigger: 'item', triggerOn: 'mousemove' },
                toolbox: {
                    show: true,
                    right: 15,
                    feature: { saveAsImage: { type: 'svg' } }
                },
                series: [{
                    type: 'sankey',
                    name: title,
                    data: data,
                    links: links,
                    emphasis: { focus: 'adjacency' },
                    lineStyle: {
                        color: 'source',
                        curveness: 0.5
                    },
                    label: {
                        color: 'var(--theme-title-text)'
                    }
                }]
            };
        };

        setTimeout(() => {
            const chart = echarts.init(container, this.echartsTheme, { renderer: 'svg' });
            chart.setOption(buildOption());
            this.charts.push(chart);
            this.chartRecords.push({ container, buildOption });
        }, 100);
    }

    renderCustomChart(title, option, size = 'large') {
        const container = this._addChartContainer(title, size);
        
        const buildOption = () => {
            if (typeof option === 'function') {
                return option();
            }
            return option;
        };

        setTimeout(() => {
            const chart = echarts.init(container, this.echartsTheme, { renderer: 'svg' });
            chart.setOption(buildOption());
            this.charts.push(chart);
            this.chartRecords.push({ container, buildOption });
        }, 100);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = edash;
} else if (typeof window !== 'undefined') {
    window.edash = edash;
}
