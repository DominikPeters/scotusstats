import { elementToSVG, inlineResources } from 'dom-to-svg'

function getInnerHTML(chartContainer, chartId) {
    return `<p class="j1-share-instruction">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
        </svg>
        <strong>Share this chart</strong>:
    </p>
    <p>
        <a href="https://scotusstats.com/chart/${chartId}" target="_blank">https://scotusstats.com/chart/${chartId}</a>
    </p>
    <p class="j1-share-instruction">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-file-earmark-code" viewBox="0 0 16 16">
            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
            <path d="M8.646 6.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 9 8.646 7.354a.5.5 0 0 1 0-.708m-1.292 0a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0 0 .708l2 2a.5.5 0 0 0 .708-.708L5.707 9l1.647-1.646a.5.5 0 0 0 0-.708z"/>
        </svg>
        <strong>Embed this chart</strong>:
    </p>
    <code>
        &lt;iframe src="https://scotusstats.com/chart/embed/${chartId}" width="100%" height="${chartContainer.offsetHeight}" frameborder="0" scrolling="no"&gt;&lt;/iframe&gt;
    </code>
    <p class="j1-share-instruction">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16">
            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12"/>
        </svg>
        <strong>Download this chart</strong>:
    </p>
    <p>
        <button class="j1-download-svg-button">Download SVG</button>
    </p>
    `;
}

export function showEmbedModal(chartContainer, embedOptions) {
    const embedInfoModal = document.createElement('div');
    embedInfoModal.classList.add('j1-embed-info-modal');
    const embedInfoModalContent = document.createElement('div');
    embedInfoModalContent.classList.add('j1-embed-info-modal-content');
    embedInfoModal.appendChild(embedInfoModalContent);
    chartContainer.appendChild(embedInfoModal);


    // close modal
    function closeEmbedModal() {
        if (embedInfoModal.parentNode) {
            embedInfoModal.parentNode.removeChild(embedInfoModal);
        }
    }

    const closeButton = document.createElement('a');
    closeButton.classList.add('j1-embed-info-close');
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>`;
    embedInfoModalContent.appendChild(closeButton);

    embedInfoModal.addEventListener('click', closeEmbedModal);
    closeButton.addEventListener('click', closeEmbedModal);
    embedInfoModalContent.addEventListener('click', (e) => { e.stopPropagation(); });


    // modal text
    const embedInfoModalText = document.createElement('div');
    embedInfoModalContent.appendChild(embedInfoModalText);
    embedInfoModalContent.style.display = "none";
    embedInfoModalText.innerHTML = "";

    // after 300ms timeout, write "Loading..." if no text has been written yet
    setTimeout(() => {
        if (embedInfoModalText.innerHTML === "") {
            embedInfoModalContent.style.display = "";
            embedInfoModalText.innerHTML = `<p style="margin: 15px; margin-bottom: 5px;">Loading link...</p>`;
        }
    }, 300);


    function addSVGDownloadButton() {
        const downloadSVGButton = embedInfoModalText.querySelector('.j1-download-svg-button');
        downloadSVGButton.addEventListener('click', async () => {
            const svg = elementToSVG(chartContainer);
            await inlineResources(svg);
            // remove element with id j1-embed-info-modal1 from svg
            const embedInfoModal1 = svg.querySelector('#j1-embed-info-modal1');
            if (embedInfoModal1) {
                embedInfoModal1.parentNode.removeChild(embedInfoModal1);
            }
            // remove element j1-embed-link-container1
            const embedLinkContainer1 = svg.querySelector('#j1-embed-link-container1');
            if (embedLinkContainer1) {
                embedLinkContainer1.parentNode.removeChild(embedLinkContainer1);
            }
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = "chart.svg";
            downloadLink.click();
        });
    }

    fetch('https://scotusstats.com/chart/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'filter': JSON.stringify(embedOptions),
        })
    })
        .then(response => response.json())
        .then(data => {
            // should be "result" => "success", "id" => $id
            if (data.result === "success") {
                const chartId = data.id;
                embedInfoModalText.innerHTML = getInnerHTML(chartContainer, chartId);
                embedInfoModalContent.style.display = "";
                addSVGDownloadButton();
            } else {
                console.error("Error registering embed:", data);
            }
        });
}