async function fetchwWordCount() {
    try {
        const response = await fetch('./../../interactive_book_word_count.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        wordCount = await response.json();

        // Transform data into an array of objects
        words = Object.keys(wordCount).map(word => ({
            text: word,
            count: wordCount[word],
            size: wordCount[word]
        }));

        console.log("Word count data fetched:", wordCount);

    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

let wordCount
let words

document.addEventListener('DOMContentLoaded', () => {
    fetchwWordCount().then(createWordCloud);
});

function createWordCloud() {
    const minCount = Math.min(...Object.values(wordCount));
    const maxCount = Math.max(...Object.values(wordCount));

    const side = Math.sqrt(window.innerWidth * window.innerHeight);
    const scaleSize = d3.scaleLinear()
        .domain([minCount, maxCount])
        .range([20 / 1000 * side, 100 / 1000 * side]);

    const tooltip = d3.select("#tooltip");

    const layout = d3.layout.cloud()
        .size([window.innerWidth, window.innerHeight])
        .words(words)
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font("Impact")
        .fontSize(d => scaleSize(d.size))
        .on("end", draw);

    layout.start();

    function draw(words) {
        const svg = d3.select("#word-cloud")
            .append("svg")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
            .append("g")
            .attr("transform", `translate(${window.innerWidth / 2},${window.innerHeight / 2})`);

        const textElements = svg.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-family", "Impact")
            .style("fill", () => `hsl(${Math.random() * 360}, 70%, 60%)`)
            .style("cursor", "pointer")
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
            .style("font-size", d => `${d.size}px`)
            .text(d => d.text);

        textElements
            .on("mouseover", function () {
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", "1px");

                tooltip.style("opacity", 1).html(`${this.__data__.text}: ${this.__data__.count}`);
            })
            .on("mousemove", function () {
                const fontSize = parseFloat(d3.select(this).style("font-size"));
                tooltip.style("left", `${window.event.pageX + fontSize / 2}px`)
                    .style("top", `${window.event.pageY + fontSize / 2}px`);
            })
            .on("mouseout", function () {
                d3.select(this).style("stroke", "none");
                tooltip.style("opacity", 0);
            });
    }

}


