
export function j1Chart(containerElement, options) {
    const {
        data,
        maxDataValue,
        sort = true, 
        dataFormatter = (v) => v, 
        dataSuffix = '', 
        chartColor = '#4CAF50',
        showImage = true, 
        title = '', 
        subtitle = '' 
    } = options;

    // Function to create a bar
    function createBar(justiceName, value) {
        const bar = document.createElement('div');
        bar.className = 'j1-bar';

        // Bar description
        const description = document.createElement('div');
        description.className = 'j1-bar-description';
        if (showImage) {
            const image = document.createElement('img');
            image.src = `/img/justices/${justiceName}.png`; // Assuming image naming convention
            image.alt = 'Picture of Justice ' + justiceName;
            image.className = 'j1-circle-image';
            description.appendChild(image);
        }
        const name = document.createElement('span');
        name.innerHTML = justiceName;
        description.appendChild(name);

        // Bar fill container
        const fillContainer = document.createElement('div');
        fillContainer.className = 'j1-bar-fill-container';

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
        containerElement.appendChild(bar);
    }

    // Clear existing bars
    containerElement.innerHTML = '';

    containerElement.style.setProperty('--j1-chart-color', chartColor);

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

    // Create bars
    if (sort) {
        Object.entries(data)
            .sort(([, valueA], [, valueB]) => valueB - valueA)
            .forEach(([justiceName, value]) => createBar(justiceName, value));
    } else {
        Object.entries(data)
            .forEach(([justiceName, value]) => createBar(justiceName, value));
    }

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
            const value = parseInt(label.getAttribute('data-value'));
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

    // Create footer
    const footer = document.createElement('p');
    footer.className = 'j1-chart-footer';
    footer.innerHTML = 'Chart: <a href="https://scotusstats.com/">scotusstats.com</a> ';
    containerElement.appendChild(footer);

    adjustLabels();

    window.addEventListener('resize', adjustLabels);
}
