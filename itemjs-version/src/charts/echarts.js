import * as echarts from 'echarts';

let allEcharts = {};

export function echartsContainer(containerElement, options) {
    const { echartsOptions, height = '400px', title = '', subtitle = '' } = options;

    // Clear existing chart
    if (allEcharts[containerElement.id]) {
        allEcharts[containerElement.id].dispose();
    }
    containerElement.innerHTML = '';
    

    // Create header
    if (title || subtitle) {
        const header = document.createElement('div');
        header.className = 'j1-chart-header';

        if (title) {
            const titleElement = document.createElement('h2');
            titleElement.className = 'j1-chart-title';
            titleElement.textContent = title;
            header.appendChild(titleElement);
        }

        if (subtitle) {
            const subtitleElement = document.createElement('p');
            subtitleElement.className = 'j1-chart-subtitle';
            subtitleElement.textContent = subtitle;
            header.appendChild(subtitleElement);
        }

        containerElement.appendChild(header);
    }

    const chartElement = document.createElement('div');
    containerElement.appendChild(chartElement);
    chartElement.style.width = "100%";
    chartElement.style.height = height;
    
    let chart = echarts.init(chartElement, null, {renderer: 'svg'});
    chart.setOption(echartsOptions);

    // Create footer
    const footer = document.createElement('p');
    footer.className = 'j1-chart-footer';
    footer.textContent = 'Chart: scotusstats.com';
    containerElement.appendChild(footer);

    // workaround a bug where only one of the charts will resize, so do one resize for all charts
    // https://github.com/apache/echarts/issues/13004
    // https://codepen.io/plainheart/pen/yLagoGW
    // https://github.com/apache/echarts/issues/7483
    function showChartDom(chart, visible) {
        chart.getZr().painter.getViewportRoot().style.display = visible ? "" : "none";
    }
    if (Object.keys(allEcharts).length === 0) {
        window.addEventListener('resize', () => {
            Object.values(allEcharts).forEach((chart) => showChartDom(chart, false));
            Object.values(allEcharts).forEach((chart) => chart.resize());
            Object.values(allEcharts).forEach((chart) => showChartDom(chart, true));
            console.log(allEcharts);
        });
    }

    allEcharts[containerElement.id] = chart;
}