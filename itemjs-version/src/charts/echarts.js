import * as echarts from 'echarts';

export function echartsContainer(containerElement, options) {
    const { echartsOptions, title = '', subtitle = '' } = options;

    // Clear existing bars
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
    chartElement.style.height = "400px";
    var chart = echarts.init(chartElement, null, {renderer: 'svg'});
    chart.setOption(echartsOptions);

    // Create footer
    const footer = document.createElement('p');
    footer.className = 'j1-chart-footer';
    footer.textContent = 'Chart: scotusstats.com';
    containerElement.appendChild(footer);

    window.addEventListener('resize', () => chart.resize());
}