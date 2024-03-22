# [scotusstats.com](https://scotusstats.com)

[scotusstats.com](https://scotusstats.com) is a tool for exploring statistics related to cases heard by the Supreme Court of the United States. It displays a range of charts and statistics, and allows users to filter cases by various criteria.

The charts are based on data from the [scdb database](http://scdb.wustl.edu/), from the [oyez.org project](https://www.oyez.org/), and from the [Supreme Court's website](https://www.supremecourt.gov/).

The website is maintained by [Dominik Peters](https://dominik-peters.de) as a side project. Feedback and bug reports are welcome. The website also hosts a [podcast feed](https://scotusstats.com/podcast) ([GitHub repository](https://github.com/DominikPeters/scotus-podcast)) of audio recordings of Supreme Court oral arguments for convenient listening, and a [video channel](https://scotusstats.com/videos) ([GitHub repository](https://github.com/DominikPeters/scotus-videos)) of Supreme Court oral arguments with synchronized transcripts.

<a href="https://scotusstats.com"><img width="1084" alt="image" src="https://github.com/DominikPeters/scotusstats/assets/3543224/92a18418-e56c-4072-ab87-1404593708f2"></a>

## Technical details

Data is fetched and processed using the scripts in the `data-pipeline` folder. 
The website sources are in the `website` folder. 
The website uses [Algolia instantsearch.js](https://github.com/algolia/instantsearch) with a [backend](https://github.com/unplatform-io/instantsearch-itemsjs-adapter) based on [ItemsJS](https://github.com/itemsapi/itemsjs) (so the client downloads the complete dataset on load) for filtering. Most charts are rendered using very simple HTML and CSS (see [this file](https://github.com/DominikPeters/scotusstats/blob/master/website/src/charts/j1Chart.js)), with more complex charts using [echarts](https://echarts.apache.org/). 
