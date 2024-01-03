
export function j1PyramidChart(containerElement, options) {
    const {
        leftData,
        rightData,
        maxDataValue,
        sort = true,
        dataFormatter = (v) => parseInt(v), 
        dataSuffix = '', 
        chartColor = '#4CAF50',
        showImage = false, 
        title = '', 
        subtitle = '' 
    } = options;

    // Function to create a bar
    function createBar(justiceName, leftValue, rightValue) {
        const bar = document.createElement('div');
        bar.className = 'j1-bar';

        // Bar description
        const description = document.createElement('div');
        description.className = 'j1-bar-description';
        // if (showImage) {
        //     const image = document.createElement('img');
        //     image.src = `/img/justices/${justiceName}.jpg`; // Assuming image naming convention
        //     image.alt = 'Picture of Justice ' + justiceName;
        //     image.className = 'j1-circle-image';
        //     description.appendChild(image);
        // }
        const name = document.createElement('span');
        name.innerHTML = justiceName;
        name.style.margin = '0 auto';
        description.appendChild(name);

        // Bar fill container
        const fillContainerRight = document.createElement('div');
        fillContainerRight.className = 'j1-bar-fill-container';

        // Bar fill
        const fill = document.createElement('div');
        fill.className = 'j1-bar-fill';

        // Bar label
        const label = document.createElement('span');
        label.className = 'j1-bar-label';
        label.setAttribute('data-value', rightValue);

        fillContainerRight.appendChild(fill);
        fillContainerRight.appendChild(label);

        const fillContainerLeft = document.createElement('div');
        fillContainerLeft.className = 'j1-bar-fill-container';

        // Bar fill
        const fillLeft = document.createElement('div');
        fillLeft.className = 'j1-bar-fill j1-bar-fill-left';

        // Bar label
        const labelLeft = document.createElement('span');
        labelLeft.className = 'j1-bar-label j1-bar-label-left';
        labelLeft.setAttribute('data-value', leftValue);

        fillContainerLeft.appendChild(fillLeft);
        fillContainerLeft.appendChild(labelLeft);

        bar.appendChild(fillContainerLeft);
        bar.appendChild(description);
        bar.appendChild(fillContainerRight);
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

    // Create bars
    // zip
    const leftEntries = Object.entries(leftData);
    const rightEntries = Object.entries(rightData);
    const entries = leftEntries.map((e, i) => [e, rightEntries[i]]);
    if (sort) {
        // sort by sum of two values
        entries.sort(([[, leftValueA], [, rightValueA]], [[, leftValueB], [, rightValueB]]) => (leftValueB + rightValueB) - (leftValueA + rightValueA));
    }
    entries.forEach(([[justiceName, leftValue], [, rightValue]]) => createBar(justiceName, leftValue, rightValue));

    // Adjust labels and bar widths
    function adjustLabels() {
        let maxDescriptionWidth = 0;
        const maxValue = maxDataValue || Math.max(...Object.values(leftData), ...Object.values(rightData));

        // get screen width
        const width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        // First pass
        containerElement.querySelectorAll('.j1-bar').forEach(bar => {
            const description = bar.querySelector('.j1-bar-description');
            description.style.width = 'auto';
            maxDescriptionWidth = Math.max(maxDescriptionWidth, description.offsetWidth);
        });

        // Second pass
        containerElement.querySelectorAll('.j1-bar').forEach(bar => {
            for (const container of bar.querySelectorAll('.j1-bar-fill-container')) {
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
                    if (label.classList.contains('j1-bar-label-left')) {
                        label.style.right = fill.offsetWidth + label.offsetWidth + 'px';
                    } else {
                        label.style.left = fill.offsetWidth + 'px';
                    }
                } else {
                    label.classList.remove('j1-outside');
                    if (label.classList.contains('j1-bar-label-left')) {
                        label.style.right = '5px';
                    } else {
                        label.style.left = '5px';
                    }
                }
            }
        });
    }

    // Create footer
    const footer = document.createElement('p');
    footer.className = 'j1-chart-footer';
    footer.innerHTML = 'Chart: <a href="https://scotusstats.com/">scotusstats.com</a> ';
    contentElement.appendChild(footer);

    adjustLabels();

    window.addEventListener('resize', adjustLabels);
}
