// import * as echarts from './echarts.min.js';

let allEcharts = {};

export async function echartsContainer(containerElement, options) {
    const { echartsOptions, height = '400px', title = '', subtitle = '' } = options;

    // Clear existing chart
    if (allEcharts[containerElement.id]) {
        allEcharts[containerElement.id].dispose();
    }
    containerElement.innerHTML = '';
    
    const contentElement = document.createElement('div');
    contentElement.className = 'j1-chart-content';
    containerElement.appendChild(contentElement);

    // Create header
    if (title || subtitle) {
        const header = document.createElement('div');
        header.className = 'j1-chart-header';

        if (title) {
            const titleElement = document.createElement('h3');
            titleElement.className = 'j1-chart-title';
            titleElement.textContent = title;
            header.appendChild(titleElement);
        }

        if (subtitle) {
            const subtitleElement = document.createElement('p');
            subtitleElement.className = 'j1-chart-subtitle';
            subtitleElement.innerHTML = subtitle;
            header.appendChild(subtitleElement);
        }

        contentElement.appendChild(header);
    }

    const chartElement = document.createElement('div');
    contentElement.appendChild(chartElement);
    chartElement.style.width = "100%";
    chartElement.style.height = height;
    
    // Create footer
    const footer = document.createElement('p');
    footer.className = 'j1-chart-footer';
    footer.innerHTML = 'Chart: <a href="https://scotusstats.com/">scotusstats.com</a> ';
    contentElement.appendChild(footer);

    // webpack lazy load
    if (!window.isChartEmbed && !window.isChartSharePage) {
        var echarts = await import( /* webpackChunkName: "echarts" */
            './echarts.min.js'
        );
    } else {
        // has been loaded via <script> tag inserted by embed.php
        var echarts = window.echarts;
    }

    let chart = echarts.init(chartElement, null, {renderer: 'svg'});
    
    echartsOptions.textStyle = { fontFamily: 'Merriweather' };
    for (let axis of ['xAxis', 'yAxis']) {
        if (echartsOptions[axis]) {
            echartsOptions[axis].axisLine = { lineStyle: { color: window.darkMode ? '#aaa' : '#333' } };
        }
    }

    chart.setOption(echartsOptions);

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
        });
    }

    allEcharts[containerElement.id] = chart;
}