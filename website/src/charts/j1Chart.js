
export async function j1Chart(containerElement, options) {
    const {
        data,
        maxDataValue,
        tooltips,
        sort = true, 
        dataFormatter = (v) => parseInt(v), 
        dataSuffix = '', 
        // chartColor = '#4CAF50',
        chartColor = 'hsl(216, 42%, 50%)',
        showImage = true, 
        customImages = undefined,
        title = '', 
        subtitle = '' 
    } = options;

    // Function to create a bar
    function createBar(labelText, value, tooltip) {
        const bar = document.createElement('div');
        bar.className = 'j1-bar';

        // Bar description
        const description = document.createElement('div');
        description.className = 'j1-bar-description';
        if (showImage && customImages && customImages[labelText]) {
            const image = document.createElement('img');
            image.src = customImages[labelText];
            image.alt = 'Picture of ' + labelText;
            image.className = 'j1-circle-image';
            image.onerror = () => {
                image.src = `/img/generic.png`;
                image.alt = 'Missing picture';
            }
            image.loading = 'lazy';
            description.appendChild(image);
        } else if (showImage) {
            const image = document.createElement('img');
            image.src = `/img/justices/${labelText}.png`;
            image.alt = 'Picture of Justice ' + labelText;
            image.className = 'j1-circle-image';
            description.appendChild(image);
        }
        const name = document.createElement('span');
        name.innerHTML = labelText;
        description.appendChild(name);

        // Bar fill container
        const fillContainer = document.createElement('div');
        fillContainer.className = 'j1-bar-fill-container';

        if (tooltip) {
            tippy.default(fillContainer, { content: tooltip, allowHTML: true });
        }

        // Bar fill
        const fill = document.createElement('div');
        fill.className = 'j1-bar-fill';

        // Bar label
        const label = document.createElement('span');
        label.className = 'j1-bar-label';
        label.setAttribute('data-value', value);

        fillContainer.appendChild(fill);
        fillContainer.appendChild(label);
        bar.appendChild(description);
        bar.appendChild(fillContainer);
        contentElement.appendChild(bar);
    }

    // Clear existing bars
    containerElement.innerHTML = '';

    containerElement.style.setProperty('--j1-chart-color', chartColor);

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
            subtitleElement.textContent = subtitle;
            header.appendChild(subtitleElement);
        }

        contentElement.appendChild(header);
    }

    // Create footer
    const footer = document.createElement('p');
    footer.className = 'j1-chart-footer';
    footer.innerHTML = 'Chart: <a href="https://scotusstats.com/">scotusstats.com</a> ';
    contentElement.appendChild(footer);

    // load tippy
    if (!window.isChartEmbed && !window.isChartSharePage) {
        var tippy = await import( /* webpackChunkName: "tippy" */
            'tippy.js'
        );
    // } else if (window.isChartSharePage) {
    } else {
        var tippy = undefined;
    }

    // Create bars
    // zip, noting that tooltips are optional
    const zipped = Object.keys(data).map((key, i) => [key, data[key], tooltips ? tooltips[key] : undefined]);

    if (sort) {
        zipped.sort((a, b) => b[1] - a[1]);
    }

    zipped.forEach(([key, value, tooltip]) => {
        createBar(key, value, tooltip);
    });

    // Adjust labels and bar widths
    function adjustLabels() {
        let maxDescriptionWidth = 0;
        const maxValue = maxDataValue || Math.max(...Object.values(data));

        // get screen width
        const width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        containerElement.querySelectorAll('.j1-group-members-text').forEach(text => {
            text.style.display = width < 950 ? 'none' : 'inline';
        });

        // First pass
        containerElement.querySelectorAll('.j1-bar').forEach(bar => {
            const description = bar.querySelector('.j1-bar-description');
            description.style.width = 'auto';
            maxDescriptionWidth = Math.max(maxDescriptionWidth, description.offsetWidth);
        });

        // Second pass
        containerElement.querySelectorAll('.j1-bar').forEach(bar => {
            const container = bar.querySelector('.j1-bar-fill-container');
            const label = container.querySelector('.j1-bar-label');
            const fill = container.querySelector('.j1-bar-fill');
            const value = parseFloat(label.getAttribute('data-value'));
            const description = bar.querySelector('.j1-bar-description');

            label.textContent = dataFormatter(value) + dataSuffix;
            description.style.width = maxDescriptionWidth + 'px';
            const fillWidth = (value / maxValue) * 100;
            fill.style.width = fillWidth + '%';

            if (fill.offsetWidth < label.offsetWidth + 10) {
                label.classList.add('j1-outside');
                label.style.left = fill.offsetWidth + 'px';
            } else {
                label.classList.remove('j1-outside');
                label.style.left = '5px';
            }
        });
    }

    adjustLabels();

    contentElement.removeChild(footer);
    contentElement.appendChild(footer);

    window.addEventListener('resize', adjustLabels);
}
